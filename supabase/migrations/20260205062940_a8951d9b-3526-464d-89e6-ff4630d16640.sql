-- Create assisted_requests table
CREATE TABLE public.assisted_requests (
  request_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  help_for text,
  help_types text[],
  sections text[],
  contact_method text CHECK (contact_method IN ('phone', 'video', 'email', 'unsure')),
  name text,
  email text,
  phone text,
  status text CHECK (status IN ('new', 'contacted', 'scheduled', 'completed', 'closed')) DEFAULT 'new',
  admin_notes text
);

-- Enable RLS
ALTER TABLE public.assisted_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a request (public form)
CREATE POLICY "Anyone can insert assisted requests"
ON public.assisted_requests FOR INSERT
WITH CHECK (true);

-- Admins can view all requests
CREATE POLICY "Admins can view all assisted requests"
ON public.assisted_requests FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));

-- Admins can update requests
CREATE POLICY "Admins can update assisted requests"
ON public.assisted_requests FOR UPDATE
USING (has_app_role(auth.uid(), 'admin'));

-- Admins can delete requests
CREATE POLICY "Admins can delete assisted requests"
ON public.assisted_requests FOR DELETE
USING (has_app_role(auth.uid(), 'admin'));