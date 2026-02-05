-- =====================================================
-- SECURITY FIX: Clean up and secure contacts & personal_profiles tables
-- =====================================================

-- 1) CONTACTS TABLE: Drop all existing policies and create clean ones
-- Drop all existing duplicate policies
DROP POLICY IF EXISTS "Users can delete own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can view own contacts" ON public.contacts;
DROP POLICY IF EXISTS "contacts: owner can delete" ON public.contacts;
DROP POLICY IF EXISTS "contacts: owner can insert" ON public.contacts;
DROP POLICY IF EXISTS "contacts: owner can read" ON public.contacts;
DROP POLICY IF EXISTS "contacts: owner can update" ON public.contacts;
DROP POLICY IF EXISTS "contacts_delete_own" ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert_own" ON public.contacts;
DROP POLICY IF EXISTS "contacts_select_own_or_admin" ON public.contacts;
DROP POLICY IF EXISTS "contacts_update_own" ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert_any" ON public.contacts;
DROP POLICY IF EXISTS "contacts_select_admin_only" ON public.contacts;

-- Ensure RLS is enabled
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create clean policies: only case owners or admins can access
CREATE POLICY "contacts_select_owner_or_admin"
ON public.contacts FOR SELECT TO authenticated
USING (is_case_owner(auth.uid(), case_id) OR has_app_role(auth.uid(), 'admin'));

CREATE POLICY "contacts_insert_owner"
ON public.contacts FOR INSERT TO authenticated
WITH CHECK (is_case_owner(auth.uid(), case_id));

CREATE POLICY "contacts_update_owner"
ON public.contacts FOR UPDATE TO authenticated
USING (is_case_owner(auth.uid(), case_id))
WITH CHECK (is_case_owner(auth.uid(), case_id));

CREATE POLICY "contacts_delete_owner"
ON public.contacts FOR DELETE TO authenticated
USING (is_case_owner(auth.uid(), case_id));

-- 2) PERSONAL_PROFILES TABLE: Drop all existing policies and create clean ones
DROP POLICY IF EXISTS "Users can access personal profiles for their plans" ON public.personal_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.personal_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.personal_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.personal_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.personal_profiles;
DROP POLICY IF EXISTS "personal_profiles_delete_own" ON public.personal_profiles;
DROP POLICY IF EXISTS "personal_profiles_insert_own" ON public.personal_profiles;
DROP POLICY IF EXISTS "personal_profiles_select_own" ON public.personal_profiles;
DROP POLICY IF EXISTS "personal_profiles_update_own" ON public.personal_profiles;

-- Ensure RLS is enabled
ALTER TABLE public.personal_profiles ENABLE ROW LEVEL SECURITY;

-- Create clean policies: only plan owners, executors, or admins can access
CREATE POLICY "personal_profiles_select_owner_or_admin"
ON public.personal_profiles FOR SELECT TO authenticated
USING (is_plan_owner(auth.uid(), plan_id) OR has_executor_access(auth.uid(), plan_id) OR has_app_role(auth.uid(), 'admin'));

CREATE POLICY "personal_profiles_insert_owner"
ON public.personal_profiles FOR INSERT TO authenticated
WITH CHECK (is_plan_owner(auth.uid(), plan_id));

CREATE POLICY "personal_profiles_update_owner"
ON public.personal_profiles FOR UPDATE TO authenticated
USING (is_plan_owner(auth.uid(), plan_id))
WITH CHECK (is_plan_owner(auth.uid(), plan_id));

CREATE POLICY "personal_profiles_delete_owner"
ON public.personal_profiles FOR DELETE TO authenticated
USING (is_plan_owner(auth.uid(), plan_id));