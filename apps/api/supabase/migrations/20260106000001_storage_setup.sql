-- Storage bucket setup for videos
-- This creates the videos bucket and sets up RLS policies

-- Create the videos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  false,
  52428800, -- 50MB
  ARRAY['video/mp4', 'video/quicktime', 'video/x-m4v', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for videos bucket

-- Allow authenticated users to upload videos to their own folder
CREATE POLICY "Users can upload videos to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own videos
CREATE POLICY "Users can view own videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own videos
CREATE POLICY "Users can delete own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow service role full access (for cleanup function)
CREATE POLICY "Service role can manage all videos"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'videos')
WITH CHECK (bucket_id = 'videos');
