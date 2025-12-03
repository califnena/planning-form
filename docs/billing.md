# Billing & Subscription System

This document describes the billing architecture for Everlasting Funeral Advisors.

## Overview

The billing system uses:
- **Stripe** for payment processing
- **`public.subscriptions`** table for tracking subscription status
- **`public.purchases`** table for one-time purchases
- **`public.user_roles` + `public.app_roles`** for access control (single source of truth)

## Stripe Price → Plan Code → Roles Mapping

All mappings are defined in `src/lib/billingPlans.ts`:

| Stripe Lookup Key | Plan Code | Roles Granted |
|-------------------|-----------|---------------|
| `EFABASIC` | `basic` | `basic`, `printable` |
| `EFAPREMIUM` | `premium` | `basic`, `vip`, `printable` |
| `EFAPREMIUMYEAR` | `premium` | `basic`, `vip`, `printable` |
| `EFAVIPYEAR` | `vip_annual` | `vip`, `printable` |
| `EFAVIPMONTHLY` | `vip_monthly` | `vip`, `printable` |
| `EFADOFORU` | `done_for_you` | `done_for_you`, `basic`, `printable` |
| `EFABINDER` | `binder` | `binder` |
| `STRIPE_STANDARD_SONG_PRICE_ID` | `song_standard` | `song_standard` |
| `STRIPE_PREMIUM_SONG_PRICE_ID` | `song_premium` | `song_premium` |

## Edge Functions

### `stripe-create-checkout`
Creates Stripe Checkout sessions with user metadata for role assignment.

### `stripe-webhook`
Handles Stripe events:
- `checkout.session.completed` - Grants roles, creates subscription/purchase records
- `invoice.paid` - Refreshes roles for recurring payments
- `customer.subscription.updated` - Updates subscription status
- `customer.subscription.deleted` - Revokes subscription-based roles
- `invoice.payment_failed` - Marks subscription as `past_due`

### `stripe-portal`
Creates Stripe Customer Portal sessions for self-service billing management.

## Access Check Functions

Located in `src/lib/accessChecks.ts`:

```typescript
// Check if user has paid access (basic or vip)
await checkPaidAccess(userId)

// Check if user has VIP access
await checkVIPAccess(userId)

// Check if user can print/download
await checkPrintableAccess(userId)

// Check for specific role
await checkHasRole(userId, 'done_for_you')
```

All access checks:
1. First check for `admin` role (bypass)
2. Then check for specific role via `has_app_role` RPC

## Database Tables

### `public.subscriptions`
Tracks Stripe subscription status:
- `user_id` - User reference
- `plan_type` - Plan code (e.g., `vip_annual`)
- `status` - `active`, `trialing`, `past_due`, `canceled`, etc.
- `stripe_customer_id` - For portal sessions
- `stripe_subscription_id` - For webhook identification
- `current_period_start/end` - Billing period
- `cancel_at_period_end` - Pending cancellation flag

### `public.purchases`
Tracks one-time purchases:
- `user_id` - User reference
- `product_lookup_key` - Stripe lookup key
- `status` - `completed`, `pending`, etc.
- `amount` - Amount paid (in cents)

### `public.user_roles`
Grants feature access:
- `user_id` - User reference
- `role_id` - Reference to `app_roles`

## Testing Flow

### 1. Create Test User
Sign up with a test email.

### 2. Run Test Checkout
```bash
# In browser, trigger checkout for any plan
# Use Stripe test card: 4242 4242 4242 4242
```

### 3. Verify Roles
```sql
SELECT ar.name, ur.created_at
FROM user_roles ur
JOIN app_roles ar ON ar.id = ur.role_id
WHERE ur.user_id = '<user-id>';
```

### 4. Verify Subscription
```sql
SELECT plan_type, status, current_period_end, cancel_at_period_end
FROM subscriptions
WHERE user_id = '<user-id>';
```

### 5. Verify UI Access
- Dashboard should show unlocked features
- Billing page should show current plan and renewal date

## Adding a New Product

1. **Create Stripe Price**
   - Add price in Stripe Dashboard
   - Set lookup key (e.g., `EFANEWPLAN`)

2. **Add Role** (if needed)
   ```sql
   INSERT INTO app_roles (name, description)
   VALUES ('new_feature', 'Access to new feature');
   ```

3. **Update Mapping**
   In `src/lib/billingPlans.ts`:
   ```typescript
   EFANEWPLAN: {
     planCode: 'new_plan',
     roles: ['new_feature', 'basic'],
     name: 'New Plan',
     description: 'Description here',
     isSubscription: true,
     features: ['Feature 1', 'Feature 2']
   }
   ```

4. **Update Webhook** (if using different lookup key pattern)
   The webhook in `stripe-webhook/index.ts` has a mirrored `PLAN_DEFINITIONS` object.

5. **Add Access Check** (if needed)
   In `src/lib/accessChecks.ts`:
   ```typescript
   export async function checkNewFeatureAccess(userId: string): Promise<boolean> {
     return await checkHasRole(userId, 'new_feature');
   }
   ```

## Admin Bypass

Users with the `admin` role bypass all subscription checks. This is handled in `checkHasRole()`:

```typescript
// Admin check first
const { data: isAdmin } = await supabase.rpc('has_app_role', {
  _user_id: userId,
  _role: 'admin'
});
if (isAdmin) return true;
```

## Support Contact

For billing issues not resolvable via Stripe Portal:
- Email: support@everlastingfuneraladvisors.com
