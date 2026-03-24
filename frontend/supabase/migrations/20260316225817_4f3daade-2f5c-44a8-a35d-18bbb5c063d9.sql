-- Create public site-images bucket for all rendered assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access
CREATE POLICY "Public read access for site-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'site-images');

-- Allow authenticated uploads
CREATE POLICY "Authenticated upload to site-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-images');

-- Allow authenticated delete from site-images
CREATE POLICY "Authenticated delete from site-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-images');