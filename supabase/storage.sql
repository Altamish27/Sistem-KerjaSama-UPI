-- ============================================
-- SUPABASE STORAGE BUCKET CONFIGURATION
-- ============================================
-- Konfigurasi untuk Supabase Storage buckets
-- File ini berisi SQL untuk membuat dan mengkonfigurasi bucket

-- ============================================
-- CREATE BUCKETS
-- ============================================

-- Bucket untuk dokumen proposal
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proposal-documents',
  'proposal-documents',
  false, -- private bucket, butuh authentication
  10485760, -- 10MB max file size
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ]::text[]
) ON CONFLICT (id) DO NOTHING;

-- Bucket untuk avatar user (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- public bucket
  2097152, -- 2MB max file size
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
  ]::text[]
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES - DISABLED
-- ============================================
-- Storage policies dinonaktifkan untuk simplifikasi
-- Security akan dihandle di application layer

-- NOTE: Jika ingin enable policies di production, uncomment section berikut:
--
-- CREATE POLICY "Authenticated users can view proposal documents"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (bucket_id = 'proposal-documents');
--
-- CREATE POLICY "Authenticated users can upload proposal documents"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'proposal-documents');
--
-- Dst...

-- ============================================
-- STORAGE HELPER FUNCTIONS
-- ============================================

-- Function untuk generate storage path yang terorganisir
CREATE OR REPLACE FUNCTION generate_storage_path(
  p_proposal_id UUID,
  p_category VARCHAR,
  p_filename VARCHAR
)
RETURNS TEXT AS $$
DECLARE
  year_str VARCHAR(4);
  month_str VARCHAR(2);
  storage_path TEXT;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  month_str := TO_CHAR(NOW(), 'MM');
  
  -- Format: {year}/{month}/{proposal_id}/{category}/{timestamp}_{filename}
  storage_path := year_str || '/' || 
                  month_str || '/' || 
                  p_proposal_id::text || '/' || 
                  p_category || '/' ||
                  EXTRACT(EPOCH FROM NOW())::bigint::text || '_' ||
                  p_filename;
  
  RETURN storage_path;
END;
$$ LANGUAGE plpgsql;

-- Function untuk cleanup dokumen lama dari storage saat proposal dihapus
CREATE OR REPLACE FUNCTION cleanup_proposal_documents()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete all files dari storage bucket untuk proposal ini
  DELETE FROM storage.objects
  WHERE bucket_id = 'proposal-documents'
  AND name LIKE '%' || OLD.id::text || '%';
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger untuk auto-cleanup storage saat proposal dihapus
CREATE TRIGGER cleanup_proposal_documents_trigger
  BEFORE DELETE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_proposal_documents();

-- ============================================
-- STORAGE BUCKET ORGANIZATION
-- ============================================
-- Struktur folder di bucket 'proposal-documents':
-- 
-- proposal-documents/
--   ├── 2024/
--   │   ├── 01/
--   │   │   ├── {proposal_id}/
--   │   │   │   ├── initial/
--   │   │   │   │   └── {timestamp}_{filename}
--   │   │   │   ├── revision/
--   │   │   │   │   └── {timestamp}_{filename}
--   │   │   │   ├── legal/
--   │   │   │   │   └── {timestamp}_{filename}
--   │   │   │   ├── signed/
--   │   │   │   │   └── {timestamp}_{filename}
--   │   │   │   ├── final/
--   │   │   │   │   └── {timestamp}_{filename}
--   │   │   │   └── archived/
--   │   │   │       └── {timestamp}_{filename}
--   │   │   └── ...
--   │   └── ...
--   └── ...
--
-- Category types:
-- - initial: Dokumen proposal awal
-- - revision: Dokumen hasil revisi (dari mitra atau DKUI)
-- - legal: Dokumen hasil review legal
-- - signed: Dokumen yang sudah ditandatangani
-- - final: Dokumen final hasil pertukaran
-- - archived: Dokumen yang sudah diarsipkan

-- ============================================
-- EXAMPLE USAGE
-- ============================================
-- 
-- Untuk upload file:
-- 1. Client upload file ke bucket menggunakan Supabase client
-- 2. Simpan metadata ke table 'documents' dengan storage_path
-- 
-- Contoh:
-- INSERT INTO documents (
--   proposal_id,
--   name,
--   type,
--   size,
--   storage_path,
--   category,
--   uploaded_by
-- ) VALUES (
--   '{proposal_id}',
--   'proposal.pdf',
--   'application/pdf',
--   1024576,
--   generate_storage_path('{proposal_id}', 'initial', 'proposal.pdf'),
--   'initial',
--   auth.uid()
-- );
