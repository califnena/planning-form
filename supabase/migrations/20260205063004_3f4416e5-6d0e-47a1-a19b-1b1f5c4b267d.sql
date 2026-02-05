-- Create admin_access_logs table
CREATE TABLE public.admin_access_logs (
  log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid,
  page_accessed text,
  action_taken text,
  accessed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can insert logs
CREATE POLICY "Admins can insert access logs"
ON public.admin_access_logs FOR INSERT
WITH CHECK (has_app_role(auth.uid(), 'admin'));

-- Admins can view all logs
CREATE POLICY "Admins can view access logs"
ON public.admin_access_logs FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));