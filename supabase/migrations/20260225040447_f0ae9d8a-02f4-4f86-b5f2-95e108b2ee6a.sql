
-- Error log table for critical system errors
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID,
  user_email TEXT,
  ip_address TEXT,
  page_url TEXT,
  action TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  stripe_event_id TEXT,
  metadata JSONB,
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('warning','error','critical'))
);

-- Index for querying by time and user
CREATE INDEX idx_error_logs_created ON public.error_logs (created_at DESC);
CREATE INDEX idx_error_logs_user ON public.error_logs (user_id);
CREATE INDEX idx_error_logs_action ON public.error_logs (action);

-- RLS: only admins can read, service role can insert
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view error logs"
  ON public.error_logs FOR SELECT
  USING (public.has_app_role(auth.uid(), 'admin'));

CREATE POLICY "Service role inserts error logs"
  ON public.error_logs FOR INSERT
  WITH CHECK (true);
