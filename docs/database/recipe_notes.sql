-- Migration: Add recipe_notes table for Enhancement #005
-- This SQL should be run in the Supabase SQL Editor

-- Create recipe_notes table
CREATE TABLE IF NOT EXISTS recipe_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  step_number INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  session_id UUID REFERENCES recipe_history(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_recipe_notes_user_recipe ON recipe_notes(user_id, recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_notes_recipe ON recipe_notes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_notes_session ON recipe_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_recipe_notes_step ON recipe_notes(recipe_id, step_number);

-- Add updated_at trigger to auto-update timestamp
CREATE OR REPLACE FUNCTION update_recipe_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipe_notes_updated_at
  BEFORE UPDATE ON recipe_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_recipe_notes_updated_at();

-- Add comment for documentation
COMMENT ON TABLE recipe_notes IS 'Stores user notes added during cooking sessions for recipes';
COMMENT ON COLUMN recipe_notes.step_number IS 'Optional: links note to specific recipe step (0-indexed)';
COMMENT ON COLUMN recipe_notes.session_id IS 'Optional: links note to specific cooking session from recipe_history';
