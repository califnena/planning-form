
ALTER TABLE public.error_logs 
ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS resolved_by uuid DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON public.error_logs(resolved_at) WHERE resolved_at IS NULL;
