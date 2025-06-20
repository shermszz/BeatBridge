-- Add verification fields to users table
ALTER TABLE users
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verification_code VARCHAR(6),
ADD COLUMN google_id VARCHAR(100) UNIQUE; 