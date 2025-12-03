-- Create user_logins table for tracking logins
CREATE TABLE public.user_logins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_in_at timestamptz NOT NULL DEFAULT now(),
  ip_address text NULL,
  user_agent text NULL
);

-- Add indexes
CREATE INDEX idx_user_logins_user_id ON public.user_logins(user_id);
CREATE INDEX idx_user_logins_logged_in_at ON public.user_logins(logged_in_at DESC);

-- Enable RLS
ALTER TABLE public.user_logins ENABLE ROW LEVEL SECURITY;

-- Only admins can read login data
CREATE POLICY "Admins can view all user logins"
ON public.user_logins
FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));

-- Service role can insert (for webhook/login tracking)
CREATE POLICY "Service role can insert logins"
ON public.user_logins
FOR INSERT
WITH CHECK (true);

-- Create user_login_stats view
CREATE OR REPLACE VIEW public.user_login_stats AS
SELECT 
  user_id,
  COUNT(*) as login_count,
  MAX(logged_in_at) as last_login_at
FROM public.user_logins
GROUP BY user_id;

-- Create user_admin_meta table for CRM notes
CREATE TABLE public.user_admin_meta (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tags text[] DEFAULT '{}',
  notes text NULL,
  last_contacted_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_admin_meta ENABLE ROW LEVEL SECURITY;

-- Only admins can access admin meta
CREATE POLICY "Admins can manage user admin meta"
ON public.user_admin_meta
FOR ALL
USING (has_app_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_user_admin_meta_updated_at
BEFORE UPDATE ON public.user_admin_meta
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create app_owner table to protect owner account
CREATE TABLE public.app_owner (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_owner ENABLE ROW LEVEL SECURITY;

-- Only admins can view app_owner
CREATE POLICY "Admins can view app owner"
ON public.app_owner
FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));

-- Create function to check if user is owner
CREATE OR REPLACE FUNCTION public.is_app_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.app_owner WHERE user_id = _user_id
  )
$$;

-- Prevent deletion of admin role from owner via trigger
CREATE OR REPLACE FUNCTION public.protect_owner_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_role_id uuid;
BEGIN
  -- Get admin role id
  SELECT id INTO admin_role_id FROM public.app_roles WHERE name = 'admin';
  
  -- Check if trying to delete admin role from owner
  IF OLD.role_id = admin_role_id AND public.is_app_owner(OLD.user_id) THEN
    RAISE EXCEPTION 'Cannot remove admin role from app owner';
  END IF;
  
  RETURN OLD;
END;
$$;

CREATE TRIGGER protect_owner_admin_role_trigger
BEFORE DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.protect_owner_admin_role();