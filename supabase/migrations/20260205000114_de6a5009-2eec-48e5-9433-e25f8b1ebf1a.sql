-- 1) personal_profiles: owner-only access via plan ownership
ALTER TABLE public.personal_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "personal_profiles_select_own" ON public.personal_profiles;
CREATE POLICY "personal_profiles_select_own"
ON public.personal_profiles
FOR SELECT
TO authenticated
USING (public.is_plan_owner(auth.uid(), plan_id));

DROP POLICY IF EXISTS "personal_profiles_insert_own" ON public.personal_profiles;
CREATE POLICY "personal_profiles_insert_own"
ON public.personal_profiles
FOR INSERT
TO authenticated
WITH CHECK (public.is_plan_owner(auth.uid(), plan_id));

DROP POLICY IF EXISTS "personal_profiles_update_own" ON public.personal_profiles;
CREATE POLICY "personal_profiles_update_own"
ON public.personal_profiles
FOR UPDATE
TO authenticated
USING (public.is_plan_owner(auth.uid(), plan_id))
WITH CHECK (public.is_plan_owner(auth.uid(), plan_id));

DROP POLICY IF EXISTS "personal_profiles_delete_own" ON public.personal_profiles;
CREATE POLICY "personal_profiles_delete_own"
ON public.personal_profiles
FOR DELETE
TO authenticated
USING (public.is_plan_owner(auth.uid(), plan_id));

-- 2) contacts: case owner or admin can read, case owner can manage
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contacts_select_own_or_admin" ON public.contacts;
CREATE POLICY "contacts_select_own_or_admin"
ON public.contacts
FOR SELECT
TO authenticated
USING (
  public.is_case_owner(auth.uid(), case_id) 
  OR public.has_app_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "contacts_insert_own" ON public.contacts;
CREATE POLICY "contacts_insert_own"
ON public.contacts
FOR INSERT
TO authenticated
WITH CHECK (public.is_case_owner(auth.uid(), case_id));

DROP POLICY IF EXISTS "contacts_update_own" ON public.contacts;
CREATE POLICY "contacts_update_own"
ON public.contacts
FOR UPDATE
TO authenticated
USING (public.is_case_owner(auth.uid(), case_id))
WITH CHECK (public.is_case_owner(auth.uid(), case_id));

DROP POLICY IF EXISTS "contacts_delete_own" ON public.contacts;
CREATE POLICY "contacts_delete_own"
ON public.contacts
FOR DELETE
TO authenticated
USING (public.is_case_owner(auth.uid(), case_id));