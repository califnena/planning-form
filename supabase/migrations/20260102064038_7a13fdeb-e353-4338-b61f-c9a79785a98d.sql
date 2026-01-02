-- Add plan_payload JSONB column for unified structured data storage
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS plan_payload jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Add comment explaining the column
COMMENT ON COLUMN public.plans.plan_payload IS 'Unified JSONB storage for all section data. Keys: about_you, medical, funeral, insurance, property, pets, messages, preplanning_checklist, advance_directive, travel, contacts, digital';

-- Create index for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_plans_plan_payload ON public.plans USING gin (plan_payload);