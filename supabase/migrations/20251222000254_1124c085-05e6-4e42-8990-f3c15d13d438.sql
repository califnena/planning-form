-- Create table for storing cost estimates
CREATE TABLE public.cost_estimates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.plans(id) ON DELETE CASCADE,
  state TEXT NOT NULL,
  disposition TEXT NOT NULL,
  service_level TEXT NOT NULL,
  casket_level TEXT NOT NULL,
  addons TEXT[] DEFAULT '{}',
  low_estimate INTEGER NOT NULL,
  typical_estimate INTEGER NOT NULL,
  high_estimate INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cost_estimates ENABLE ROW LEVEL SECURITY;

-- Users can view their own estimates
CREATE POLICY "Users can view own estimates"
  ON public.cost_estimates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own estimates
CREATE POLICY "Users can insert own estimates"
  ON public.cost_estimates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own estimates
CREATE POLICY "Users can delete own estimates"
  ON public.cost_estimates
  FOR DELETE
  USING (auth.uid() = user_id);