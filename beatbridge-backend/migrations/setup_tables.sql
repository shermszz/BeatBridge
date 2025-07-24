-- Create users table first
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

-- Create shared_loops table
CREATE TABLE IF NOT EXISTS shared_loops (
    id SERIAL PRIMARY KEY,
    share_id VARCHAR(255) NOT NULL UNIQUE,
    sender_id INTEGER NOT NULL,
    jam_session_ids INTEGER[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Create shared_loop_notifications table
CREATE TABLE IF NOT EXISTS shared_loop_notifications (
    id SERIAL PRIMARY KEY,
    recipient_id INTEGER NOT NULL,
    share_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES users(id),
    FOREIGN KEY (share_id) REFERENCES shared_loops(share_id)
); 