-- Enable Row Level Security on contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can view all contacts" ON public.contacts;

-- Policy: Users can SELECT contacts for cases they own, OR admins can view all
CREATE POLICY "Users can view own contacts"
ON public.contacts
FOR SELECT
TO authenticated
USING (
  public.is_case_owner(auth.uid(), case_id)
  OR public.has_app_role(auth.uid(), 'admin')
);

-- Policy: Users can INSERT contacts for cases they own
CREATE POLICY "Users can insert own contacts"
ON public.contacts
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_case_owner(auth.uid(), case_id)
);

-- Policy: Users can UPDATE contacts for cases they own
CREATE POLICY "Users can update own contacts"
ON public.contacts
FOR UPDATE
TO authenticated
USING (
  public.is_case_owner(auth.uid(), case_id)
)
WITH CHECK (
  public.is_case_owner(auth.uid(), case_id)
);

-- Policy: Users can DELETE contacts for cases they own
CREATE POLICY "Users can delete own contacts"
ON public.contacts
FOR DELETE
TO authenticated
USING (
  public.is_case_owner(auth.uid(), case_id)
);