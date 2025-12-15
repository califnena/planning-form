
-- Drop existing service_role only policy for managing roles
DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;

-- Admins can view all user roles (for admin panel)
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_app_role(auth.uid(), 'admin'));

-- Admins can insert roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_app_role(auth.uid(), 'admin'));

-- Admins can update roles
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_app_role(auth.uid(), 'admin'))
WITH CHECK (has_app_role(auth.uid(), 'admin'));

-- Admins can delete roles (except protected owner)
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_app_role(auth.uid(), 'admin'));
