-- Add missing columns needed for UI functionality
ALTER TABLE public.planning_summaries
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS summary_text text;