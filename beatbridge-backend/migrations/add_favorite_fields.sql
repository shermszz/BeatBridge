-- Add new columns to user_favorites table
ALTER TABLE user_favorites
ADD COLUMN IF NOT EXISTS album_image TEXT,
ADD COLUMN IF NOT EXISTS rhythm_complexity INTEGER,
ADD COLUMN IF NOT EXISTS tempo_rating INTEGER,
ADD COLUMN IF NOT EXISTS skill_level TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT; 