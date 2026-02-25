
-- New activity_events table for comprehensive tracking
CREATE TABLE public.activity_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  visitor_id text NOT NULL,
  session_id text NOT NULL,
  event_type text NOT NULL,
  page_path text,
  section text,
  label text,
  value jsonb DEFAULT '{}'::jsonb,
  referrer text,
  user_agent text
);

-- Index for admin queries
CREATE INDEX idx_activity_events_created ON public.activity_events (created_at DESC);
CREATE INDEX idx_activity_events_type ON public.activity_events (event_type);
CREATE INDEX idx_activity_events_visitor ON public.activity_events (visitor_id);

-- RLS
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert activity events"
  ON public.activity_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view activity events"
  ON public.activity_events FOR SELECT
  USING (has_app_role(auth.uid(), 'admin'));
