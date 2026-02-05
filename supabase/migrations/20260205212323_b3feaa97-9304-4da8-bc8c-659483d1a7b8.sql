-- Create app_config table for admin-controlled global settings
CREATE TABLE public.app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Everyone can read config (needed for feature flags)
CREATE POLICY "Anyone can read app_config"
  ON public.app_config
  FOR SELECT
  USING (true);

-- Only admins can update config
CREATE POLICY "Admins can manage app_config"
  ON public.app_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.app_roles ar ON ar.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND ar.name IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.app_roles ar ON ar.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND ar.name IN ('admin', 'owner')
    )
  );

-- Insert default config for assisted help trigger
INSERT INTO public.app_config (key, value, description) VALUES
  ('assisted_help_trigger_enabled', 'true', 'Enable/disable the assisted help trigger on planner pages'),
  ('assisted_help_trigger_minutes', '4', 'Minutes of inactivity before showing help trigger (3-5 recommended)');

-- Create trigger for updated_at
CREATE TRIGGER update_app_config_updated_at
  BEFORE UPDATE ON public.app_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();