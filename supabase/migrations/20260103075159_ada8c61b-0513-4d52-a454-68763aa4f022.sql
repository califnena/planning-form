-- Add active_plan_id to user_settings to persistently store the user's active plan
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS active_plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL;

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_active_plan_id ON public.user_settings(active_plan_id);

-- Update RLS policy to allow users to read/write their own settings (should already exist, but ensure it covers active_plan_id)