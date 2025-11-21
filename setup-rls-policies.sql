-- Setup Row Level Security (RLS) Policies for Supabase Realtime
-- Run this in your Supabase SQL Editor

-- Enable RLS on grocery_list_items if not already enabled
ALTER TABLE grocery_list_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view grocery list items from their household" ON grocery_list_items;
DROP POLICY IF EXISTS "Users can insert grocery list items to their household lists" ON grocery_list_items;
DROP POLICY IF EXISTS "Users can update grocery list items from their household" ON grocery_list_items;
DROP POLICY IF EXISTS "Users can delete grocery list items from their household" ON grocery_list_items;

-- Policy for SELECT (viewing items)
-- Users can see items from grocery lists that belong to their household
CREATE POLICY "Users can view grocery list items from their household"
ON grocery_list_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM grocery_lists gl
    INNER JOIN users u ON u.household_id = gl.household_id
    WHERE gl.id = grocery_list_items.grocery_list_id
    AND u.id = auth.uid()
  )
);

-- Policy for INSERT (adding items)
CREATE POLICY "Users can insert grocery list items to their household lists"
ON grocery_list_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM grocery_lists gl
    INNER JOIN users u ON u.household_id = gl.household_id
    WHERE gl.id = grocery_list_items.grocery_list_id
    AND u.id = auth.uid()
  )
);

-- Policy for UPDATE (checking/unchecking items, updating quantities)
CREATE POLICY "Users can update grocery list items from their household"
ON grocery_list_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM grocery_lists gl
    INNER JOIN users u ON u.household_id = gl.household_id
    WHERE gl.id = grocery_list_items.grocery_list_id
    AND u.id = auth.uid()
  )
);

-- Policy for DELETE (removing items)
CREATE POLICY "Users can delete grocery list items from their household"
ON grocery_list_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM grocery_lists gl
    INNER JOIN users u ON u.household_id = gl.household_id
    WHERE gl.id = grocery_list_items.grocery_list_id
    AND u.id = auth.uid()
  )
);

-- Verify the policies were created
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'grocery_list_items';
