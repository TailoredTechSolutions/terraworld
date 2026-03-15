-- Create a public bucket for all static assets (farms, products, logos, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('static-assets', 'static-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to all files in the bucket
CREATE POLICY "Public read access for static assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'static-assets');

-- Allow authenticated admins to upload/manage assets
CREATE POLICY "Admins can manage static assets"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'static-assets' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'static-assets' AND public.has_role(auth.uid(), 'admin'));