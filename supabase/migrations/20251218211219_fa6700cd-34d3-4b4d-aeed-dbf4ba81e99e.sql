-- Remove sensitive PII columns from personal_profiles table
-- SSN and DOB should not be stored in the database

ALTER TABLE public.personal_profiles DROP COLUMN IF EXISTS ssn;
ALTER TABLE public.personal_profiles DROP COLUMN IF EXISTS dob;