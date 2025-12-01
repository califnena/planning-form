
-- Step 1: Create app_roles table
CREATE TABLE IF NOT EXISTS public.app_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 2: Seed standard roles
INSERT INTO public.app_roles (name, description) VALUES
  ('admin', 'Full system access, bypasses all paywalls and restrictions'),
  ('vip', 'VIP Coach Assistant access and premium features'),
  ('basic', 'Basic subscription access'),
  ('owner', 'Organization owner role'),
  ('member', 'Organization member role'),
  ('executor', 'Estate executor access')
ON CONFLICT (name) DO NOTHING;

-- Step 3: Backup existing user_roles data
CREATE TEMP TABLE user_roles_backup AS 
SELECT user_id, role::text as role_name, created_at 
FROM public.user_roles;

-- Step 4: Drop old user_roles table and recreate with new structure
DROP TABLE IF EXISTS public.user_roles CASCADE;

CREATE TABLE public.user_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.app_roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- Step 5: Migrate backed up data to new structure
INSERT INTO public.user_roles (user_id, role_id, created_at)
SELECT 
  b.user_id,
  r.id as role_id,
  b.created_at
FROM user_roles_backup b
JOIN public.app_roles r ON r.name = b.role_name
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Step 6: Enable RLS on both tables
ALTER TABLE public.app_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 7: RLS policies for app_roles (read-only for authenticated users)
CREATE POLICY "Anyone can view roles"
ON public.app_roles
FOR SELECT
TO authenticated
USING (true);

-- Step 8: RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Step 9: Create helper function that accepts text role name
CREATE OR REPLACE FUNCTION public.has_app_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.app_roles ar ON ar.id = ur.role_id
    WHERE ur.user_id = _user_id
      AND ar.name = _role
  )
$$;

-- Step 10: Update has_vip_access function
CREATE OR REPLACE FUNCTION public.has_vip_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.app_roles ar ON ar.id = ur.role_id
    WHERE ur.user_id = _user_id
      AND ar.name IN ('admin', 'vip')
  )
$$;

-- Step 11: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_app_roles_name ON public.app_roles(name);

-- Step 12: Drop the old enum type (now unused)
DROP TYPE IF EXISTS public.app_role CASCADE;
