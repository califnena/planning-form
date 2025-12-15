-- Seed org_members with all existing users from profiles
-- The admin user becomes owner, others become members

INSERT INTO public.org_members (org_id, user_id, role)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  p.id,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN app_roles ar ON ar.id = ur.role_id 
      WHERE ur.user_id = p.id AND ar.name = 'admin'
    ) THEN 'owner'::app_role
    ELSE 'member'::app_role
  END
FROM profiles p
ON CONFLICT (org_id, user_id) DO NOTHING;