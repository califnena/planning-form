-- Add org_id column to efa_event_subscribers for org-scoped subscriber lists
ALTER TABLE public.efa_event_subscribers
ADD COLUMN IF NOT EXISTS org_id uuid;

-- Create index for efficient org-based queries
CREATE INDEX IF NOT EXISTS efa_event_subscribers_org_id_idx
ON public.efa_event_subscribers (org_id);