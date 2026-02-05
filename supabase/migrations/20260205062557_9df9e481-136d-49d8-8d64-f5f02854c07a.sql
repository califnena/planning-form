-- Create users_public table for tracking user status
CREATE TABLE public.users_public (
  user_id uuid PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  status text CHECK (status IN ('active', 'restricted', 'disabled')) DEFAULT 'active'
);

-- Enable RLS
ALTER TABLE public.users_public ENABLE ROW LEVEL SECURITY;

-- Users can view their own record
CREATE POLICY "Users can view own status"
ON public.users_public FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all users_public"
ON public.users_public FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));

-- Admins can update status
CREATE POLICY "Admins can update users_public"
ON public.users_public FOR UPDATE
USING (has_app_role(auth.uid(), 'admin'));

-- Allow insert for new users (typically done via trigger or admin)
CREATE POLICY "Admins can insert users_public"
ON public.users_public FOR INSERT
WITH CHECK (has_app_role(auth.uid(), 'admin') OR auth.uid() = user_id);