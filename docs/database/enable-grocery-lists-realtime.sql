-- Enable Realtime Replication for grocery_lists table
-- Run this in your Supabase SQL Editor

-- 1. Set replica identity to FULL (ensures all columns are included in change events)
ALTER TABLE grocery_lists REPLICA IDENTITY FULL;

-- 2. Grant permissions to anon and authenticated roles
GRANT SELECT ON grocery_lists TO anon;
GRANT SELECT ON grocery_lists TO authenticated;

-- 3. Add table to realtime publication
DO $$
BEGIN
    -- Try to add the table to the publication
    -- If it already exists, this will raise an error which we ignore
    BEGIN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE grocery_lists';
    EXCEPTION
        WHEN duplicate_object THEN
            -- Table already in publication, ignore
            NULL;
    END;
END $$;

-- 4. Verify setup
SELECT 'RLS Status' as check_type,
       CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED ✅' END as status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public' AND tablename = 'grocery_lists'

UNION ALL

SELECT 'Replica Identity' as check_type,
       CASE relreplident
         WHEN 'f' THEN 'FULL ✅'
         WHEN 'd' THEN 'DEFAULT ❌'
         ELSE relreplident::text
       END as status
FROM pg_class
WHERE relname = 'grocery_lists'

UNION ALL

SELECT 'In Publication' as check_type,
       CASE WHEN COUNT(*) > 0 THEN 'YES ✅' ELSE 'NO ❌' END as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND tablename = 'grocery_lists';
