-- Add efa_onboarding_complete column to user_settings for tracking safety entry completion
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS efa_onboarding_complete boolean DEFAULT false;

-- Add emotional_path column for storing the user's chosen path from safety entry
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS emotional_path text;