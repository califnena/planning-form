-- Create signatures storage bucket with public read access
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload signatures
CREATE POLICY "Users can upload signatures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'signatures');

-- Allow public read access to signatures
CREATE POLICY "Public can read signatures"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'signatures');

-- Allow users to update their own signatures
CREATE POLICY "Users can update their signatures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'signatures');

-- Allow users to delete their own signatures
CREATE POLICY "Users can delete their signatures"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'signatures');