-- Add 'trusted_contact' and 'coach' to app_role enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'public.app_role'::regtype AND enumlabel = 'trusted_contact') THEN
    ALTER TYPE public.app_role ADD VALUE 'trusted_contact';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'public.app_role'::regtype AND enumlabel = 'coach') THEN
    ALTER TYPE public.app_role ADD VALUE 'coach';
  END IF;
END $$;

-- Create trusted_contact_permissions table
-- This controls what a trusted contact can see for a specific org/plan
CREATE TABLE IF NOT EXISTS public.trusted_contact_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.orgs(id) ON DELETE CASCADE NOT NULL,
  trusted_user_id uuid NOT NULL,
  granted_by_user_id uuid NOT NULL,
  can_view_after_death_planner boolean DEFAULT false,
  can_view_after_death_checklist boolean DEFAULT false,
  can_view_instructions boolean DEFAULT false,
  can_view_shared_documents boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(org_id, trusted_user_id)
);

-- Enable RLS
ALTER TABLE public.trusted_contact_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: Account holders (owners) can manage permissions for their org
CREATE POLICY "Owners can manage trusted contact permissions"
  ON public.trusted_contact_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = trusted_contact_permissions.org_id
        AND om.user_id = auth.uid()
        AND om.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = trusted_contact_permissions.org_id
        AND om.user_id = auth.uid()
        AND om.role = 'owner'
    )
  );

-- Policy: Trusted contacts can view their own permissions
CREATE POLICY "Trusted contacts can view their own permissions"
  ON public.trusted_contact_permissions
  FOR SELECT
  TO authenticated
  USING (trusted_user_id = auth.uid());

-- Create helper function to get user's role for an org
CREATE OR REPLACE FUNCTION public.get_user_org_role(_user_id uuid, _org_id uuid)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.org_members
  WHERE user_id = _user_id AND org_id = _org_id
  LIMIT 1
$$;

-- Create helper function to check if user is trusted contact with specific permission
CREATE OR REPLACE FUNCTION public.has_trusted_permission(_user_id uuid, _org_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE _permission
    WHEN 'after_death_planner' THEN can_view_after_death_planner
    WHEN 'after_death_checklist' THEN can_view_after_death_checklist
    WHEN 'instructions' THEN can_view_instructions
    WHEN 'shared_documents' THEN can_view_shared_documents
    ELSE false
  END
  FROM public.trusted_contact_permissions
  WHERE trusted_user_id = _user_id AND org_id = _org_id
$$;

-- Add updated_at trigger
CREATE TRIGGER update_trusted_contact_permissions_updated_at
  BEFORE UPDATE ON public.trusted_contact_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();