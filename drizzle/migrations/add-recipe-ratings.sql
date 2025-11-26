-- Migration: Add Recipe Ratings Feature
-- This SQL should be executed in the Supabase SQL Editor
-- DO NOT run through Drizzle - execute directly in Supabase

-- Create recipeRatings table
CREATE TABLE IF NOT EXISTS recipe_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  rated_at TIMESTAMP NOT NULL DEFAULT now(),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),

  -- Ensure one rating per user per recipe
  UNIQUE(recipe_id, user_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_recipe_id ON recipe_ratings(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_user_id ON recipe_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_household_id ON recipe_ratings(household_id);

-- Add rating fields to recipes table
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(2, 1),
  ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Create function to update recipe average rating
CREATE OR REPLACE FUNCTION update_recipe_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE recipes
  SET
    avg_rating = (
      SELECT AVG(rating)::DECIMAL(2,1)
      FROM recipe_ratings
      WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)
    ),
    rating_count = (
      SELECT COUNT(*)::INTEGER
      FROM recipe_ratings
      WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.recipe_id, OLD.recipe_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update recipe rating on insert/update/delete
DROP TRIGGER IF EXISTS trigger_update_recipe_rating ON recipe_ratings;
CREATE TRIGGER trigger_update_recipe_rating
  AFTER INSERT OR UPDATE OR DELETE ON recipe_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_recipe_rating();

-- Add comments for documentation
COMMENT ON TABLE recipe_ratings IS 'Stores individual user ratings for recipes';
COMMENT ON COLUMN recipe_ratings.rating IS 'Rating from 1-5 stars';
COMMENT ON COLUMN recipe_ratings.comment IS 'Optional user comment about the recipe';
COMMENT ON COLUMN recipes.avg_rating IS 'Average rating calculated from all user ratings';
COMMENT ON COLUMN recipes.rating_count IS 'Total number of ratings for this recipe';
