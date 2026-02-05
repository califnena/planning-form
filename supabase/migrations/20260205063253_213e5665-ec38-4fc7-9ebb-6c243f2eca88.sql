-- Drop existing admin-only policies on assisted_requests
DROP POLICY IF EXISTS "Admins can view all assisted requests" ON public.assisted_requests;
DROP POLICY IF EXISTS "Admins can update assisted requests" ON public.assisted_requests;
DROP POLICY IF EXISTS "Admins can delete assisted requests" ON public.assisted_requests;

-- Create combined policy for admin and support roles
CREATE POLICY "Admin and support can manage assisted requests"
ON public.assisted_requests
FOR ALL
USING (has_app_role(auth.uid(), 'admin') OR has_app_role(auth.uid(), 'support'))
WITH CHECK (has_app_role(auth.uid(), 'admin') OR has_app_role(auth.uid(), 'support'));