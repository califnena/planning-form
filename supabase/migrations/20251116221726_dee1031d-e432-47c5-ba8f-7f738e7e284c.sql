-- Add preferred_language column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

COMMENT ON COLUMN public.profiles.preferred_language IS 'User preferred language for UI and PDFs (en, es, pt, fr, it, pl)';