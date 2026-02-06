-- Create table to track emotional support sessions per user per billing period
CREATE TABLE public.emotional_support_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  billing_period_start DATE NOT NULL,
  sessions_used INTEGER NOT NULL DEFAULT 0,
  sessions_limit INTEGER NOT NULL DEFAULT 5,
  first_session_shown BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, billing_period_start)
);

-- Enable Row Level Security
ALTER TABLE public.emotional_support_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own session records
CREATE POLICY "Users can view their own emotional support sessions"
ON public.emotional_support_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own session records
CREATE POLICY "Users can insert their own emotional support sessions"
ON public.emotional_support_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own session records
CREATE POLICY "Users can update their own emotional support sessions"
ON public.emotional_support_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_emotional_support_sessions_updated_at
BEFORE UPDATE ON public.emotional_support_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();