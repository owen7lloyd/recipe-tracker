-- Migration: Add household invites table and update households table
-- Created: 2025-11-17

-- Add created_by column to households table
ALTER TABLE households ADD COLUMN created_by uuid;

-- Drop old invite columns from households table
ALTER TABLE households DROP COLUMN IF EXISTS invite_code;
ALTER TABLE households DROP COLUMN IF EXISTS invite_expires_at;

-- Create household_invites table
CREATE TABLE IF NOT EXISTS household_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_by uuid NOT NULL REFERENCES users(id),
  expires_at timestamp NOT NULL,
  used_by uuid REFERENCES users(id),
  used_at timestamp,
  created_at timestamp DEFAULT NOW() NOT NULL
);

-- Create indexes for household_invites
CREATE INDEX IF NOT EXISTS idx_invites_code ON household_invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_household ON household_invites(household_id);
