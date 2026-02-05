-- Create compliance_flags table
CREATE TABLE public.compliance_flags (
  flag_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users_public(user_id),
  session_id uuid REFERENCES public.claire_sessions(session_id),
  flag_type text CHECK (flag_type IN (
    'pii_attempt',
    'legal_advice_request',
    'medical_advice_request',
    'financial_advice_request',
    'crisis_language',
    'harassment'
  )),
  detected_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.compliance_flags ENABLE ROW LEVEL SECURITY;

-- Users can view their own flags
CREATE POLICY "Users can view own compliance flags"
ON public.compliance_flags FOR SELECT
USING (auth.uid() = user_id);

-- System can insert flags (via service role or edge functions)
CREATE POLICY "Users can insert own compliance flags"
ON public.compliance_flags FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all flags for compliance review
CREATE POLICY "Admins can view all compliance flags"
ON public.compliance_flags FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));