-- Drop the failed view if it exists
DROP VIEW IF EXISTS public.admin_summaries_metadata;

-- Create a secure function instead for admin access (using md5 for hashing)
CREATE OR REPLACE FUNCTION public.get_admin_summaries_metadata()
RETURNS TABLE (
  summary_id uuid,
  user_id_hash text,
  internal_user_id uuid,
  created_at timestamptz,
  renewed_at timestamptz,
  expires_at timestamptz,
  status text,
  char_count integer,
  save_source text,
  pii_flag boolean,
  category_tag text,
  consent_captured boolean,
  policy_version text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ps.id as summary_id,
    md5(ps.user_id::text) as user_id_hash,
    ps.user_id as internal_user_id,
    ps.created_at,
    ps.last_renewed_at as renewed_at,
    ps.expires_at,
    CASE 
      WHEN ps.expires_at < now() THEN 'expired'
      WHEN ps.expires_at <= now() + interval '14 days' THEN 'expiring_soon'
      ELSE 'active'
    END as status,
    ps.char_count,
    ps.save_source,
    ps.pii_flag,
    ps.category_tag,
    ps.consent_captured,
    ps.policy_version
  FROM public.planning_summaries ps
  WHERE has_app_role(auth.uid(), 'admin')
$$;

-- Create helper function for admin dashboard stats
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT has_app_role(auth.uid(), 'admin') THEN
    RETURN '{}'::jsonb;
  END IF;
  
  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM auth.users),
    'active_users_7d', (SELECT count(DISTINCT user_id) FROM public.claire_sessions WHERE started_at >= now() - interval '7 days'),
    'claire_sessions_7d', (SELECT count(*) FROM public.claire_sessions WHERE started_at >= now() - interval '7 days'),
    'summaries_created_7d', (SELECT count(*) FROM public.planning_summaries WHERE created_at >= now() - interval '7 days'),
    'renewals_7d', (SELECT count(*) FROM public.planning_summaries WHERE last_renewed_at >= now() - interval '7 days' AND last_renewed_at IS NOT NULL),
    'expirations_7d', (SELECT count(*) FROM public.planning_summaries WHERE expires_at >= now() - interval '7 days' AND expires_at < now()),
    'assisted_requests_7d', (SELECT count(*) FROM public.efa_do_for_you_intake WHERE created_at >= now() - interval '7 days'),
    'vip_visits_7d', (SELECT count(*) FROM public.page_visits WHERE page_path LIKE '%/care-support%' AND visited_at >= now() - interval '7 days'),
    'pii_attempts_7d', (SELECT count(*) FROM public.pii_attempt_log WHERE detected_at >= now() - interval '7 days'),
    'boundary_triggers_7d', (SELECT count(*) FROM public.boundary_trigger_log WHERE triggered_at >= now() - interval '7 days'),
    'high_frequency_users', (SELECT count(*) FROM (SELECT user_id FROM public.claire_sessions WHERE started_at >= now() - interval '7 days' GROUP BY user_id HAVING count(*) > 20) sq)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create function for compliance stats
CREATE OR REPLACE FUNCTION public.get_compliance_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT has_app_role(auth.uid(), 'admin') THEN
    RETURN '{}'::jsonb;
  END IF;
  
  SELECT jsonb_build_object(
    'pii_attempts_by_day', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('date', d, 'count', c)), '[]'::jsonb)
      FROM (
        SELECT date_trunc('day', detected_at)::date as d, count(*) as c
        FROM public.pii_attempt_log
        WHERE detected_at >= now() - interval '30 days'
        GROUP BY date_trunc('day', detected_at)
        ORDER BY d
      ) sq
    ),
    'boundary_triggers_by_day', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('date', d, 'count', c, 'type', t)), '[]'::jsonb)
      FROM (
        SELECT date_trunc('day', triggered_at)::date as d, boundary_type as t, count(*) as c
        FROM public.boundary_trigger_log
        WHERE triggered_at >= now() - interval '30 days'
        GROUP BY date_trunc('day', triggered_at), boundary_type
        ORDER BY d
      ) sq
    ),
    'consent_rate', (
      SELECT CASE WHEN count(*) > 0 
        THEN round((count(*) FILTER (WHERE consent_captured = true)::numeric / count(*)::numeric) * 100, 1)
        ELSE 0 
      END
      FROM public.planning_summaries
    ),
    'avg_summary_length', (SELECT COALESCE(round(avg(char_count)), 0) FROM public.planning_summaries WHERE char_count IS NOT NULL),
    'renewal_vs_expiration', jsonb_build_object(
      'renewals', (SELECT count(*) FROM public.planning_summaries WHERE last_renewed_at IS NOT NULL),
      'expirations', (SELECT count(*) FROM public.planning_summaries WHERE expires_at < now())
    ),
    'top_pii_patterns', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('pattern', pattern_type, 'count', c)), '[]'::jsonb)
      FROM (
        SELECT pattern_type, count(*) as c
        FROM public.pii_attempt_log
        GROUP BY pattern_type
        ORDER BY c DESC
        LIMIT 10
      ) sq
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to force expire a summary (admin only)
CREATE OR REPLACE FUNCTION public.admin_force_expire_summary(_summary_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_app_role(auth.uid(), 'admin') THEN
    RETURN false;
  END IF;
  
  UPDATE public.planning_summaries
  SET expires_at = now() - interval '1 second'
  WHERE id = _summary_id;
  
  INSERT INTO public.admin_audit_log (admin_user_id, action_type, target_table, target_id, details)
  VALUES (auth.uid(), 'force_expire', 'planning_summaries', _summary_id, '{"action": "force_expire_summary"}'::jsonb);
  
  RETURN FOUND;
END;
$$;

-- Function to disable saving for a user (admin only)
CREATE OR REPLACE FUNCTION public.admin_disable_user_saving(_user_id uuid, _reason text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_app_role(auth.uid(), 'admin') THEN
    RETURN false;
  END IF;
  
  INSERT INTO public.user_save_restrictions (user_id, saving_disabled, disabled_at, disabled_by, reason)
  VALUES (_user_id, true, now(), auth.uid(), _reason)
  ON CONFLICT (user_id) DO UPDATE SET
    saving_disabled = true,
    disabled_at = now(),
    disabled_by = auth.uid(),
    reason = _reason,
    updated_at = now();
  
  INSERT INTO public.admin_audit_log (admin_user_id, action_type, target_table, target_id, details)
  VALUES (auth.uid(), 'disable_saving', 'user_save_restrictions', _user_id, jsonb_build_object('reason', _reason));
  
  RETURN true;
END;
$$;

-- Function to log admin page access
CREATE OR REPLACE FUNCTION public.log_admin_page_access(_page_path text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF has_app_role(auth.uid(), 'admin') OR has_app_role(auth.uid(), 'support') THEN
    INSERT INTO public.admin_audit_log (admin_user_id, action_type, page_accessed)
    VALUES (auth.uid(), 'page_access', _page_path);
  END IF;
END;
$$;