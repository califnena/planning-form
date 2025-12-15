-- Add org_id to cases table for admin access path
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.orgs(id);
CREATE INDEX IF NOT EXISTS idx_cases_org_id ON public.cases(org_id);

-- Contacts: owner write, admin/executor read
DROP POLICY IF EXISTS contacts_select ON public.contacts;
DROP POLICY IF EXISTS contacts_insert ON public.contacts;
DROP POLICY IF EXISTS contacts_update ON public.contacts;
DROP POLICY IF EXISTS contacts_delete ON public.contacts;

-- READ: owner OR org admin/owner/executor
CREATE POLICY contacts_select
ON public.contacts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.cases c
    WHERE c.id = contacts.case_id
      AND (
        c.user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.org_members om
          WHERE om.org_id = c.org_id
            AND om.user_id = auth.uid()
            AND om.role IN ('admin','owner','executor')
        )
      )
  )
);

-- WRITE: case owner only
CREATE POLICY contacts_insert
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

CREATE POLICY contacts_update
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

CREATE POLICY contacts_delete
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