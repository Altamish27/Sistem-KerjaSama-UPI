    -- WARNING: This script will delete all data from the proposals table and related tables.
-- This action is irreversible. Make sure you have a backup if needed.

-- Use TRUNCATE ... CASCADE to empty the tables.
-- CASCADE will automatically truncate dependent tables.

BEGIN;

-- The main proposals table (CASCADE will handle documents and approval_history)
TRUNCATE TABLE "public"."proposals" RESTART IDENTITY CASCADE;

-- Clear email notifications separately since it might not be cascaded
TRUNCATE TABLE "public"."email_notifications" RESTART IDENTITY CASCADE;

-- Clear user invitations if needed
TRUNCATE TABLE "public"."user_invitations" RESTART IDENTITY CASCADE;

COMMIT;

SELECT 'All proposal data has been successfully deleted.' AS result;
