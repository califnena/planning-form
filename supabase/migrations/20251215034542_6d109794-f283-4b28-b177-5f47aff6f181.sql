-- Contacts table: explicit RLS policies (scanner-friendly)
DROP POLICY IF EXISTS "Users can access contacts for their cases" ON public.contacts;
DROP POLICY IF EXISTS contacts_select ON public.contacts;
DROP POLICY IF EXISTS contacts_insert ON public.contacts;
DROP POLICY IF EXISTS contacts_update ON public.contacts;
DROP POLICY IF EXISTS contacts_delete ON public.contacts;

CREATE POLICY contacts_select
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

-- Investments table: explicit RLS policies with executor/admin read access
DROP POLICY IF EXISTS "Users can access investments for their plans" ON public.investments;
DROP POLICY IF EXISTS investments_select ON public.investments;
DROP POLICY IF EXISTS investments_insert ON public.investments;
DROP POLICY IF EXISTS investments_update ON public.investments;
DROP POLICY IF EXISTS investments_delete ON public.investments;

-- Read: owner OR executor/admin in org
CREATE POLICY investments_select
ON public.investments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.plans p
    WHERE p.id = investments.plan_id
      AND (
        p.owner_user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.org_members om
          WHERE om.org_id = p.org_id
            AND om.user_id = auth.uid()
            AND om.role IN ('executor','admin','owner')
        )
      )
  )
);

-- Write: owner only (safer)
CREATE POLICY investments_insert
ON public.investments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.plans p
    WHERE p.id = investments.plan_id
      AND p.owner_user_id = auth.uid()
  )
);

CREATE POLICY investments_update
ON public.investments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.plans p
    WHERE p.id = investments.plan_id
      AND p.owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.plans p
    WHERE p.id = investments.plan_id
      AND p.owner_user_id = auth.uid()
  )
);

CREATE POLICY investments_delete
ON public.investments
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.plans p
    WHERE p.id = investments.plan_id
      AND p.owner_user_id = auth.uid()
  )
);