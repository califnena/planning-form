-- Create storage bucket for funeral photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('funeral-photos', 'funeral-photos', true);

-- Allow authenticated users to upload their own funeral photos
CREATE POLICY "Users can upload their own funeral photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'funeral-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to view their own funeral photos
CREATE POLICY "Users can view their own funeral photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'funeral-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own funeral photos
CREATE POLICY "Users can update their own funeral photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'funeral-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own funeral photos
CREATE POLICY "Users can delete their own funeral photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'funeral-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to view funeral photos (for PDF generation, etc.)
CREATE POLICY "Anyone can view funeral photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'funeral-photos');