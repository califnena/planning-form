
-- Add wizard preferences to user_settings table
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS wizard_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS user_path text, -- 'planning_ahead', 'helping_other', 'someone_passed'
ADD COLUMN IF NOT EXISTS focus_areas text[], -- array of selected focus areas
ADD COLUMN IF NOT EXISTS preferred_state text, -- two-letter state code
ADD COLUMN IF NOT EXISTS preferred_name text;

-- Create a function to check if user needs wizard
CREATE OR REPLACE FUNCTION public.needs_onboarding_wizard(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT NOT wizard_completed FROM user_settings WHERE user_id = user_id_param),
    true
  )
$$;
