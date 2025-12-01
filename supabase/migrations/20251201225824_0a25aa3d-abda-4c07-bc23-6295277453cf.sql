
-- Step 1: Recreate app_role enum (needed for org_members organizational roles)
CREATE TYPE public.app_role AS ENUM ('owner', 'member', 'executor', 'admin', 'vip');

-- Step 2: Add role column back to org_members
ALTER TABLE public.org_members 
ADD COLUMN role app_role NOT NULL DEFAULT 'member'::app_role;

-- Step 3: Create index for org_members role lookups
CREATE INDEX IF NOT EXISTS idx_org_members_role ON public.org_members(role);

-- Note: This enum is separate from the app_roles table system
-- - app_roles table + user_roles = user system-wide roles (admin, vip, etc.)
-- - app_role enum + org_members.role = organization membership roles (owner, member, executor)
