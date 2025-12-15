-- Enable RLS on org_members
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS org_members_select ON public.org_members;
DROP POLICY IF EXISTS org_members_update ON public.org_members;
DROP POLICY IF EXISTS org_members_insert ON public.org_members;
DROP POLICY IF EXISTS org_members_delete ON public.org_members;

-- Any org member can see who is in their org
CREATE POLICY org_members_select
ON public.org_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.org_members om
    WHERE om.org_id = org_members.org_id
      AND om.user_id = auth.uid()
  )
);

-- Only org owner/admin can add members
CREATE POLICY org_members_insert
ON public.org_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.org_members om
    WHERE om.org_id = org_members.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner','admin')
  )
);

-- Only org owner/admin can change roles
CREATE POLICY org_members_update
ON public.org_members
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.org_members om
    WHERE om.org_id = org_members.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner','admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.org_members om
    WHERE om.org_id = org_members.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner','admin')
  )
);

-- Only org owner can remove members
CREATE POLICY org_members_delete
ON public.org_members
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.org_members om
    WHERE om.org_id = org_members.org_id
      AND om.user_id = auth.uid()
      AND om.role = 'owner'
  )
);