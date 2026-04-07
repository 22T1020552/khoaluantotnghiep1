-- Add profile fields to USERS for admin user management.
-- Run manually on PostgreSQL before starting backend with ddl-auto=none.

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS full_name VARCHAR(120),
    ADD COLUMN IF NOT EXISTS email VARCHAR(120),
    ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE;

UPDATE public.users
SET full_name = COALESCE(NULLIF(TRIM(full_name), ''), username)
WHERE full_name IS NULL OR TRIM(full_name) = '';

UPDATE public.users
SET email = COALESCE(NULLIF(TRIM(email), ''), CONCAT(username, '@local.phongkham'))
WHERE email IS NULL OR TRIM(email) = '';

UPDATE public.users
SET phone_number = COALESCE(phone_number, '')
WHERE phone_number IS NULL;

UPDATE public.users
SET created_at = COALESCE(created_at, NOW())
WHERE created_at IS NULL;

ALTER TABLE public.users
    ALTER COLUMN full_name SET NOT NULL,
    ALTER COLUMN email SET NOT NULL,
    ALTER COLUMN phone_number SET NOT NULL,
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN created_at SET DEFAULT NOW();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public' AND indexname = 'ux_users_email_lower'
    ) THEN
        CREATE UNIQUE INDEX ux_users_email_lower ON public.users (LOWER(email));
    END IF;
END $$;
