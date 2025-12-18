-- Create visitors table for tracking unique visitors
CREATE TABLE IF NOT EXISTS public.visitors (
  visitor_id uuid PRIMARY KEY,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  total_visits int NOT NULL DEFAULT 0
);

-- Create visit_events table for detailed visit tracking
CREATE TABLE IF NOT EXISTS public.visit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id uuid NOT NULL REFERENCES public.visitors(visitor_id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  org_id uuid REFERENCES public.orgs(id) ON DELETE SET NULL,
  path text,
  referrer text,
  city text,
  region text,
  country text,
  ip_hash text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS visit_events_created_at_idx ON public.visit_events(created_at);
CREATE INDEX IF NOT EXISTS visit_events_user_id_idx ON public.visit_events(user_id);
CREATE INDEX IF NOT EXISTS visit_events_org_id_idx ON public.visit_events(org_id);
CREATE INDEX IF NOT EXISTS visit_events_visitor_id_idx ON public.visit_events(visitor_id);

-- Enable RLS on both tables
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_events ENABLE ROW LEVEL SECURITY;

-- Deny direct reads to visitors table (service role only for writes)
CREATE POLICY "visitors: deny direct reads"
ON public.visitors
FOR SELECT
TO authenticated
USING (false);

-- App admins can read all visit events for analytics
CREATE POLICY "visit_events: app admin read all"
ON public.visit_events
FOR SELECT
TO authenticated
USING (
  has_app_role(auth.uid(), 'admin')
);

-- Org admins can read visit events for their org
CREATE POLICY "visit_events: org admin read"
ON public.visit_events
FOR SELECT
TO authenticated
USING (
  org_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.org_members om
    WHERE om.org_id = visit_events.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
  )
);