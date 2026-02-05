-- Create summary_events table
CREATE TABLE public.summary_events (
  event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_id uuid REFERENCES public.planning_summaries(summary_id),
  user_id uuid REFERENCES public.users_public(user_id),
  event_type text CHECK (event_type IN ('created', 'renewed', 'expired', 'force_expired', 'deleted')),
  event_timestamp timestamptz DEFAULT now(),
  triggered_by text CHECK (triggered_by IN ('user', 'system', 'admin'))
);

-- Enable RLS
ALTER TABLE public.summary_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own events
CREATE POLICY "Users can view own summary events"
ON public.summary_events FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own events
CREATE POLICY "Users can insert own summary events"
ON public.summary_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all events
CREATE POLICY "Admins can view all summary events"
ON public.summary_events FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));

-- Admins can insert events (for system/admin actions)
CREATE POLICY "Admins can insert summary events"
ON public.summary_events FOR INSERT
WITH CHECK (has_app_role(auth.uid(), 'admin'));