-- Drop existing planning_summaries table and recreate with new schema
DROP TABLE IF EXISTS public.planning_summaries CASCADE;

-- Create planning_summaries with user's specified schema
CREATE TABLE public.planning_summaries (
  summary_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users_public(user_id),
  created_at timestamptz DEFAULT now(),
  renewed_at timestamptz,
  expires_at timestamptz,
  status text CHECK (status IN ('active', 'expiring', 'expired')) DEFAULT 'active',
  char_count integer CHECK (char_count <= 750),
  category_tag text CHECK (category_tag IN ('planning', 'after_death', 'documents', 'general')),
  consent_captured boolean DEFAULT false,
  save_source text CHECK (save_source IN ('user_request', 'button', 'voice_command')),
  policy_version text,
  pii_flag boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.planning_summaries ENABLE ROW LEVEL SECURITY;

-- Users can view their own summaries
CREATE POLICY "Users can view own summaries"
ON public.planning_summaries FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own summaries
CREATE POLICY "Users can insert own summaries"
ON public.planning_summaries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own summaries
CREATE POLICY "Users can update own summaries"
ON public.planning_summaries FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own summaries
CREATE POLICY "Users can delete own summaries"
ON public.planning_summaries FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all summaries (metadata only via function)
CREATE POLICY "Admins can view all summaries"
ON public.planning_summaries FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));