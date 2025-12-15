-- Add AI-generated content fields to efa_events
ALTER TABLE public.efa_events 
ADD COLUMN list_summary text NULL,
ADD COLUMN email_subject text NULL,
ADD COLUMN email_preview text NULL,
ADD COLUMN email_body text NULL;