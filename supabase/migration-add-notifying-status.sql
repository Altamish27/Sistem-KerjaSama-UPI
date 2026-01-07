-- ============================================
-- MIGRATION: Add dkui_notifying_mitra status
-- ============================================
-- Run ini di Supabase SQL Editor setelah migration sebelumnya

-- Add new status to proposal_status enum
ALTER TYPE proposal_status ADD VALUE IF NOT EXISTS 'dkui_notifying_mitra';

-- Comment untuk dokumentasi
COMMENT ON TYPE proposal_status IS 'Status proposal workflow - Updated: Added dkui_notifying_mitra for sending credentials to mitra after faculty approval';
