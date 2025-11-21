-- Setup Supabase Realtime for grocery_list_items
-- Run this in your Supabase SQL Editor

-- OPTION 1: Disable RLS (recommended since API already controls access)
-- Your Next.js API with next-auth already enforces household-based security
ALTER TABLE grocery_list_items DISABLE ROW LEVEL SECURITY;

-- Set replica identity to FULL (required for realtime)
ALTER TABLE grocery_list_items REPLICA IDENTITY FULL;

-- Verify the table is in the publication (should already be there)
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND tablename = 'grocery_list_items';

-- If not in publication, add it:
-- ALTER PUBLICATION supabase_realtime ADD TABLE grocery_list_items;

-- Verify replica identity is FULL
SELECT relname, relreplident
FROM pg_class
WHERE relname = 'grocery_list_items';
-- Should show 'f' for FULL

-- Test query (should work without auth)
SELECT COUNT(*) FROM grocery_list_items;
