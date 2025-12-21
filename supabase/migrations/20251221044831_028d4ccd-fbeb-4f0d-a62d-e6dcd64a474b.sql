-- Add premium role for EFAPREMIUM and EFABINDER access
INSERT INTO public.app_roles (name, description)
VALUES ('premium', 'Premium tool access (EFAPREMIUM, EFABINDER) - full pre-planning tools')
ON CONFLICT (name) DO NOTHING;