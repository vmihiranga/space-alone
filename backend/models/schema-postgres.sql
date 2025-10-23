-- PostgreSQL Schema for Space Alone

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table with slug support
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    content TEXT NOT NULL,
    image_url TEXT,
    author_id INTEGER,
    author_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- Solar system configuration table
CREATE TABLE IF NOT EXISTS solar_config (
    id SERIAL PRIMARY KEY,
    planet_name TEXT UNIQUE NOT NULL,
    size REAL,
    distance REAL,
    color TEXT,
    speed REAL,
    info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Uploads/Media table
CREATE TABLE IF NOT EXISTS uploads (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mimetype TEXT,
    size INTEGER,
    path TEXT NOT NULL,
    uploaded_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    user_identifier TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE(post_id, user_identifier)
);

-- Create index for faster like counting
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);

-- ✅ Post dislikes table (NEW)
CREATE TABLE IF NOT EXISTS post_dislikes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    user_identifier TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE(post_id, user_identifier)
);

-- Create index for faster dislike counting
CREATE INDEX IF NOT EXISTS idx_post_dislikes_post_id ON post_dislikes(post_id);

-- Post shares table
CREATE TABLE IF NOT EXISTS post_shares (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    platform TEXT NOT NULL,
    user_identifier TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Create index for share tracking
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON post_shares(post_id);

-- User activity logs
CREATE TABLE IF NOT EXISTS user_activity (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    username TEXT,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for activity logs
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);

-- Application settings (single row) for UI configs like solar controls
CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    solar_rotation_speed REAL DEFAULT 0.5,
    solar_planet_count INTEGER DEFAULT 8,
    solar_orbit_color TEXT DEFAULT '#00f3ff',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure single settings row exists
INSERT INTO app_settings (id)
SELECT 1
WHERE NOT EXISTS (SELECT 1 FROM app_settings WHERE id = 1);
