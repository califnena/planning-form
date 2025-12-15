-- Drop existing policies on org_members that may cause recursion
DROP POLICY IF EXISTS "Members can view their org" ON public.org_members;
DROP POLICY IF EXISTS "Admins can manage org members" ON public.org_members;
DROP POLICY IF EXISTS "Users can view their own membership" ON public.org_members;
DROP POLICY IF EXISTS "Org admins can insert members" ON public.org_members;
DROP POLICY IF EXISTS "Org admins can update members" ON public.org_members;
DROP POLICY IF EXISTS "Org admins can delete members" ON public.org_members;

-- Create SECURITY DEFINER function to check org membership without RLS recursion
CREATE OR REPLACE FUNCTION public.check_org_membership(_org_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_members
    WHERE org_id = _org_id
      AND user_id = _user_id
  )
$$;

-- Create SECURITY DEFINER function to check org admin status without RLS recursion
CREATE OR REPLACE FUNCTION public.check_org_admin(_org_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_members
    WHERE org_id = _org_id
      AND user_id = _user_id
      AND role IN ('owner', 'admin')
  )
$$;

-- Create new RLS policies using the SECURITY DEFINER functions
-- Users can view their own org memberships
CREATE POLICY "Users can view own memberships"
ON public.org_members
FOR SELECT
USING (user_id = auth.uid());

-- Users can view other members in orgs they belong to (using SECURITY DEFINER function)
CREATE POLICY "Members can view org members"
ON public.org_members
FOR SELECT
USING (public.check_org_membership(org_id, auth.uid()));

-- Org admins/owners can insert new members
CREATE POLICY "Org admins can insert members"
ON public.org_members
FOR INSERT
WITH CHECK (public.check_org_admin(org_id, auth.uid()));

-- Org admins/owners can update members
CREATE POLICY "Org admins can update members"
ON public.org_members
FOR UPDATE
USING (public.check_org_admin(org_id, auth.uid()))
WITH CHECK (public.check_org_admin(org_id, auth.uid()));

-- Org admins/owners can delete members (but not themselves if owner)
CREATE POLICY "Org admins can delete members"
ON public.org_members
FOR DELETE
USING (public.check_org_admin(org_id, auth.uid()) AND user_id != auth.uid());