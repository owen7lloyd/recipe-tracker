-- Enable Realtime replication for grocery_list_items table
-- Run this in your Supabase SQL Editor

-- Enable replication for the grocery_list_items table
ALTER PUBLICATION supabase_realtime ADD TABLE grocery_list_items;

-- Verify the table is added to the publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
