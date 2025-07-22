-- Add chapter0_page_progress column to user_customizations
ALTER TABLE user_customizations ADD COLUMN IF NOT EXISTS chapter0_page_progress INTEGER DEFAULT 1; 