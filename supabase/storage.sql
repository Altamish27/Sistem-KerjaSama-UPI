-- Storage Bucket Configuration
-- Jalankan script ini setelah schema.sql di Supabase SQL Editor

-- ================================================
-- BUAT STORAGE BUCKETS
-- ================================================

-- Bucket untuk dokumen proposal
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proposal-documents', 
  'proposal-documents', 
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket untuk tanda tangan digital dan materai
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'signatures', 
  'signatures', 
  false,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- STORAGE POLICIES - proposal-documents
-- ================================================

-- Policy: Authenticated users dapat melihat/download semua dokumen
CREATE POLICY "Allow authenticated users to read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'proposal-documents');

-- Policy: Authenticated users dapat upload dokumen
CREATE POLICY "Allow authenticated users to upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'proposal-documents' AND
    (auth.role() = 'authenticated')
);

-- Policy: Users dapat update dokumen yang mereka upload
CREATE POLICY "Allow users to update their uploaded documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'proposal-documents' AND
    (auth.uid()::text = (storage.foldername(name))[2] OR
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('dkui', 'biro_hukum', 'fakultas')
    ))
);

-- Policy: Users dapat delete dokumen yang mereka upload
CREATE POLICY "Allow users to delete their uploaded documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'proposal-documents' AND
    (auth.uid()::text = (storage.foldername(name))[2] OR
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('dkui', 'biro_hukum')
    ))
);

-- ================================================
-- STORAGE POLICIES - signatures
-- ================================================

-- Policy: Authenticated users dapat melihat signatures
CREATE POLICY "Allow authenticated users to read signatures"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'signatures');

-- Policy: Users dapat upload signature mereka sendiri
CREATE POLICY "Allow users to upload their signatures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'signatures' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users dapat update signature mereka sendiri
CREATE POLICY "Allow users to update their signatures"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'signatures' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users dapat delete signature mereka sendiri
CREATE POLICY "Allow users to delete their signatures"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'signatures' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ================================================
-- VERIFICATION
-- ================================================

-- Tampilkan buckets yang sudah dibuat
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id IN ('proposal-documents', 'signatures');

-- Tampilkan policies yang sudah dibuat
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;
