-- ============================================
-- MIGRATION: Make uploaded_by Nullable & Add jenis_doc
-- ============================================
-- Run ini di Supabase SQL Editor
-- Dokumen dari public submission belum punya user
-- Tambah kolom jenis dokumen kerjasama

-- 1. Make uploaded_by nullable
ALTER TABLE documents ALTER COLUMN uploaded_by DROP NOT NULL;

COMMENT ON COLUMN documents.uploaded_by IS 'User yang upload dokumen. NULL untuk public submission.';

-- 2. Add jenis_doc column to proposals
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS jenis_doc VARCHAR(10) CHECK (jenis_doc IN ('MoU', 'MoA', 'PKS', 'IA'));

COMMENT ON COLUMN proposals.jenis_doc IS 'Jenis dokumen kerjasama: MoU, MoA, PKS, atau IA';

-- 3. Create index for performance
CREATE INDEX IF NOT EXISTS idx_proposals_jenis_doc ON proposals(jenis_doc) WHERE jenis_doc IS NOT NULL;
