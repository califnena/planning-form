-- Create vendor_directory table for public vendor listings
CREATE TABLE public.vendor_directory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  notes TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.vendor_directory ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view active vendors
CREATE POLICY "Authenticated users can view active vendor directory"
ON public.vendor_directory
FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy: Admins can view all vendors (including inactive)
CREATE POLICY "Admins can view all vendor directory"
ON public.vendor_directory
FOR SELECT
TO authenticated
USING (has_app_role(auth.uid(), 'admin'));

-- Policy: Admins can insert vendors
CREATE POLICY "Admins can insert vendor directory"
ON public.vendor_directory
FOR INSERT
TO authenticated
WITH CHECK (has_app_role(auth.uid(), 'admin'));

-- Policy: Admins can update vendors
CREATE POLICY "Admins can update vendor directory"
ON public.vendor_directory
FOR UPDATE
TO authenticated
USING (has_app_role(auth.uid(), 'admin'));

-- Policy: Admins can delete vendors
CREATE POLICY "Admins can delete vendor directory"
ON public.vendor_directory
FOR DELETE
TO authenticated
USING (has_app_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER update_vendor_directory_updated_at
BEFORE UPDATE ON public.vendor_directory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();