-- Create audit_log table for tracking section events
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('section_updated', 'section_completed', 'section_uncompleted', 'section_reset', 'section_archived')),
  section_id TEXT NOT NULL,
  changed_fields_count INTEGER,
  archive_id UUID,
  note TEXT,
  planner_mode TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_log
CREATE POLICY "Users can view their own audit logs"
ON public.audit_log
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own audit logs"
ON public.audit_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for fast queries
CREATE INDEX IF NOT EXISTS idx_audit_log_user_section ON public.audit_log(user_id, section_id, created_at DESC);

-- Create share_links table for multiple share links per person
CREATE TABLE IF NOT EXISTS public.share_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  share_archives BOOLEAN NOT NULL DEFAULT false,
  permissions_scope TEXT NOT NULL DEFAULT 'completed_only',
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  total_views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

-- Create policies for share_links
CREATE POLICY "Users can view their own share links"
ON public.share_links
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own share links"
ON public.share_links
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own share links"
ON public.share_links
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own share links"
ON public.share_links
FOR DELETE
USING (auth.uid() = user_id);

-- Create share_link_access_log table
CREATE TABLE IF NOT EXISTS public.share_link_access_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_link_id UUID NOT NULL REFERENCES public.share_links(id) ON DELETE CASCADE,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'unknown')),
  ip_hash TEXT,
  country TEXT
);

-- Enable RLS for access log (owners can read via share_links join)
ALTER TABLE public.share_link_access_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only the share link owner can view access logs
CREATE POLICY "Share link owners can view access logs"
ON public.share_link_access_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.share_links sl
    WHERE sl.id = share_link_id AND sl.user_id = auth.uid()
  )
);

-- Policy: Anyone can insert access logs (for tracking accesses)
CREATE POLICY "Anyone can log share link access"
ON public.share_link_access_log
FOR INSERT
WITH CHECK (true);

-- Create index for fast access log queries
CREATE INDEX IF NOT EXISTS idx_share_link_access_log_link ON public.share_link_access_log(share_link_id, accessed_at DESC);

-- Add column to user_settings to track skip confirmation preference
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS skip_share_confirmation BOOLEAN DEFAULT false;