-- Fix the has_org_role function to work with app_role enum
CREATE OR REPLACE FUNCTION public.has_org_role(_user_id uuid, _org_id uuid, _roles text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_members om
    WHERE om.org_id = _org_id
      AND om.user_id = _user_id
      AND om.role::text = ANY (_roles)
  );
$$;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "org_members: self read" ON public.org_members;
DROP POLICY IF EXISTS "org_members: owner/admin manage" ON public.org_members;
DROP POLICY IF EXISTS "Members can view their own org membership" ON public.org_members;
DROP POLICY IF EXISTS "Org admins can manage memberships" ON public.org_members;
DROP POLICY IF EXISTS "org_members_self_read" ON public.org_members;
DROP POLICY IF EXISTS "org_members_admin_manage" ON public.org_members;

-- Create new policies
-- Members can read their own membership rows
CREATE POLICY "org_members_self_read"
ON public.org_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Owner/admin can manage org memberships
CREATE POLICY "org_members_admin_manage"
ON public.org_members
FOR ALL
TO authenticated
USING (public.has_org_role(auth.uid(), org_id, ARRAY['owner','admin']))
WITH CHECK (public.has_org_role(auth.uid(), org_id, ARRAY['owner','admin']));