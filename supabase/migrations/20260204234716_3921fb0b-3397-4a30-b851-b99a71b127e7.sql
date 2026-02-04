-- Enable Row Level Security on personal_profiles
ALTER TABLE public.personal_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.personal_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.personal_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.personal_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.personal_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.personal_profiles;

-- Policy: Users can SELECT their own personal_profiles (via plan ownership)
CREATE POLICY "Users can view their own profile"
ON public.personal_profiles
FOR SELECT
TO authenticated
USING (
  public.is_plan_owner(auth.uid(), plan_id)
  OR public.has_app_role(auth.uid(), 'admin')
);

-- Policy: Users can INSERT their own personal_profiles (via plan ownership)
CREATE POLICY "Users can insert their own profile"
ON public.personal_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_plan_owner(auth.uid(), plan_id)
);

-- Policy: Users can UPDATE their own personal_profiles (via plan ownership)
CREATE POLICY "Users can update their own profile"
ON public.personal_profiles
FOR UPDATE
TO authenticated
USING (
  public.is_plan_owner(auth.uid(), plan_id)
)
WITH CHECK (
  public.is_plan_owner(auth.uid(), plan_id)
);

-- Policy: Users can DELETE their own personal_profiles (via plan ownership)
CREATE POLICY "Users can delete their own profile"
ON public.personal_profiles
FOR DELETE
TO authenticated
USING (
  public.is_plan_owner(auth.uid(), plan_id)
);