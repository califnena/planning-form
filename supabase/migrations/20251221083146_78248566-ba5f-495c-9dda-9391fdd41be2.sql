-- Add columns for tracking planner progress and section completion
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS last_step_index integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_sections text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_planner_activity timestamp with time zone;

-- Add section_archives table for storing archived section snapshots
CREATE TABLE IF NOT EXISTS public.section_archives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  section_id TEXT NOT NULL,
  section_data JSONB NOT NULL,
  note TEXT,
  archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.section_archives ENABLE ROW LEVEL SECURITY;

-- Create policies for section_archives
CREATE POLICY "Users can view their own archives"
ON public.section_archives
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own archives"
ON public.section_archives
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own archives"
ON public.section_archives
FOR DELETE
USING (auth.uid() = user_id);