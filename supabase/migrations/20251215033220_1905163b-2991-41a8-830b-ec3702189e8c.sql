-- Remove SSN storage from decedents table per PII protection policy
-- SSN should only be collected temporarily for PDF generation, not stored
ALTER TABLE public.decedents DROP COLUMN IF EXISTS ssn_encrypted;