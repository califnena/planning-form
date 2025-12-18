-- Enable RLS on efa_event_subscribers and add policies using existing is_org_admin function
ALTER TABLE public.efa_event_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "org_admin_can_read_subscribers" ON public.efa_event_subscribers;
DROP POLICY IF EXISTS "org_admin_can_insert_subscribers" ON public.efa_event_subscribers;
DROP POLICY IF EXISTS "org_admin_can_update_subscribers" ON public.efa_event_subscribers;
DROP POLICY IF EXISTS "org_admin_can_delete_subscribers" ON public.efa_event_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe to event reminders" ON public.efa_event_subscribers;
DROP POLICY IF EXISTS "Anyone can unsubscribe via token" ON public.efa_event_subscribers;
DROP POLICY IF EXISTS "anyone_can_unsubscribe_via_token" ON public.efa_event_subscribers;
DROP POLICY IF EXISTS "Admins can view all subscribers" ON public.efa_event_subscribers;
DROP POLICY IF EXISTS "Admins can update subscribers" ON public.efa_event_subscribers;
DROP POLICY IF EXISTS "Admins can delete subscribers" ON public.efa_event_subscribers;

-- Org admin can read subscribers for their org
CREATE POLICY "org_admin_can_read_subscribers"
ON public.efa_event_subscribers
FOR SELECT
TO authenticated
USING (public.is_org_admin(org_id, auth.uid()));

-- Org admin can insert subscribers for their org
CREATE POLICY "org_admin_can_insert_subscribers"
ON public.efa_event_subscribers
FOR INSERT
TO authenticated
WITH CHECK (public.is_org_admin(org_id, auth.uid()));

-- Org admin can update subscribers for their org
CREATE POLICY "org_admin_can_update_subscribers"
ON public.efa_event_subscribers
FOR UPDATE
TO authenticated
USING (public.is_org_admin(org_id, auth.uid()));

-- Org admin can delete subscribers for their org
CREATE POLICY "org_admin_can_delete_subscribers"
ON public.efa_event_subscribers
FOR DELETE
TO authenticated
USING (public.is_org_admin(org_id, auth.uid()));

-- Anyone can subscribe (public signup) - uses service role in edge function
CREATE POLICY "anyone_can_subscribe"
ON public.efa_event_subscribers
FOR INSERT
TO anon
WITH CHECK (true);

-- Anyone can unsubscribe via their token (self-service)
CREATE POLICY "anyone_can_unsubscribe_via_token"
ON public.efa_event_subscribers
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Enable RLS on app_roles and user_roles (lock them down)
ALTER TABLE public.app_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- app_roles: read-only for authenticated users
DROP POLICY IF EXISTS "Anyone can view roles" ON public.app_roles;
CREATE POLICY "authenticated_can_read_app_roles"
ON public.app_roles
FOR SELECT
TO authenticated
USING (true);

-- user_roles: only admins can manage
DROP POLICY IF EXISTS "admins_can_manage_user_roles" ON public.user_roles;
CREATE POLICY "admins_can_read_user_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_app_role(auth.uid(), 'admin'));

CREATE POLICY "admins_can_insert_user_roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_app_role(auth.uid(), 'admin'));

CREATE POLICY "admins_can_delete_user_roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_app_role(auth.uid(), 'admin'));