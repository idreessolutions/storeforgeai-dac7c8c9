-- Create storage bucket for themes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'themes',
  'themes',
  false,
  52428800, -- 50MB limit
  ARRAY['application/zip', 'application/x-zip-compressed']
);

-- RLS policies for themes bucket
CREATE POLICY "Service role can manage theme files"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'themes');

CREATE POLICY "Authenticated users can read theme files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'themes');