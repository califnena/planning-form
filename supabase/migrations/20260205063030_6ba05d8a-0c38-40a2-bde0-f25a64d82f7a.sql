-- Create system_controls table
CREATE TABLE public.system_controls (
  control_key text PRIMARY KEY,
  control_value boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_controls ENABLE ROW LEVEL SECURITY;

-- Anyone can read system controls (needed for app to check flags)
CREATE POLICY "Anyone can read system controls"
ON public.system_controls FOR SELECT
USING (true);

-- Only admins can insert controls
CREATE POLICY "Admins can insert system controls"
ON public.system_controls FOR INSERT
WITH CHECK (has_app_role(auth.uid(), 'admin'));

-- Only admins can update controls
CREATE POLICY "Admins can update system controls"
ON public.system_controls FOR UPDATE
USING (has_app_role(auth.uid(), 'admin'));

-- Only admins can delete controls
CREATE POLICY "Admins can delete system controls"
ON public.system_controls FOR DELETE
USING (has_app_role(auth.uid(), 'admin'));