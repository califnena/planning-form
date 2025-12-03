-- Add RLS policies for admin users to manage vendor_directory

-- Policy for admins to INSERT vendors
CREATE POLICY "Admins can insert vendors"
ON public.vendor_directory
FOR INSERT
TO authenticated
WITH CHECK (public.has_app_role(auth.uid(), 'admin'));

-- Policy for admins to UPDATE vendors
CREATE POLICY "Admins can update vendors"
ON public.vendor_directory
FOR UPDATE
TO authenticated
USING (public.has_app_role(auth.uid(), 'admin'))
WITH CHECK (public.has_app_role(auth.uid(), 'admin'));

-- Policy for admins to DELETE vendors
CREATE POLICY "Admins can delete vendors"
ON public.vendor_directory
FOR DELETE
TO authenticated
USING (public.has_app_role(auth.uid(), 'admin'));

-- Allow admins to view ALL vendors (including inactive ones)
CREATE POLICY "Admins can view all vendors"
ON public.vendor_directory
FOR SELECT
TO authenticated
USING (public.has_app_role(auth.uid(), 'admin'));