-- Create user_settings table to store section visibility preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  selected_sections TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_settings UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Users can manage their own settings
CREATE POLICY "Users can manage their own settings"
ON public.user_settings
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();