-- Drop existing tables if they exist
DROP TABLE IF EXISTS shared_loop_notifications;
DROP TABLE IF EXISTS shared_loops;

CREATE TABLE IF NOT EXISTS shared_loops (
    id SERIAL PRIMARY KEY,
    share_id VARCHAR(255) NOT NULL UNIQUE,
    sender_id INTEGER NOT NULL,
    jam_session_ids INTEGER[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS shared_loop_notifications (
    id SERIAL PRIMARY KEY,
    recipient_id INTEGER NOT NULL,
    share_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES users(id),
    FOREIGN KEY (share_id) REFERENCES shared_loops(share_id)
); 