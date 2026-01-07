-- Migration script untuk create users dari mock data ke Supabase Auth + Database
-- Run ini di Supabase SQL Editor setelah schema.sql dijalankan

-- DKUI Admin
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Insert ke users table dulu (tanpa password, password akan di auth.users)
  INSERT INTO users (id, email, name, role, unit)
  VALUES (
    gen_random_uuid(),
    'admin.dkui@upi.edu',
    'Dr. Bambang Suharto',
    'dkui',
    'DKUI'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO user_id;
  
  -- Note: Untuk create auth user, gunakan Supabase Dashboard atau API
  -- karena password hashing harus melalui Supabase Auth API
END $$;

-- Fakultas FPMIPA
INSERT INTO users (id, email, name, role, unit)
VALUES (
  gen_random_uuid(),
  'dekan.fpmipa@upi.edu',
  'Prof. Dr. Ari Widodo',
  'faculty_dean',
  'FPMIPA'
)
ON CONFLICT (email) DO NOTHING;

-- Biro Hukum
INSERT INTO users (id, email, name, role, unit)
VALUES (
  gen_random_uuid(),
  'legal@upi.edu',
  'Dra. Siti Nurjanah',
  'legal',
  'Biro Hukum'
)
ON CONFLICT (email) DO NOTHING;

-- Mitra Example
INSERT INTO users (id, email, name, role, unit)
VALUES (
  gen_random_uuid(),
  'mitra@example.com',
  'PT Mitra Sejahtera',
  'partner',
  NULL
)
ON CONFLICT (email) DO NOTHING;

-- IMPORTANT: Setelah run SQL ini, perlu create auth users via Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Klik "Add User"
-- 3. Masukkan email yang sama dengan di atas
-- 4. Set password (misal: Admin123! untuk semua test user)
-- 5. Pastikan user_id di auth.users sama dengan id di users table
--    (atau update users table dengan id dari auth.users)

-- Alternatif: Gunakan script Node.js untuk create via API
-- Lihat scripts/create-users.ts
