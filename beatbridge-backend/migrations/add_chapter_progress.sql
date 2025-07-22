-- Add chapter_progress column to user_customizations
ALTER TABLE user_customizations ADD COLUMN IF NOT EXISTS chapter_progress INTEGER DEFAULT 1; 