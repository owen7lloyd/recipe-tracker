-- Add store column to grocery_list_items table
ALTER TABLE "grocery_list_items" ADD COLUMN "store" text;
--> statement-breakpoint
-- Create index on store column for faster filtering
CREATE INDEX "idx_grocery_list_items_store" ON "grocery_list_items" USING btree ("store");
