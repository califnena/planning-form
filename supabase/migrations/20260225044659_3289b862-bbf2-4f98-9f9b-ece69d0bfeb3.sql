
-- Create analytics_events table for first-party tracking
CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  event_name text NOT NULL,
  page_path text,
  referrer text,
  mode text,
  label text,
  visitor_id text NOT NULL,
  session_id text NOT NULL,
  user_id uuid,
  user_email text,
  duration_ms integer,
  metadata jsonb
);

-- Indexes for admin queries
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events (event_name);
CREATE INDEX idx_analytics_events_visitor_id ON public.analytics_events (visitor_id);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events (user_id);

-- RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous tracking)
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read analytics events"
  ON public.analytics_events FOR SELECT
  USING (public.has_app_role(auth.uid(), 'admin'));
