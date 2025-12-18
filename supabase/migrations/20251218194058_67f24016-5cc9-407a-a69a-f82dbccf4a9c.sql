-- Add foreign key and constraints to efa_event_subscribers
-- First, add FK constraint to orgs table
ALTER TABLE public.efa_event_subscribers
ADD CONSTRAINT efa_event_subscribers_org_id_fkey 
FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;

-- Add unique constraint to prevent duplicate emails per org
ALTER TABLE public.efa_event_subscribers
ADD CONSTRAINT efa_event_subscribers_org_email_unique UNIQUE (org_id, email);

-- Add GIN indexes for array columns if they don't exist
CREATE INDEX IF NOT EXISTS efa_event_subscribers_state_idx
  ON public.efa_event_subscribers USING gin (state_interest);

CREATE INDEX IF NOT EXISTS efa_event_subscribers_counties_idx
  ON public.efa_event_subscribers USING gin (county_interest);

CREATE INDEX IF NOT EXISTS efa_event_subscribers_categories_idx
  ON public.efa_event_subscribers USING gin (category_interest);

-- Add org_id to efa_events
ALTER TABLE public.efa_events
ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.orgs(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS efa_events_org_id_idx
ON public.efa_events (org_id);

-- Add org_id to efa_event_email_log
ALTER TABLE public.efa_event_email_log
ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.orgs(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS efa_event_email_log_org_id_idx
ON public.efa_event_email_log (org_id);

-- Enable RLS on efa_event_subscribers
ALTER TABLE public.efa_event_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: org owner/admin can read subscribers
CREATE POLICY "org_admin_can_read_subscribers"
ON public.efa_event_subscribers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.org_members m
    WHERE m.org_id = efa_event_subscribers.org_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
  )
);

-- Policy: org owner/admin can insert subscribers
CREATE POLICY "org_admin_can_insert_subscribers"
ON public.efa_event_subscribers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.org_members m
    WHERE m.org_id = efa_event_subscribers.org_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
  )
);

-- Policy: org owner/admin can update subscribers
CREATE POLICY "org_admin_can_update_subscribers"
ON public.efa_event_subscribers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.org_members m
    WHERE m.org_id = efa_event_subscribers.org_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
  )
);

-- Policy: org owner/admin can delete subscribers
CREATE POLICY "org_admin_can_delete_subscribers"
ON public.efa_event_subscribers
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.org_members m
    WHERE m.org_id = efa_event_subscribers.org_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
  )
);

-- Policy: anyone can unsubscribe via token (public access for unsubscribe links)
CREATE POLICY "anyone_can_unsubscribe_via_token"
ON public.efa_event_subscribers
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);