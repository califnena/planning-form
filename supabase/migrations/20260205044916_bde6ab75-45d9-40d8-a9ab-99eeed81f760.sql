-- Create table for support/callback requests (not email-based)
CREATE TABLE public.support_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  contact_method TEXT NOT NULL CHECK (contact_method IN ('phone', 'email')),
  contact_value TEXT NOT NULL,
  preferred_time TEXT,
  message TEXT,
  request_type TEXT NOT NULL DEFAULT 'callback',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit support requests (public insert)
CREATE POLICY "Anyone can submit support requests"
ON public.support_requests
FOR INSERT
WITH CHECK (true);

-- Users can view their own requests if logged in
CREATE POLICY "Users can view own requests"
ON public.support_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view and manage all requests using the has_app_role function
CREATE POLICY "Admins can manage all requests"
ON public.support_requests
FOR ALL
USING (public.has_app_role(auth.uid(), 'admin'));

-- Add indexes for faster lookups
CREATE INDEX idx_support_requests_status ON public.support_requests(status);
CREATE INDEX idx_support_requests_created_at ON public.support_requests(created_at DESC);