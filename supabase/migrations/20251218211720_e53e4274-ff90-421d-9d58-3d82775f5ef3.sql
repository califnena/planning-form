-- Ensure RLS is enabled
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on contacts to clean up duplicates
DROP POLICY IF EXISTS "contacts: case owner can delete" ON public.contacts;
DROP POLICY IF EXISTS "contacts: case owner can insert" ON public.contacts;
DROP POLICY IF EXISTS "contacts: case owner can read" ON public.contacts;
DROP POLICY IF EXISTS "contacts: case owner can update" ON public.contacts;
DROP POLICY IF EXISTS "contacts_delete" ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert" ON public.contacts;
DROP POLICY IF EXISTS "contacts_select" ON public.contacts;
DROP POLICY IF EXISTS "contacts_update" ON public.contacts;
DROP POLICY IF EXISTS "contacts: owner can read" ON public.contacts;
DROP POLICY IF EXISTS "contacts: owner can insert" ON public.contacts;
DROP POLICY IF EXISTS "contacts: owner can update" ON public.contacts;
DROP POLICY IF EXISTS "contacts: owner can delete" ON public.contacts;

-- Create strict policies: ONLY case owner can access contacts
CREATE POLICY "contacts: owner can read"
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

CREATE POLICY "contacts: owner can insert"
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

CREATE POLICY "contacts: owner can update"
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

CREATE POLICY "contacts: owner can delete"
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