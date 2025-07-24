-- Create users table with all required fields
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    hash VARCHAR(255) NOT NULL,
    profile_pic_url VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(6),
    google_id VARCHAR(100) UNIQUE
); 