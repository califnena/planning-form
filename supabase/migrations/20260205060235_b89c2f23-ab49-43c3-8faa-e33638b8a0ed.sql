-- Add expiration columns to planning_summaries
ALTER TABLE public.planning_summaries 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '90 days'),
ADD COLUMN last_renewed_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient expiration queries
CREATE INDEX idx_planning_summaries_expires_at ON public.planning_summaries(expires_at);

-- Update existing summaries to have expiration date 90 days from creation
UPDATE public.planning_summaries 
SET expires_at = created_at + interval '90 days';

-- Function to delete expired summaries (will be called by cron)
CREATE OR REPLACE FUNCTION public.delete_expired_summaries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.planning_summaries
  WHERE expires_at < now();
END;
$$;

-- Function to get summaries expiring soon (within 14 days)
CREATE OR REPLACE FUNCTION public.get_expiring_summaries(_user_id uuid)
RETURNS TABLE(id uuid, title text, summary_text text, expires_at timestamptz, days_until_expiry integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id, 
    title, 
    summary_text, 
    expires_at,
    EXTRACT(DAY FROM (expires_at - now()))::integer as days_until_expiry
  FROM public.planning_summaries
  WHERE user_id = _user_id
    AND expires_at > now()
    AND expires_at <= now() + interval '14 days'
  ORDER BY expires_at ASC;
$$;

-- Function to renew a summary
CREATE OR REPLACE FUNCTION public.renew_summary(_summary_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.planning_summaries
  SET 
    expires_at = now() + interval '90 days',
    last_renewed_at = now(),
    updated_at = now()
  WHERE id = _summary_id AND user_id = _user_id;
  
  RETURN FOUND;
END;
$$;