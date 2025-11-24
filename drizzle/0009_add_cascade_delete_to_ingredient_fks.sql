-- Drop existing foreign key constraints
ALTER TABLE recipe_ingredients DROP CONSTRAINT recipe_ingredients_ingredient_id_ingredients_id_fk;
ALTER TABLE pantry_items DROP CONSTRAINT pantry_items_ingredient_id_ingredients_id_fk;
ALTER TABLE grocery_list_items DROP CONSTRAINT grocery_list_items_ingredient_id_ingredients_id_fk;

-- Add new foreign key constraints with ON DELETE CASCADE
ALTER TABLE recipe_ingredients
ADD CONSTRAINT recipe_ingredients_ingredient_id_ingredients_id_fk
FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE;

ALTER TABLE pantry_items
ADD CONSTRAINT pantry_items_ingredient_id_ingredients_id_fk
FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE;

ALTER TABLE grocery_list_items
ADD CONSTRAINT grocery_list_items_ingredient_id_ingredients_id_fk
FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE;
