-- Hapus akun DKUI dengan email hasbiberbagi@gmail.com
-- Agar email ini bisa dipakai untuk testing akun mitra

BEGIN;

-- 1. Update proposals yang dibuat oleh user ini jadi created_by = NULL
UPDATE proposals 
SET created_by = NULL,
    is_public_submission = true
WHERE created_by IN (
  SELECT id FROM users WHERE email = 'hasbiberbagi@gmail.com'
);

-- 2. Hapus dari tabel approval_history juga
DELETE FROM approval_history
WHERE actor_id IN (
  SELECT id FROM users WHERE email = 'hasbiberbagi@gmail.com'
);

-- 3. Hapus user DKUI dengan email hasbiberbagi@gmail.com
DELETE FROM users 
WHERE email = 'hasbiberbagi@gmail.com';

COMMIT;

-- Cek hasil - seharusnya tidak ada user dengan email ini
SELECT id, email, name, role 
FROM users 
WHERE email = 'hasbiberbagi@gmail.com';

SELECT '✅ Akun DKUI sudah dihapus. Email hasbiberbagi@gmail.com siap untuk akun mitra test.' as result;
