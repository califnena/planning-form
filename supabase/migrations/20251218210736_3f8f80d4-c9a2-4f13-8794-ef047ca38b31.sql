-- 1) CONTACTS: Lock down to case owner only
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "contacts: case owner can read" ON public.contacts;
DROP POLICY IF EXISTS "contacts: case owner can insert" ON public.contacts;
DROP POLICY IF EXISTS "contacts: case owner can update" ON public.contacts;
DROP POLICY IF EXISTS "contacts: case owner can delete" ON public.contacts;

CREATE POLICY "contacts: case owner can read"
ON public.contacts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.cases c
    WHERE c.id = contacts.case_id
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY "contacts: case owner can insert"
ON public.contacts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cases c
    WHERE c.id = contacts.case_id
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY "contacts: case owner can update"
ON public.contacts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.cases c
    WHERE c.id = contacts.case_id
      AND c.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cases c
    WHERE c.id = contacts.case_id
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY "contacts: case owner can delete"
ON public.contacts
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.cases c
    WHERE c.id = contacts.case_id
      AND c.user_id = auth.uid()
  )
);

-- 2) VENDOR_DIRECTORY: Allow authenticated users to read (public vendor info)
ALTER TABLE public.vendor_directory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vendor_directory: authenticated can read" ON public.vendor_directory;

CREATE POLICY "vendor_directory: authenticated can read"
ON public.vendor_directory
FOR SELECT
TO authenticated
USING (true);

-- 3) USER_LOGIN_STATS: Users can only see their own stats
-- Note: This is a VIEW, so we need to check if RLS applies or if we need to secure the underlying table

-- For the underlying user_logins table (if it exists and needs RLS)
ALTER TABLE public.user_logins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_logins: user can read own" ON public.user_logins;
DROP POLICY IF EXISTS "user_logins: user can insert own" ON public.user_logins;

CREATE POLICY "user_logins: user can read own"
ON public.user_logins
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "user_logins: user can insert own"
ON public.user_logins
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());