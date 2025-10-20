
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    content TEXT NOT NULL,
    author_id INTEGER,
    author_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);


CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);


CREATE TABLE IF NOT EXISTS solar_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    planet_name TEXT UNIQUE NOT NULL,
    size REAL,
    distance REAL,
    color TEXT,
    speed REAL,
    info TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mimetype TEXT,
    size INTEGER,
    path TEXT NOT NULL,
    uploaded_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);


INSERT OR IGNORE INTO users (username, password, email, role) 
VALUES ('admin', 'admin123', 'admin@spacealone.com', 'admin');

INSERT OR IGNORE INTO posts (id, title, slug, content, author_name) VALUES 
(1, 'The Search for Extraterrestrial Life', 'the-search-for-extraterrestrial-life', 
'Scientists continue their quest to find signs of life beyond Earth. With advanced telescopes and space missions, we are exploring distant planets and moons that might harbor the conditions necessary for life. From Europa''s subsurface ocean to the methane lakes of Titan, the possibilities are endless.

Recent discoveries of exoplanets in the habitable zone have renewed hope in finding our cosmic neighbors. The James Webb Space Telescope is revolutionizing our ability to analyze the atmospheres of distant worlds, searching for biosignatures that could indicate the presence of life.

The search extends beyond our solar system to potentially billions of Earth-like planets in the Milky Way galaxy. Each discovery brings us closer to answering one of humanity''s most profound questions: Are we alone in the universe?', 
'Space Explorer'),

(2, 'Understanding Black Holes', 'understanding-black-holes',
'Black holes remain one of the universe''s greatest mysteries. These regions of spacetime exhibit such strong gravitational effects that nothing, not even light, can escape. Recent observations using the Event Horizon Telescope have given us unprecedented views of these cosmic phenomena.

The first image of a black hole, captured in 2019, showed the supermassive black hole at the center of galaxy M87. This groundbreaking achievement confirmed decades of theoretical predictions and opened new avenues for understanding gravity''s most extreme manifestation.

Scientists are now studying how black holes influence galaxy formation and evolution across cosmic time. From stellar-mass black holes formed by collapsing stars to supermassive black holes millions of times the mass of our Sun, these objects play a crucial role in shaping the universe we observe today.',
'Cosmic Scientist'),

(3, 'Journey to Mars: The Next Frontier', 'journey-to-mars-the-next-frontier',
'Mars exploration has entered an exciting new phase with multiple rovers exploring the Red Planet. NASA''s Perseverance rover is collecting samples that could reveal ancient microbial life. Plans for human missions to Mars are progressing, with various space agencies working on the technology needed for this ambitious journey.

The dream of becoming a multi-planetary species is closer than ever. SpaceX, NASA, and other organizations are developing the spacecraft, life support systems, and habitats necessary for sustained human presence on Mars. The challenges are immense - from the harsh radiation environment to the need for in-situ resource utilization.

Yet with each passing year, the technologies mature and the plans become more concrete. The first humans to set foot on Mars may already be alive today, preparing for a journey that will forever change humanity''s relationship with the cosmos.',
'Mars Explorer');

CREATE TABLE IF NOT EXISTS post_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_identifier TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE(post_id, user_identifier)
);


CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);

-- Post shares table
CREATE TABLE IF NOT EXISTS post_shares (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    platform TEXT NOT NULL,
    user_identifier TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON post_shares(post_id);


CREATE TABLE IF NOT EXISTS user_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create index for activity logs
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);
