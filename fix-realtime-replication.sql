-- Fix Supabase Realtime Replication for grocery_list_items
-- Run this in your Supabase SQL Editor

-- 1. Set replica identity to FULL (this ensures all columns are included in change events)
ALTER TABLE grocery_list_items REPLICA IDENTITY FULL;

-- 2. Verify the table is in the publication (should already be there based on your error)
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';

-- 3. Check the replica identity setting
SELECT relname, relreplident
FROM pg_class
WHERE relname = 'grocery_list_items';
-- Should show 'f' for FULL

-- 4. Verify WAL level is logical (required for replication)
SHOW wal_level;
-- Should be 'logical'

-- 5. Check if there are any RLS policies blocking the replication
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'grocery_list_items';
