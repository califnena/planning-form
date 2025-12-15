-- 1) Drop ALL existing org_members policies first
DROP POLICY IF EXISTS "Users can view org members of their orgs" ON public.org_members;
DROP POLICY IF EXISTS "Org owners can update members" ON public.org_members;
DROP POLICY IF EXISTS "Org owners can delete members" ON public.org_members;
DROP POLICY IF EXISTS "Org admins can insert members" ON public.org_members;
DROP POLICY IF EXISTS org_members_select ON public.org_members;
DROP POLICY IF EXISTS org_members_insert ON public.org_members;
DROP POLICY IF EXISTS org_members_update ON public.org_members;
DROP POLICY IF EXISTS org_members_delete ON public.org_members;

-- 2) Drop and recreate helper functions
DROP FUNCTION IF EXISTS public.is_org_owner(uuid, uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.is_org_member(_org_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_members om
    WHERE om.org_id = _org_id
      AND om.user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(_org_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_members om
    WHERE om.org_id = _org_id
      AND om.user_id = _user_id
      AND om.role IN ('owner','admin')
  );
$$;

CREATE FUNCTION public.is_org_owner(_org_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_members om
    WHERE om.org_id = _org_id
      AND om.user_id = _user_id
      AND om.role = 'owner'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_owner(uuid, uuid) TO authenticated;

-- 3) Create non-recursive policies using helper functions
CREATE POLICY org_members_select
ON public.org_members
FOR SELECT
TO authenticated
USING (public.is_org_member(org_id, auth.uid()));

CREATE POLICY org_members_insert
ON public.org_members
FOR INSERT
TO authenticated
WITH CHECK (public.is_org_admin(org_id, auth.uid()));

CREATE POLICY org_members_update
ON public.org_members
FOR UPDATE
TO authenticated
USING (public.is_org_admin(org_id, auth.uid()))
WITH CHECK (public.is_org_admin(org_id, auth.uid()));

CREATE POLICY org_members_delete
ON public.org_members
FOR DELETE
TO authenticated
USING (public.is_org_owner(org_id, auth.uid()));