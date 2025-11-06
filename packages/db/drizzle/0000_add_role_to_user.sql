-- Migration: Add role column to user table
-- This is an incremental migration since tables already exist from db:push

-- Add role column to user table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user' AND column_name = 'role'
  ) THEN
    ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'member' NOT NULL;
  END IF;
END $$;
