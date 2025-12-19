-- Create efa_event_contacts table to store sensitive organizer contact info
CREATE TABLE IF NOT EXISTS public.efa_event_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.efa_events(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.orgs(id),
  organizer_name text,
  organizer_email text,
  organizer_phone text,
  contact_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id)
);

-- Enable RLS on efa_event_contacts
ALTER TABLE public.efa_event_contacts ENABLE ROW LEVEL SECURITY;

-- Only org owner/admin can read event contacts
CREATE POLICY "efa_event_contacts: org admin read"
ON public.efa_event_contacts
FOR SELECT
TO authenticated
USING (
  has_app_role(auth.uid(), 'admin'::text) OR
  (org_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.org_members om
    WHERE om.org_id = efa_event_contacts.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
  ))
);

-- Only org owner/admin can insert event contacts
CREATE POLICY "efa_event_contacts: org admin insert"
ON public.efa_event_contacts
FOR INSERT
TO authenticated
WITH CHECK (
  has_app_role(auth.uid(), 'admin'::text) OR
  (org_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.org_members om
    WHERE om.org_id = efa_event_contacts.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
  ))
);

-- Only org owner/admin can update event contacts
CREATE POLICY "efa_event_contacts: org admin update"
ON public.efa_event_contacts
FOR UPDATE
TO authenticated
USING (
  has_app_role(auth.uid(), 'admin'::text) OR
  (org_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.org_members om
    WHERE om.org_id = efa_event_contacts.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
  ))
);

-- Only org owner/admin can delete event contacts
CREATE POLICY "efa_event_contacts: org admin delete"
ON public.efa_event_contacts
FOR DELETE
TO authenticated
USING (
  has_app_role(auth.uid(), 'admin'::text) OR
  (org_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.org_members om
    WHERE om.org_id = efa_event_contacts.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
  ))
);

-- Migrate existing organizer data from efa_events to efa_event_contacts
INSERT INTO public.efa_event_contacts (event_id, org_id, organizer_name, organizer_email, organizer_phone)
SELECT id, org_id, organizer_name, organizer_email, organizer_phone
FROM public.efa_events
WHERE organizer_email IS NOT NULL OR organizer_phone IS NOT NULL OR organizer_name IS NOT NULL
ON CONFLICT (event_id) DO NOTHING;

-- Remove sensitive columns from efa_events
ALTER TABLE public.efa_events DROP COLUMN IF EXISTS organizer_email;
ALTER TABLE public.efa_events DROP COLUMN IF EXISTS organizer_phone;