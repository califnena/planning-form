-- Add missing roles for Stripe product access
INSERT INTO public.app_roles (name, description)
VALUES 
  ('printable', 'Access to printable workbook (EFABASIC)'),
  ('done_for_you', 'Do It For You service access'),
  ('song_standard', 'Standard custom song access'),
  ('song_premium', 'Premium custom song access'),
  ('binder', 'Physical binder purchase')
ON CONFLICT (name) DO NOTHING;