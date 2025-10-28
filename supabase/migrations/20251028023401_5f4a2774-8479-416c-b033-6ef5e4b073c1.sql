-- Drop the existing admin_plans_safe view
DROP VIEW IF EXISTS admin_plans_safe;

-- Recreate the view without SECURITY DEFINER
CREATE VIEW admin_plans_safe AS
SELECT 
  p.id,
  p.title,
  p.org_id,
  o.name as org_name,
  p.percent_complete,
  p.created_at,
  p.updated_at
FROM plans p
LEFT JOIN orgs o ON o.id = p.org_id;

-- Enable RLS on the view
ALTER VIEW admin_plans_safe SET (security_invoker = true);

-- Note: Access to this view is controlled through the existing RLS policies 
-- on the underlying 'plans' table, which already restrict access to:
-- 1. Plan owners (owner_user_id)
-- 2. Executors (via has_executor_access function)
-- 3. Admins (via org_members with admin role)