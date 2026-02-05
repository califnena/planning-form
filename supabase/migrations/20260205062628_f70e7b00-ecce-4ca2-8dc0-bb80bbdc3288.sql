-- Drop existing claire_sessions table and recreate with new schema
DROP TABLE IF EXISTS public.claire_sessions;

-- Create claire_sessions with user's specified schema
CREATE TABLE public.claire_sessions (
  session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users_public(user_id),
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  input_mode text CHECK (input_mode IN ('text', 'voice', 'mixed')),
  duration_seconds integer,
  flags_triggered boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.claire_sessions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own sessions
CREATE POLICY "Users can view own sessions"
ON public.claire_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
ON public.claire_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
ON public.claire_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions"
ON public.claire_sessions FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));