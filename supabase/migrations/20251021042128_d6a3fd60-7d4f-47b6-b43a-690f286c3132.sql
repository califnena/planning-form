-- Add form_data column to cases table to store After-Life Plan form data
ALTER TABLE public.cases
ADD COLUMN IF NOT EXISTS form_data JSONB DEFAULT '{}'::jsonb;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_cases_form_data ON public.cases USING gin(form_data);