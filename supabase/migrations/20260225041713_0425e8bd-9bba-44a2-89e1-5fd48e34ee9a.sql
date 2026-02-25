
-- checkout_attempts table
CREATE TABLE public.checkout_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  user_email text,
  anonymous_session_id text,
  product_sku text NOT NULL,
  amount integer,
  currency text DEFAULT 'usd',
  stripe_session_id text,
  stripe_payment_intent_id text,
  status text NOT NULL DEFAULT 'created',
  last_event_type text,
  page_url text,
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.checkout_attempts ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_checkout_attempts_created ON public.checkout_attempts(created_at DESC);
CREATE INDEX idx_checkout_attempts_status ON public.checkout_attempts(status);
CREATE INDEX idx_checkout_attempts_stripe_session ON public.checkout_attempts(stripe_session_id);
CREATE INDEX idx_checkout_attempts_user ON public.checkout_attempts(user_id);

-- Only admins can read; service role inserts/updates via edge functions
CREATE POLICY "Admins can view checkout attempts"
  ON public.checkout_attempts FOR SELECT
  USING (has_app_role(auth.uid(), 'admin'));

CREATE POLICY "Service role inserts checkout attempts"
  ON public.checkout_attempts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role updates checkout attempts"
  ON public.checkout_attempts FOR UPDATE
  USING (true);

-- user_activity table
CREATE TABLE public.user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  anonymous_session_id text,
  event_name text NOT NULL,
  page_url text,
  section text,
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_user_activity_created ON public.user_activity(created_at DESC);
CREATE INDEX idx_user_activity_event ON public.user_activity(event_name);
CREATE INDEX idx_user_activity_user ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_section ON public.user_activity(section);

-- Admins can read; anyone can insert (for anonymous tracking)
CREATE POLICY "Admins can view user activity"
  ON public.user_activity FOR SELECT
  USING (has_app_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert user activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (true);
