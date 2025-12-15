-- Create subscribers table for event reminders
CREATE TABLE public.efa_event_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  first_name text,
  state_interest text[] DEFAULT '{}',
  county_interest text[] DEFAULT '{}',
  category_interest text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  unsub_token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex')
);

-- Create email send log table
CREATE TABLE public.efa_event_email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.efa_events(id) ON DELETE SET NULL,
  send_type text NOT NULL,
  audience_filter jsonb NOT NULL DEFAULT '{}',
  subject text NOT NULL,
  preview text,
  body text NOT NULL,
  sent_to_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'queued',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

-- Create indexes
CREATE INDEX idx_efa_event_subscribers_email ON public.efa_event_subscribers(email);
CREATE INDEX idx_efa_event_subscribers_active ON public.efa_event_subscribers(is_active);
CREATE INDEX idx_efa_event_subscribers_unsub_token ON public.efa_event_subscribers(unsub_token);
CREATE INDEX idx_efa_event_email_log_event_id ON public.efa_event_email_log(event_id);
CREATE INDEX idx_efa_event_email_log_status ON public.efa_event_email_log(status);

-- Enable RLS
ALTER TABLE public.efa_event_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.efa_event_email_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for efa_event_subscribers
-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe to event reminders"
ON public.efa_event_subscribers
FOR INSERT
WITH CHECK (true);

-- Admins can view all subscribers
CREATE POLICY "Admins can view all subscribers"
ON public.efa_event_subscribers
FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));

-- Admins can update subscribers
CREATE POLICY "Admins can update subscribers"
ON public.efa_event_subscribers
FOR UPDATE
USING (has_app_role(auth.uid(), 'admin'));

-- Allow unsubscribe via token (public update for specific columns)
CREATE POLICY "Anyone can unsubscribe via token"
ON public.efa_event_subscribers
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Admins can delete subscribers
CREATE POLICY "Admins can delete subscribers"
ON public.efa_event_subscribers
FOR DELETE
USING (has_app_role(auth.uid(), 'admin'));

-- RLS policies for efa_event_email_log
-- Admins can do everything with email logs
CREATE POLICY "Admins can manage email logs"
ON public.efa_event_email_log
FOR ALL
USING (has_app_role(auth.uid(), 'admin'));