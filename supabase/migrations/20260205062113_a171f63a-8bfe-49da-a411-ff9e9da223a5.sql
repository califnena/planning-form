-- Add 'support' role if it doesn't exist
INSERT INTO public.app_roles (name, description)
VALUES ('support', 'Support staff with limited admin access')
ON CONFLICT (name) DO NOTHING;

-- Extend planning_summaries with audit metadata
ALTER TABLE public.planning_summaries
ADD COLUMN IF NOT EXISTS char_count integer GENERATED ALWAYS AS (length(summary_text)) STORED,
ADD COLUMN IF NOT EXISTS save_source text DEFAULT 'claire',
ADD COLUMN IF NOT EXISTS pii_flag boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS category_tag text,
ADD COLUMN IF NOT EXISTS consent_captured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS policy_version text DEFAULT '1.0';

-- Create admin audit log for tracking admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action_type text NOT NULL,
  target_table text,
  target_id uuid,
  details jsonb DEFAULT '{}',
  page_accessed text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
ON public.admin_audit_log FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create audit logs"
ON public.admin_audit_log FOR INSERT
WITH CHECK (has_app_role(auth.uid(), 'admin') OR has_app_role(auth.uid(), 'support'));

-- Create PII attempt log
CREATE TABLE IF NOT EXISTS public.pii_attempt_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  pattern_type text NOT NULL,
  detected_at timestamptz NOT NULL DEFAULT now(),
  context_hint text,
  blocked boolean DEFAULT true
);

ALTER TABLE public.pii_attempt_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view PII attempts"
ON public.pii_attempt_log FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert PII attempts"
ON public.pii_attempt_log FOR INSERT
WITH CHECK (true);

-- Create boundary trigger log (legal/medical/financial advice attempts)
CREATE TABLE IF NOT EXISTS public.boundary_trigger_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  boundary_type text NOT NULL,
  triggered_at timestamptz NOT NULL DEFAULT now(),
  handled boolean DEFAULT true
);

ALTER TABLE public.boundary_trigger_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view boundary triggers"
ON public.boundary_trigger_log FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert boundary triggers"
ON public.boundary_trigger_log FOR INSERT
WITH CHECK (true);

-- Create Claire session tracking
CREATE TABLE IF NOT EXISTS public.claire_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  message_count integer DEFAULT 0,
  page_context text
);

ALTER TABLE public.claire_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sessions"
ON public.claire_sessions FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
ON public.claire_sessions FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));

-- Create user save restrictions table
CREATE TABLE IF NOT EXISTS public.user_save_restrictions (
  user_id uuid PRIMARY KEY,
  saving_disabled boolean DEFAULT false,
  disabled_at timestamptz,
  disabled_by uuid,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_save_restrictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage save restrictions"
ON public.user_save_restrictions FOR ALL
USING (has_app_role(auth.uid(), 'admin'));

-- Create VIP page visit tracking
CREATE TABLE IF NOT EXISTS public.page_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  page_path text NOT NULL,
  visited_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can log their own visits"
ON public.page_visits FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all visits"
ON public.page_visits FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));

-- Add admin view policy for planning_summaries metadata only (no content)
CREATE OR REPLACE VIEW public.admin_summaries_metadata AS
SELECT 
  id as summary_id,
  encode(digest(user_id::text, 'sha256'), 'hex')::text as user_id_hash,
  user_id,
  created_at,
  last_renewed_at as renewed_at,
  expires_at,
  CASE 
    WHEN expires_at < now() THEN 'expired'
    WHEN expires_at <= now() + interval '14 days' THEN 'expiring_soon'
    ELSE 'active'
  END as status,
  char_count,
  save_source,
  pii_flag,
  category_tag,
  consent_captured,
  policy_version
FROM public.planning_summaries;

-- Update assisted planning intake to add status workflow
ALTER TABLE public.efa_do_for_you_intake
ADD COLUMN IF NOT EXISTS admin_notes text;