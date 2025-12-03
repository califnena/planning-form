# Access Control & Stripe Integration Flow

This document explains how Stripe payments grant feature access in the Everlasting Funeral Advisors app.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User Checkout  │────>│  Stripe Webhook  │────>│   user_roles    │
│  (Frontend)     │     │  (Edge Function) │     │   (Database)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │  Access Checks  │
                                               │  (accessChecks) │
                                               └─────────────────┘
```

## Single Source of Truth: Roles

Access is controlled entirely through the role system:

- **Tables**: `public.app_roles`, `public.user_roles`
- **Functions**: `has_app_role(_user_id, _role)`, `has_vip_access(_user_id)`

## Role Definitions

| Role | Description | Stripe Products |
|------|-------------|-----------------|
| `admin` | Full system access, bypasses all paywalls | Manual assignment only |
| `basic` | Standard paid planner access | EFABASIC, EFAPREMIUM, EFADOFORU |
| `vip` | VIP Coach + premium features | EFAVIPYEAR, EFAVIPMONTHLY, EFAPREMIUM |
| `printable` | Printable workbook downloads | All paid plans |
| `done_for_you` | Do It For You service | EFADOFORU |
| `song_standard` | Standard custom song | STRIPE_STANDARD_SONG_PRICE_ID |
| `song_premium` | Premium custom song | STRIPE_PREMIUM_SONG_PRICE_ID |
| `binder` | Physical binder purchase | EFABINDER |

## Stripe Lookup Key → Role Mapping

Located in: `src/lib/stripeRoleMapping.ts`

```typescript
const STRIPE_TO_ROLES_MAP = {
  'EFABASIC': ['basic', 'printable'],
  'EFAPREMIUM': ['basic', 'vip', 'printable'],
  'EFAPREMIUMYEAR': ['basic', 'vip', 'printable'],
  'EFAVIPYEAR': ['vip', 'printable'],
  'EFAVIPMONTHLY': ['vip', 'printable'],
  'EFADOFORU': ['done_for_you', 'basic', 'printable'],
  'EFABINDER': ['binder'],
  'STRIPE_STANDARD_SONG_PRICE_ID': ['song_standard'],
  'STRIPE_PREMIUM_SONG_PRICE_ID': ['song_premium'],
};
```

## Webhook Edge Function

**File**: `supabase/functions/stripe-webhook/index.ts`

Handles these Stripe events:
- `checkout.session.completed` - Grants roles for new purchases
- `invoice.paid` - Refreshes roles for recurring subscriptions
- `customer.subscription.deleted` - Removes subscription-based roles

### How it works:

1. Receives webhook from Stripe
2. Extracts `user_id` from session metadata or looks up by email
3. Retrieves line items to get price lookup keys
4. Maps lookup keys to roles using `STRIPE_TO_ROLES_MAP`
5. Upserts roles into `user_roles` table (idempotent)

## Access Check Functions

**File**: `src/lib/accessChecks.ts`

| Function | Purpose |
|----------|---------|
| `checkPaidAccess()` | Has basic, vip, or done_for_you role |
| `checkVIPAccess()` | Has vip or admin role |
| `checkPrintableAccess()` | Has printable or vip role |
| `checkIsFreePlan()` | No paid roles |
| `checkDoneForYouAccess()` | Has done_for_you role |
| `checkSongStandardAccess()` | Has song_standard role |
| `checkSongPremiumAccess()` | Has song_premium role |

All functions check `admin` role first (admin bypasses all paywalls).

## Testing

### 1. Create Test User
```sql
-- Check user exists
SELECT id, email FROM auth.users WHERE email = 'test@example.com';
```

### 2. Verify Roles After Purchase
```sql
-- Check user's roles
SELECT ur.user_id, ar.name as role_name, ar.description
FROM user_roles ur
JOIN app_roles ar ON ar.id = ur.role_id
WHERE ur.user_id = '<user-id>';
```

### 3. Manually Grant Role (for testing)
```sql
-- Get role ID
SELECT id FROM app_roles WHERE name = 'vip';

-- Grant role to user
INSERT INTO user_roles (user_id, role_id)
VALUES ('<user-id>', '<role-id>')
ON CONFLICT (user_id, role_id) DO NOTHING;
```

### 4. Test Access Check
```typescript
import { checkVIPAccess, checkPaidAccess } from '@/lib/accessChecks';

const hasVIP = await checkVIPAccess();
const hasPaid = await checkPaidAccess();
console.log({ hasVIP, hasPaid });
```

## Adding a New Product

1. **Create Price in Stripe**
   - Add a new price with a `lookup_key` (e.g., `EFANEWPRODUCT`)

2. **Add Role (if needed)**
   ```sql
   INSERT INTO app_roles (name, description)
   VALUES ('new_feature', 'Access to new feature');
   ```

3. **Update Role Mapping**
   
   In `src/lib/stripeRoleMapping.ts`:
   ```typescript
   'EFANEWPRODUCT': ['new_feature'],
   ```
   
   In `supabase/functions/stripe-webhook/index.ts`:
   ```typescript
   'EFANEWPRODUCT': ['new_feature'],
   ```

4. **Add Access Check Function** (if needed)
   
   In `src/lib/accessChecks.ts`:
   ```typescript
   export async function checkNewFeatureAccess(): Promise<boolean> {
     return checkHasRole('new_feature');
   }
   ```

5. **Update UI** to use the new access check

## Stripe Webhook Setup

The webhook endpoint is: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`

Required Stripe events to enable:
- `checkout.session.completed`
- `invoice.paid`
- `customer.subscription.deleted`

Environment secrets required:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (optional but recommended for production)

## Files Changed

| File | Purpose |
|------|---------|
| `src/lib/stripeRoleMapping.ts` | Stripe lookup key → role mapping |
| `src/lib/accessChecks.ts` | Unified access check functions |
| `supabase/functions/stripe-webhook/index.ts` | Webhook handler |
| `supabase/functions/stripe-create-checkout/index.ts` | Includes user metadata |
| `src/pages/Dashboard.tsx` | Uses accessChecks functions |
