-- Add faculty and subcategory columns to courses table if they don't exist
-- This migration is idempotent and safe to run multiple times

DO $$ 
BEGIN
    -- Add faculty column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'faculty'
    ) THEN
        ALTER TABLE public.courses ADD COLUMN faculty TEXT;
    END IF;

    -- Add subcategory column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'subcategory'
    ) THEN
        ALTER TABLE public.courses ADD COLUMN subcategory TEXT;
    END IF;
END $$;
