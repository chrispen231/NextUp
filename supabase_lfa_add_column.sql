-- Add the missing logo_url column to the leagues table
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS logo_url TEXT;
