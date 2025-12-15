-- Create efa_events table for storing event information
CREATE TABLE public.efa_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Senior Expo', 'Estate Planning', 'Probate', 'Grief Support', 'Hospice', 'Funeral Industry', 'Caregiver', 'Other')),
  event_date_start TIMESTAMPTZ NOT NULL,
  event_date_end TIMESTAMPTZ NULL,
  time_text TEXT NULL,
  venue TEXT NULL,
  address TEXT NULL,
  city TEXT NULL,
  county TEXT NULL,
  state TEXT NULL,
  zip TEXT NULL,
  description TEXT NULL,
  cost_attendee TEXT NULL,
  is_vendor_friendly BOOLEAN NOT NULL DEFAULT false,
  booth_fee TEXT NULL,
  booth_deadline DATE NULL,
  exhibitor_link TEXT NULL,
  event_link TEXT NULL,
  organizer_name TEXT NULL,
  organizer_email TEXT NULL,
  organizer_phone TEXT NULL,
  tags TEXT[] NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NULL
);

-- Create indexes for performance
CREATE INDEX idx_efa_events_date_start ON public.efa_events(event_date_start);
CREATE INDEX idx_efa_events_state_county ON public.efa_events(state, county);
CREATE INDEX idx_efa_events_tags ON public.efa_events USING GIN(tags);

-- Enable RLS
ALTER TABLE public.efa_events ENABLE ROW LEVEL SECURITY;

-- Public can view published events
CREATE POLICY "Anyone can view published events"
ON public.efa_events
FOR SELECT
USING (is_published = true);

-- Admins can view all events (including unpublished)
CREATE POLICY "Admins can view all events"
ON public.efa_events
FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));

-- Admins can insert events
CREATE POLICY "Admins can insert events"
ON public.efa_events
FOR INSERT
WITH CHECK (has_app_role(auth.uid(), 'admin'));

-- Admins can update events
CREATE POLICY "Admins can update events"
ON public.efa_events
FOR UPDATE
USING (has_app_role(auth.uid(), 'admin'));

-- Admins can delete events
CREATE POLICY "Admins can delete events"
ON public.efa_events
FOR DELETE
USING (has_app_role(auth.uid(), 'admin'));

-- Create efa_event_leads table for lead capture
CREATE TABLE public.efa_event_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.efa_events(id) ON DELETE SET NULL,
  lead_type TEXT NOT NULL CHECK (lead_type IN ('Planning Help', 'Vendor Interest', 'Reminders')),
  name TEXT NULL,
  email TEXT NOT NULL,
  phone TEXT NULL,
  message TEXT NULL,
  business_name TEXT NULL,
  service_type TEXT NULL,
  state_interest TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on leads
ALTER TABLE public.efa_event_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert leads (for form submissions)
CREATE POLICY "Anyone can submit leads"
ON public.efa_event_leads
FOR INSERT
WITH CHECK (true);

-- Admins can view all leads
CREATE POLICY "Admins can view all leads"
ON public.efa_event_leads
FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));

-- Admins can delete leads
CREATE POLICY "Admins can delete leads"
ON public.efa_event_leads
FOR DELETE
USING (has_app_role(auth.uid(), 'admin'));

-- Seed initial events
INSERT INTO public.efa_events (name, category, event_date_start, time_text, venue, city, county, state, is_vendor_friendly, booth_fee, organizer_email, is_published) VALUES
('Tampa Bay Senior Expo', 'Senior Expo', '2026-01-28 10:00:00-05', '10:00 AM – 2:00 PM', 'St. Petersburg Coliseum', 'St. Petersburg', 'Pinellas', 'FL', true, '$495 starting', 'dlabell@tampabay.com', true),
('Tampa Bay Senior Expo', 'Senior Expo', '2026-03-12 10:00:00-05', '10:00 AM – 2:00 PM', 'Gulf View Square Mall', 'Port Richey', 'Pasco', 'FL', true, '$395 starting', 'dlabell@tampabay.com', true),
('Will & Estate Planning Workshop', 'Estate Planning', '2026-01-11 10:00:00-05', NULL, 'Mt. Zion Progressive Missionary Baptist Church', 'St. Petersburg', 'Pinellas', 'FL', false, NULL, NULL, true),
('Grief Relief & Recovery After the Storm Workshop', 'Grief Support', '2026-01-06 10:00:00-05', NULL, 'Palm Harbor Library', 'Palm Harbor', 'Pinellas', 'FL', false, NULL, NULL, true),
('Grief Relief & Recovery After the Storm Workshop', 'Grief Support', '2026-01-20 10:00:00-05', NULL, 'Redington Beach Town Hall', 'Redington Beach', 'Pinellas', 'FL', false, NULL, NULL, true);

-- Add trigger for updated_at
CREATE TRIGGER update_efa_events_updated_at
BEFORE UPDATE ON public.efa_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();