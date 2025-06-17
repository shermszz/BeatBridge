-- Create user_customizations table
CREATE TABLE IF NOT EXISTS user_customizations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_level VARCHAR(50) NOT NULL,
    practice_frequency VARCHAR(50) NOT NULL,
    favorite_genres TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
); 