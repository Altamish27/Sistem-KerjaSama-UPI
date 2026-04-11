-- ============================================
-- SUPABASE STORAGE BUCKET CONFIGURATION
-- ============================================
-- Konfigurasi Storage buckets untuk Sistem Kerja Sama UPI.
-- Run ini di Supabase SQL Editor SETELAH schema.sql.

-- ============================================
-- CREATE BUCKETS
-- ============================================

-- Bucket utama untuk semua dokumen kerja sama
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proposal-documents',
  'proposal-documents',
  false,        -- Private: butuh authentication
  10485760,     -- 10MB max
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

-- Bucket untuk dokumen penjajakan (guest upload, bisa tanpa auth)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'penjajakan-documents',
  'penjajakan-documents',
  false,        -- Private tapi accessible via signed URL
  5242880,      -- 5MB max
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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
  true,         -- Public
  2097152,      -- 2MB max
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
-- RLS & policies dinonaktifkan untuk simplifikasi development.
-- Security di-handle di application layer (API routes).
-- Uncomment di production jika diperlukan.

-- ============================================
-- STORAGE HELPER FUNCTIONS
-- ============================================

-- Generate storage path yang terorganisir per proposal
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

-- Generate storage path untuk dokumen penjajakan (guest upload)
CREATE OR REPLACE FUNCTION generate_penjajakan_storage_path(
  p_penjajakan_id UUID,
  p_category VARCHAR,
  p_filename VARCHAR
)
RETURNS TEXT AS $$
DECLARE
  year_str VARCHAR(4);
  storage_path TEXT;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');

  -- Format: penjajakan/{year}/{penjajakan_id}/{category}/{timestamp}_{filename}
  storage_path := 'penjajakan/' || year_str || '/' ||
                  p_penjajakan_id::text || '/' ||
                  p_category || '/' ||
                  EXTRACT(EPOCH FROM NOW())::bigint::text || '_' ||
                  p_filename;

  RETURN storage_path;
END;
$$ LANGUAGE plpgsql;

-- Cleanup dokumen saat proposal dihapus
-- NOTE: Cleanup trigger DIHAPUS karena Supabase memblokir
-- DELETE FROM storage.objects via storage.protect_delete().
-- Pembersihan file storage ditangani di application layer
-- menggunakan Supabase Storage API (lihat scripts/reset-proposals.ts).

-- CREATE OR REPLACE FUNCTION cleanup_proposal_documents() ...
-- CREATE TRIGGER cleanup_proposal_documents_trigger ...

-- ============================================
-- STORAGE BUCKET ORGANIZATION
-- ============================================
--
-- proposal-documents/
--   └── {year}/{month}/{proposal_id}/
--       ├── initial/           — Dokumen proposal awal
--       ├── berita_acara/      — Berita Acara Penjajakan (wajib)
--       ├── surat_kuasa/       — Surat Kuasa Rektor (opsional, Path B)
--       ├── revision/          — Dokumen hasil revisi
--       ├── legal/             — Dokumen review legalitas
--       ├── signed/            — Dokumen yang sudah ditandatangani
--       ├── final/             — Naskah final
--       └── archived/          — Dokumen arsip
--
-- penjajakan-documents/
--   └── penjajakan/{year}/{penjajakan_id}/
--       ├── legalitas/         — Akta pendirian / surat izin mitra
--       └── profil/            — Company profile mitra
--
-- avatars/
--   └── {user_id}.{ext}
