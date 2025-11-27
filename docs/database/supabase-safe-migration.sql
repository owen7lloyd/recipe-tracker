-- Safe migration script - only adds what's missing
-- Run this in Supabase SQL Editor

-- Add share columns to grocery_lists if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'grocery_lists' AND column_name = 'share_token'
    ) THEN
        ALTER TABLE grocery_lists ADD COLUMN share_token TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'grocery_lists' AND column_name = 'share_expires_at'
    ) THEN
        ALTER TABLE grocery_lists ADD COLUMN share_expires_at TIMESTAMP;
    END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_grocery_lists_share_token ON grocery_lists(share_token);

-- Enable realtime on grocery_list_items
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE grocery_list_items;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Table already in publication, ignore
END $$;

-- Verify it worked
SELECT
    'grocery_lists columns' as check_type,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'grocery_lists'
    AND column_name IN ('share_token', 'share_expires_at')
UNION ALL
SELECT
    'realtime publication' as check_type,
    tablename as column_name,
    'enabled' as data_type
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
    AND tablename = 'grocery_list_items';
