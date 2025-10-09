-- Drop the problematic policies
DROP POLICY IF EXISTS "Org owners can manage members" ON public.org_members;
DROP POLICY IF EXISTS "Users can add themselves to orgs" ON public.org_members;
DROP POLICY IF EXISTS "Users can view org members of their orgs" ON public.org_members;

-- Create a helper function to check org ownership without recursion
CREATE OR REPLACE FUNCTION public.is_org_owner(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_members
    WHERE user_id = _user_id
      AND org_id = _org_id
      AND role = 'owner'
  )
$$;

-- Recreate org_members policies with the helper function
CREATE POLICY "Users can view org members of their orgs"
  ON public.org_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    public.is_org_owner(auth.uid(), org_id)
  );

CREATE POLICY "Users can insert themselves as members"
  ON public.org_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Org owners can update members"
  ON public.org_members FOR UPDATE
  USING (public.is_org_owner(auth.uid(), org_id));

CREATE POLICY "Org owners can delete members"
  ON public.org_members FOR DELETE
  USING (public.is_org_owner(auth.uid(), org_id));