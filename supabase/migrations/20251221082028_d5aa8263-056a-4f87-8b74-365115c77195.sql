-- Add planner_mode column to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS planner_mode TEXT DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.user_settings.planner_mode IS 'User preference for planner mode: guided or free';