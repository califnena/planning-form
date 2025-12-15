-- Create a default organization for the app
INSERT INTO public.orgs (id, name, created_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'Everlasting Funeral Advisors', now())
ON CONFLICT (id) DO NOTHING;

-- Add the app owner to the default org as owner (if app_owner exists)
INSERT INTO public.org_members (org_id, user_id, role, created_at)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  ao.user_id,
  'owner'::app_role,
  now()
FROM public.app_owner ao
ON CONFLICT (org_id, user_id) DO NOTHING;