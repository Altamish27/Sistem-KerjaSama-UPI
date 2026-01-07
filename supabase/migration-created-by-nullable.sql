-- ============================================
-- MIGRATION: Make created_by Nullable
-- ============================================
-- Run ini di Supabase SQL Editor
-- Membuat created_by nullable untuk support public submission

-- Proposal yang dibuat via public submission belum punya user account
-- Jadi created_by bisa NULL sampai user account dibuat setelah approval
ALTER TABLE proposals ALTER COLUMN created_by DROP NOT NULL;

-- Verify
COMMENT ON COLUMN proposals.created_by IS 'User yang membuat proposal. NULL untuk public submission sebelum approval.';
