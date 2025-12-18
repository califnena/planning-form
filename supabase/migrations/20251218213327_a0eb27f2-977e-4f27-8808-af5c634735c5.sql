
-- Drop the existing policies first, then recreate with consistent naming
DROP POLICY IF EXISTS "user_logins: user can read own" ON public.user_logins;
DROP POLICY IF EXISTS "user_logins: user can insert own" ON public.user_logins;

CREATE POLICY "user_logins: user can read own"
ON public.user_logins
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "user_logins: user can insert own"
ON public.user_logins
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
