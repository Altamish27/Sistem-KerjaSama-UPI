-- ============================================
-- Fix: Drop problematic storage trigger
-- ============================================
-- Trigger cleanup_proposal_documents_trigger melakukan
-- DELETE FROM storage.objects yang SELALU diblokir oleh
-- Supabase storage.protect_delete().
--
-- Storage cleanup ditangani di application layer (Storage API).
-- Jalankan ini SEKALI di Supabase SQL Editor.

-- 1. Hapus trigger yang bermasalah
DROP TRIGGER IF EXISTS cleanup_proposal_documents_trigger ON proposals;
DROP FUNCTION IF EXISTS cleanup_proposal_documents();

-- 2. RPC untuk reset semua proposal (dipanggil script)
CREATE OR REPLACE FUNCTION reset_all_proposals()
RETURNS void AS $$
BEGIN
  DELETE FROM approval_history WHERE id IS NOT NULL;
  DELETE FROM documents WHERE id IS NOT NULL;
  DELETE FROM proposals WHERE id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
