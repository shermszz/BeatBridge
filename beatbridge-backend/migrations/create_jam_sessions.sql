CREATE TABLE IF NOT EXISTS jam_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    pattern_json TEXT NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    parent_jam_id INTEGER,
    instruments_json TEXT,
    time_signature VARCHAR(10),
    note_resolution INTEGER,
    bpm INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_jam_id) REFERENCES jam_sessions(id)
); 