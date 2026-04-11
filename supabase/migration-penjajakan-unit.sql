-- ============================================
-- MIGRATION: Penjajakan Unit Assignment & Review
-- ============================================
-- Menambahkan kolom unit_terkait_id, unit_reviewed_by, unit_reviewed_at
-- ke tabel pengajuan_penjajakan, serta status enum baru 'diterima_unit'.
-- 
-- Jalankan SQL ini di Supabase SQL Editor.
-- ============================================

-- 1. Tambah status baru ke enum
ALTER TYPE status_pengajuan ADD VALUE IF NOT EXISTS 'diterima_unit';

-- 2. Tambah kolom unit assignment
ALTER TABLE pengajuan_penjajakan
  ADD COLUMN IF NOT EXISTS unit_terkait_id UUID REFERENCES unit_kerja(id);

-- 3. Tambah kolom review oleh pimpinan unit
ALTER TABLE pengajuan_penjajakan
  ADD COLUMN IF NOT EXISTS unit_reviewed_by UUID REFERENCES users(id);

ALTER TABLE pengajuan_penjajakan
  ADD COLUMN IF NOT EXISTS unit_reviewed_at TIMESTAMPTZ;

-- 4. Index untuk query per unit
CREATE INDEX IF NOT EXISTS idx_penjajakan_unit ON pengajuan_penjajakan(unit_terkait_id)
  WHERE unit_terkait_id IS NOT NULL;

-- 5. Update view pengajuan_with_mitra untuk include unit info
DROP VIEW IF EXISTS pengajuan_with_mitra;

CREATE VIEW pengajuan_with_mitra AS
SELECT
  pp.*,
  m.nama_instansi AS mitra_nama_instansi,
  m.email_pic AS mitra_email_pic,
  m.nama_pic AS mitra_nama_pic,
  u.name AS reviewer_name,
  u.email AS reviewer_email,
  uk.nama_unit AS unit_nama,
  uk.jenis_unit AS unit_jenis,
  ur.name AS unit_reviewer_name
FROM pengajuan_penjajakan pp
LEFT JOIN mitra m ON pp.mitra_id = m.id
LEFT JOIN users u ON pp.reviewed_by = u.id
LEFT JOIN unit_kerja uk ON pp.unit_terkait_id = uk.id
LEFT JOIN users ur ON pp.unit_reviewed_by = ur.id;

COMMENT ON VIEW pengajuan_with_mitra IS 'Pengajuan penjajakan dengan info mitra, unit kerja, dan reviewer';
