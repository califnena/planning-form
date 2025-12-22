-- Create storage bucket for generated PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-pdfs', 'generated-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for PDF templates (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdf-templates', 'pdf-templates', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for generated-pdfs bucket
CREATE POLICY "Users can view their own generated PDFs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'generated-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Service role can upload generated PDFs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'generated-pdfs');

CREATE POLICY "Service role can delete generated PDFs"
ON storage.objects
FOR DELETE
USING (bucket_id = 'generated-pdfs');

-- Public access to PDF templates
CREATE POLICY "Anyone can view PDF templates"
ON storage.objects
FOR SELECT
USING (bucket_id = 'pdf-templates');