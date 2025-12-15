-- Fix security definer view issue by recreating views with security_invoker = true
-- This ensures views respect the querying user's RLS policies rather than the view creator's

-- Drop and recreate admin_plans_safe with security_invoker
DROP VIEW IF EXISTS public.admin_plans_safe;
CREATE VIEW public.admin_plans_safe
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.title,
  p.org_id,
  o.name AS org_name,
  p.percent_complete,
  p.created_at,
  p.updated_at
FROM plans p
LEFT JOIN orgs o ON o.id = p.org_id;

-- Drop and recreate user_login_stats with security_invoker
DROP VIEW IF EXISTS public.user_login_stats;
CREATE VIEW public.user_login_stats
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  count(*) AS login_count,
  max(logged_in_at) AS last_login_at
FROM user_logins
GROUP BY user_id;