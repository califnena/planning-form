-- Drop the public viewing policy that allows anyone to view funeral photos
DROP POLICY IF EXISTS "Anyone can view funeral photos" ON storage.objects;

-- Make funeral-photos bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'funeral-photos';

-- Add policies for profile avatars (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can view their own profile avatar'
  ) THEN
    CREATE POLICY "Users can view their own profile avatar"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'funeral-photos' 
      AND name LIKE auth.uid()::text || '.%'
      AND array_length(string_to_array(name, '/'), 1) = 1
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload their own profile avatar'
  ) THEN
    CREATE POLICY "Users can upload their own profile avatar"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'funeral-photos' 
      AND name LIKE auth.uid()::text || '.%'
      AND array_length(string_to_array(name, '/'), 1) = 1
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their own profile avatar'
  ) THEN
    CREATE POLICY "Users can update their own profile avatar"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'funeral-photos' 
      AND name LIKE auth.uid()::text || '.%'
      AND array_length(string_to_array(name, '/'), 1) = 1
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own profile avatar'
  ) THEN
    CREATE POLICY "Users can delete their own profile avatar"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'funeral-photos' 
      AND name LIKE auth.uid()::text || '.%'
      AND array_length(string_to_array(name, '/'), 1) = 1
    );
  END IF;
END $$;