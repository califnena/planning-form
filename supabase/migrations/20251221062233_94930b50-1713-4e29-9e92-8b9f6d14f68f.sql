-- Create efa_do_for_you_intake table
CREATE TABLE public.efa_do_for_you_intake (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  preferred_name TEXT,
  dob DATE,
  email TEXT NOT NULL,
  phone TEXT,
  relationship TEXT NOT NULL,
  help_topics TEXT[] NOT NULL DEFAULT '{}',
  involvement_level TEXT NOT NULL,
  service_preference TEXT,
  service_type TEXT,
  location_preference TEXT,
  non_negotiables TEXT,
  primary_contact_name TEXT NOT NULL,
  primary_contact_relationship TEXT NOT NULL,
  primary_contact_phone TEXT,
  primary_contact_email TEXT,
  secondary_contact_name TEXT,
  secondary_contact_relationship TEXT,
  secondary_contact_phone TEXT,
  secondary_contact_email TEXT,
  timing TEXT NOT NULL,
  best_times TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.efa_do_for_you_intake ENABLE ROW LEVEL SECURITY;

-- Users can insert their own intake
CREATE POLICY "Users can insert their own intake"
ON public.efa_do_for_you_intake
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own intakes
CREATE POLICY "Users can view their own intakes"
ON public.efa_do_for_you_intake
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own intakes
CREATE POLICY "Users can update their own intakes"
ON public.efa_do_for_you_intake
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all intakes
CREATE POLICY "Admins can view all intakes"
ON public.efa_do_for_you_intake
FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));

-- Admins can update all intakes
CREATE POLICY "Admins can update all intakes"
ON public.efa_do_for_you_intake
FOR UPDATE
USING (has_app_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER update_efa_do_for_you_intake_updated_at
BEFORE UPDATE ON public.efa_do_for_you_intake
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();