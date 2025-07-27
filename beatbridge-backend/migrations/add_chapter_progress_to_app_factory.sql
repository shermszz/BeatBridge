-- Add chapter progress fields to user_customizations table for app_factory
ALTER TABLE user_customizations ADD COLUMN IF NOT EXISTS chapter_progress INTEGER DEFAULT 1;
ALTER TABLE user_customizations ADD COLUMN IF NOT EXISTS chapter0_page_progress INTEGER DEFAULT 1;
ALTER TABLE user_customizations ADD COLUMN IF NOT EXISTS chapter1_page_progress INTEGER DEFAULT 1; 