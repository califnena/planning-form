-- Add last_planner_activity column to track when users last worked on their plan
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS last_planner_activity TIMESTAMP WITH TIME ZONE;