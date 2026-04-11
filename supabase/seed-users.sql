-- ============================================
-- SEED DATA - SISTEM KERJA SAMA UPI (SIMKERMA)
-- ============================================
-- Run ini di Supabase SQL Editor SETELAH schema.sql dijalankan.
-- Membuat data awal: unit kerja & user test untuk development.
--
-- IMPORTANT: Setelah run SQL ini, buat auth users via Supabase Dashboard:
--   Authentication > Users > Add User (email + password)
--   Gunakan email yang sama. Password test: Admin123!

-- ============================================
-- 1. UNIT KERJA
-- ============================================
INSERT INTO unit_kerja (id, nama_unit, jenis_unit, kode_unit) VALUES
  (uuid_generate_v4(), 'Fakultas Pendidikan Matematika dan Ilmu Pengetahuan Alam', 'Fakultas', 'FPMIPA'),
  (uuid_generate_v4(), 'Fakultas Pendidikan Bahasa dan Sastra', 'Fakultas', 'FPBS'),
  (uuid_generate_v4(), 'Fakultas Ilmu Pendidikan', 'Fakultas', 'FIP'),
  (uuid_generate_v4(), 'Fakultas Pendidikan Ilmu Pengetahuan Sosial', 'Fakultas', 'FPIPS'),
  (uuid_generate_v4(), 'Fakultas Pendidikan Teknologi dan Kejuruan', 'Fakultas', 'FPTK'),
  (uuid_generate_v4(), 'Fakultas Pendidikan Olahraga dan Kesehatan', 'Fakultas', 'FPOK'),
  (uuid_generate_v4(), 'Fakultas Pendidikan Ekonomi dan Bisnis', 'Fakultas', 'FPEB'),
  (uuid_generate_v4(), 'Fakultas Pendidikan Seni dan Desain', 'Fakultas', 'FPSD'),
  (uuid_generate_v4(), 'Sekolah Pascasarjana', 'Sekolah Pascasarjana', 'SPs'),
  (uuid_generate_v4(), 'Kampus UPI di Cibiru', 'Kampus Daerah', 'CIBIRU'),
  (uuid_generate_v4(), 'Kampus UPI di Tasikmalaya', 'Kampus Daerah', 'TASIK'),
  (uuid_generate_v4(), 'Kampus UPI di Sumedang', 'Kampus Daerah', 'SUMEDANG'),
  (uuid_generate_v4(), 'Kampus UPI di Purwakarta', 'Kampus Daerah', 'PURWAKARTA'),
  (uuid_generate_v4(), 'Kampus UPI di Serang', 'Kampus Daerah', 'SERANG'),
  (uuid_generate_v4(), 'Direktorat Kerja Sama dan Usaha Internasional', 'Direktorat', 'DKUI'),
  (uuid_generate_v4(), 'Kantor Hukum dan Organisasi', 'Biro', 'KHO'),
  (uuid_generate_v4(), 'Sekretariat Universitas', 'Sekretariat', 'SU')
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. USERS (Test Accounts)
-- ============================================
-- Note: role harus sesuai enum user_role yang baru:
--   mitra, pimpinan_unit, dkui, biro_hukum, sekretaris_universitas, wakil_rektor, rektor

-- DKUI Admin
INSERT INTO users (id, email, name, role, unit_id, is_active, email_verified, account_status)
SELECT
  uuid_generate_v4(),
  'admin.dkui@upi.edu',
  'admin.dkui',
  'dkui'::user_role,
  uk.id,
  true, true, 'active'
FROM unit_kerja uk WHERE uk.kode_unit = 'DKUI'
ON CONFLICT (email) DO NOTHING;

-- Pimpinan Unit (Dekan FPMIPA)
INSERT INTO users (id, email, name, role, unit_id, is_active, email_verified, account_status)
SELECT
  uuid_generate_v4(),
  'dekan.fpmipa@upi.edu',
  'dekan.fpmipa',
  'pimpinan_unit'::user_role,
  uk.id,
  true, true, 'active'
FROM unit_kerja uk WHERE uk.kode_unit = 'FPMIPA'
ON CONFLICT (email) DO NOTHING;

-- Operator Unit (FPMIPA) — upload dokumen & tracking
INSERT INTO users (id, email, name, role, unit_id, is_active, email_verified, account_status)
SELECT
  uuid_generate_v4(),
  'operator.fpmipa@upi.edu',
  'operator.fpmipa',
  'operator_unit'::user_role,
  uk.id,
  true, true, 'active'
FROM unit_kerja uk WHERE uk.kode_unit = 'FPMIPA'
ON CONFLICT (email) DO NOTHING;

-- Pimpinan Unit (Dekan FIP)
INSERT INTO users (id, email, name, role, unit_id, is_active, email_verified, account_status)
SELECT
  uuid_generate_v4(),
  'dekan.fip@upi.edu',
  'dekan.fip',
  'pimpinan_unit'::user_role,
  uk.id,
  true, true, 'active'
FROM unit_kerja uk WHERE uk.kode_unit = 'FIP'
ON CONFLICT (email) DO NOTHING;

-- Biro Hukum
INSERT INTO users (id, email, name, role, unit_id, is_active, email_verified, account_status)
SELECT
  uuid_generate_v4(),
  'legal@upi.edu',
  'legal',
  'biro_hukum'::user_role,
  uk.id,
  true, true, 'active'
FROM unit_kerja uk WHERE uk.kode_unit = 'KHO'
ON CONFLICT (email) DO NOTHING;

-- Sekretaris Universitas
INSERT INTO users (id, email, name, role, unit_id, is_active, email_verified, account_status)
SELECT
  uuid_generate_v4(),
  'sekretaris@upi.edu',
  'sekretaris',
  'sekretaris_universitas'::user_role,
  uk.id,
  true, true, 'active'
FROM unit_kerja uk WHERE uk.kode_unit = 'SU'
ON CONFLICT (email) DO NOTHING;

-- Wakil Rektor (Bidang Riset, Usaha & Kerja Sama)
INSERT INTO users (id, email, name, role, is_active, email_verified, account_status)
VALUES (
  uuid_generate_v4(),
  'warek.ruk@upi.edu',
  'warek.ruk',
  'wakil_rektor'::user_role,
  true, true, 'active'
)
ON CONFLICT (email) DO NOTHING;

-- Rektor
INSERT INTO users (id, email, name, role, is_active, email_verified, account_status)
VALUES (
  uuid_generate_v4(),
  'rektor@upi.edu',
  'rektor',
  'rektor'::user_role,
  true, true, 'active'
)
ON CONFLICT (email) DO NOTHING;

-- Mitra (Test)
INSERT INTO users (id, email, name, role, institution, is_active, email_verified, account_status)
VALUES (
  uuid_generate_v4(),
  'mitra@example.com',
  'mitra',
  'mitra'::user_role,
  'PT Mitra Sejahtera',
  true, true, 'active'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 3. MITRA (Test Partner Institution)
-- ============================================
INSERT INTO mitra (id, nama_instansi, alamat_lengkap, jenis_mitra, nama_penandatangan, jabatan_penandatangan, nama_pic, kontak_pic, email_pic)
VALUES (
  uuid_generate_v4(),
  'PT Mitra Sejahtera',
  'Jl. Merdeka No. 123, Bandung 40115',
  'dalam_negeri',
  'mitra',
  'Direktur Utama',
  'mitra',
  '08123456789',
  'mitra@example.com'
)
ON CONFLICT DO NOTHING;
