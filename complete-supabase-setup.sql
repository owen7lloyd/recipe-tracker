-- Complete setup for Supabase Realtime on grocery_list_items
-- Run this entire script in your Supabase SQL Editor

-- 1. Check current RLS status
SELECT tablename,
       CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public' AND tablename = 'grocery_list_items';

-- 2. Disable RLS
ALTER TABLE grocery_list_items DISABLE ROW LEVEL SECURITY;

-- 3. Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON grocery_list_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON grocery_list_items TO authenticated;

-- Also grant on related tables that might be queried
GRANT SELECT ON grocery_lists TO anon;
GRANT SELECT ON grocery_lists TO authenticated;
GRANT SELECT ON ingredients TO anon;
GRANT SELECT ON ingredients TO authenticated;

-- 4. Set replica identity to FULL (required for realtime)
ALTER TABLE grocery_list_items REPLICA IDENTITY FULL;

-- 5. Ensure table is in realtime publication
DO $$
BEGIN
    -- Try to add the table to the publication
    -- If it already exists, this will raise an error which we ignore
    BEGIN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE grocery_list_items';
    EXCEPTION
        WHEN duplicate_object THEN
            -- Table already in publication, ignore
            NULL;
    END;
END $$;

-- 6. Verify setup
SELECT 'RLS Status' as check_type,
       CASE WHEN rowsecurity THEN 'ENABLED ❌' ELSE 'DISABLED ✅' END as status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public' AND tablename = 'grocery_list_items'

UNION ALL

SELECT 'Replica Identity' as check_type,
       CASE relreplident
         WHEN 'f' THEN 'FULL ✅'
         WHEN 'd' THEN 'DEFAULT ❌'
         ELSE relreplident::text
       END as status
FROM pg_class
WHERE relname = 'grocery_list_items'

UNION ALL

SELECT 'In Publication' as check_type,
       CASE WHEN COUNT(*) > 0 THEN 'YES ✅' ELSE 'NO ❌' END as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND tablename = 'grocery_list_items'

UNION ALL

SELECT 'Anon Permissions' as check_type,
       string_agg(privilege_type, ', ') as status
FROM information_schema.role_table_grants
WHERE table_name = 'grocery_list_items' AND grantee = 'anon';

-- 7. Test query (should return count without error)
SELECT COUNT(*) as total_items FROM grocery_list_items;
