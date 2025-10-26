# 🗄️ DATABASE CONFIGURATION

> **Complete database setup guide for Space Alone**  
> Learn how to configure, switch, and optimize your database

---

## 📋 Table of Contents

- [Current Database Setup](#current-database-setup)
- [Using Your Own Database](#-using-your-own-database)
- [Getting Database URLs](#-getting-database-urls-from-popular-services)
- [Configuration Methods](#️-database-configuration-methods)
- [Supported Databases](#️-supported-databases)
- [Verification](#-verifying-database-connection)
- [Troubleshooting](#-troubleshooting)
- [Data Migration](#-migrating-data-between-databases)
- [Security](#-security-best-practices)
- [Production Deployment](#-production-deployment-checklist)

---

## Current Database Setup

Space Alone currently uses a dual-database architecture:

### Main Database (PostgreSQL)
- **Type**: PostgreSQL 15+
- **Host**: External Koyeb PostgreSQL instance
- **Purpose**: Primary data storage
- **Tables**: 
  - `users` - User accounts and authentication
    - Fields: id, username, password, email, role, created_at
  - `posts` - Blog posts with rich content
    - Fields: id, title, slug, content, image_url, author_id, author_name, created_at, updated_at
    - Indexes: idx_posts_slug
  - `solar_config` - Solar system visualization settings
    - Fields: id, planet_name, size, distance, color, speed, info, created_at, updated_at
  - `uploads` - File management for media assets
    - Fields: id, filename, original_name, mimetype, size, path, uploaded_by, created_at
  - `post_likes` - Post like tracking
    - Fields: id, post_id, user_identifier, created_at
    - Indexes: idx_post_likes_post_id
    - Constraints: UNIQUE(post_id, user_identifier)
  - `post_dislikes` - Post dislike tracking
    - Fields: id, post_id, user_identifier, created_at
    - Indexes: idx_post_dislikes_post_id
    - Constraints: UNIQUE(post_id, user_identifier)
  - `post_shares` - Post share tracking
    - Fields: id, post_id, platform, user_identifier, created_at
    - Indexes: idx_post_shares_post_id
  - `app_settings` - Application configuration
    - Fields: id, solar_rotation_speed, solar_planet_count, solar_orbit_color, updated_at
    - Default Values: rotation_speed=0.5, planet_count=8, orbit_color='#00f3ff'

### Session Database (SQLite)
- **Type**: SQLite 3
- **File**: `sessions.sqlite` (local storage)
- **Purpose**: Session management
- **Tables**: 
  - `sessions` - User session data

---

## 🔄 Using Your Own Database

### Option 1: Using Custom PostgreSQL Database URL

If you have your own PostgreSQL database (from Koyeb, Neon, Supabase, Railway, etc.), you can use the complete DATABASE_URL:

#### 1. Get Your Database URL

Your database URL should look like one of these formats:

```
postgresql://username:password@host:port/database
postgres://username:password@host:port/database
postgresql://username:password@host:port/database?sslmode=require
```

**Example URLs:**
- Koyeb: `postgresql://koyeb-adm:password@ep-abc-123.us-east-1.koyeb.app:5432/koyebdb`
- Neon: `postgresql://user:pass@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb`
- Supabase: `postgresql://postgres:pass@db.abc123.supabase.co:5432/postgres`
- Railway: `postgresql://postgres:pass@containers-us-west-123.railway.app:5432/railway`

#### 2. Configure Your .env File

Add your complete DATABASE_URL to `.env`:

```env
# Method 1: Use complete DATABASE_URL (Recommended)
DATABASE_URL=postgresql://username:password@host:port/database

# OR Method 2: Use individual parameters
DB_TYPE=postgresql
PGHOST=your-host.com
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=your_database_name
PGSSL=true

# Session Configuration
SESSION_SECRET=your_super_secret_key_here

# API Keys
NASA_API_KEY=your_nasa_api_key
```

**⚠️ Important:** If you use `DATABASE_URL`, it will override individual PG* variables.

#### 3. Initialize Your Database

Run the initialization script to create all required tables:

```bash
# Initialize database with schema
node backend/init-db-postgres.js
```

This will create all necessary tables in your database with the following structure:
- Users table with authentication fields
- Posts table with slug indexing for fast lookups
- Solar configuration for planet customization
- Uploads table for media management
- Post engagement tables (likes, dislikes, shares) with proper indexes
- App settings with default solar system values

#### 4. Restart the Server

```bash
npm start
```

---

## 🔐 Getting Database URLs from Popular Services

### Koyeb PostgreSQL

1. Go to [Koyeb Dashboard](https://app.koyeb.com/)
2. Navigate to **Databases** section
3. Click on your database
4. Copy the **Connection String** (External Connection)
5. Format: `postgresql://koyeb-adm:PASSWORD@ep-xxx.koyeb.app:5432/koyebdb`

```env
DATABASE_URL=postgresql://koyeb-adm:your_password@ep-abc-123.us-east-1.koyeb.app:5432/koyebdb
```

### Neon (Serverless PostgreSQL)

1. Go to [Neon Console](https://console.neon.tech/)
2. Select your project
3. Go to **Dashboard** → **Connection Details**
4. Copy **Connection String** (Pooled or Direct)

```env
DATABASE_URL=postgresql://username:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** → **Database**
4. Copy **Connection String** → **URI**

```env
DATABASE_URL=postgresql://postgres.abc123xyz:password@db.abc123xyz.supabase.co:5432/postgres
```

### Railway

1. Go to [Railway Dashboard](https://railway.app/)
2. Select your project
3. Click on **PostgreSQL** service
4. Go to **Variables** tab
5. Copy `DATABASE_URL` value

```env
DATABASE_URL=postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway
```

### Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your PostgreSQL database
3. Copy **External Database URL**

```env
DATABASE_URL=postgresql://username:password@dpg-xxxxx.oregon-postgres.render.com/dbname
```

### ElephantSQL

1. Go to [ElephantSQL Console](https://customer.elephantsql.com/)
2. Select your instance
3. Copy **URL** from Details page

```env
DATABASE_URL=postgresql://username:password@raja.db.elephantsql.com/username
```

---

## 🛠️ Database Configuration Methods

### Method 1: DATABASE_URL (Recommended)

**Advantages:**
- ✅ Single configuration line
- ✅ Works with all hosting platforms
- ✅ Easy to copy/paste from provider dashboards
- ✅ Includes SSL configuration automatically

```env
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

### Method 2: Individual Parameters

**Advantages:**
- ✅ More granular control
- ✅ Easy to read and modify individual settings
- ✅ Better for local development

```env
DB_TYPE=postgresql
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=space_alone
PGSSL=false
```

---

## 🗄️ Supported Databases

### 1. PostgreSQL (Recommended)
- **Best for**: Production, scalability, concurrent users
- **Minimum Version**: PostgreSQL 12+
- **Recommended Version**: PostgreSQL 15+

**Setup:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/database
# OR
DB_TYPE=postgresql
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=space_alone
```

### 2. SQLite (Development Only)
- **Best for**: Local development, testing
- **Not recommended for**: Production, multiple users

**Setup:**
```env
DB_TYPE=sqlite
SQLITE_PATH=./backend/space_alone.db
```

**Initialize:**
```bash
node backend/init-db-sqlite.js
npm start
```

### 3. MySQL (Coming Soon)
- **Best for**: Enterprise applications
- **Minimum Version**: MySQL 8.0+

**Setup:**
```env
DB_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=space_alone
```

---

## 🔍 Verifying Database Connection

### Step 1: Check Server Logs

Start the server and look for these messages:

```bash
npm start
```

**Successful connection:**
```
[DB] Connecting to PostgreSQL...
[DB] PostgreSQL connected successfully
[DB] Database: space_alone
[DB] Host: your-host.com
[Server] Server running on port 3000
```

### Step 2: Test Health Endpoint

```bash
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "database": {
    "type": "postgresql",
    "connected": true,
    "host": "your-host.com",
    "database": "space_alone"
  },
  "timestamp": "2025-10-26T10:30:00.000Z"
}
```

### Step 3: Verify Tables

**PostgreSQL:**
```bash
psql $DATABASE_URL -c "\dt"
```

**Expected output:**
```
            List of relations
 Schema |      Name       | Type  |  Owner  
--------+-----------------+-------+---------
 public | app_settings    | table | user
 public | post_dislikes   | table | user
 public | post_likes      | table | user
 public | post_shares     | table | user
 public | posts           | table | user
 public | solar_config    | table | user
 public | uploads         | table | user
 public | users           | table | user
(8 rows)
```

### Step 4: Verify Indexes

```bash
psql $DATABASE_URL -c "\di"
```

**Expected indexes:**
```
idx_posts_slug
idx_post_likes_post_id
idx_post_dislikes_post_id
idx_post_shares_post_id
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Connection refused" or "Could not connect"

**Problem:** Database server is not accessible

**Solutions:**
```bash
# Check if database URL is correct
echo $DATABASE_URL

# Test connection manually
psql $DATABASE_URL -c "SELECT version();"

# Check firewall/security group settings
# Ensure your IP is whitelisted in database provider settings
```

#### 2. "password authentication failed"

**Problem:** Incorrect credentials

**Solutions:**
```bash
# Double-check username and password
# Ensure no extra spaces in .env file
# Check if password contains special characters that need URL encoding

# URL encode special characters:
# @ → %40
# : → %3A
# / → %2F
# ? → %3F
# # → %23
```

**Example:** If password is `p@ss:word`, use:
```env
DATABASE_URL=postgresql://user:p%40ss%3Aword@host:5432/db
```

#### 3. "database does not exist"

**Problem:** Database not created

**Solutions:**
```bash
# Create database (if you have access)
psql $DATABASE_URL -c "CREATE DATABASE space_alone;"

# OR contact your database provider
# Some managed services auto-create databases
```

#### 4. "SSL connection required"

**Problem:** Database requires SSL but not configured

**Solutions:**
```env
# Add sslmode to DATABASE_URL
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# OR set PGSSL
PGSSL=true
```

#### 5. "Too many connections"

**Problem:** Connection pool exhausted

**Solutions:**
```env
# Reduce max connections
PGMAX_CONNECTIONS=10

# Increase idle timeout
PGIDLE_TIMEOUT=30000

# Check for connection leaks in code
```

#### 6. "relation does not exist"

**Problem:** Tables not created or initialization incomplete

**Solutions:**
```bash
# Run initialization script
node backend/init-db-postgres.js

# Verify all tables exist
psql $DATABASE_URL -c "\dt"

# Check if app_settings has default values
psql $DATABASE_URL -c "SELECT * FROM app_settings;"
```

---

## 🔄 Migrating Data Between Databases

### Export from Current Database

**PostgreSQL:**
```bash
pg_dump $DATABASE_URL > backup.sql
# OR
pg_dump -h host -U user -d database > backup.sql

# Export specific tables
pg_dump $DATABASE_URL -t users -t posts -t solar_config > backup.sql
```

**SQLite:**
```bash
sqlite3 backend/space_alone.db .dump > backup.sql
```

### Import to New Database

**PostgreSQL:**
```bash
psql $NEW_DATABASE_URL < backup.sql
# OR
psql -h new_host -U user -d new_database < backup.sql
```

**Important:** Update your `.env` with new DATABASE_URL after migration.

### Data Validation After Migration

```bash
# Check row counts
psql $NEW_DATABASE_URL -c "
SELECT 
  'users' as table_name, COUNT(*) as rows FROM users
  UNION ALL
SELECT 'posts', COUNT(*) FROM posts
  UNION ALL
SELECT 'solar_config', COUNT(*) FROM solar_config
  UNION ALL
SELECT 'post_likes', COUNT(*) FROM post_likes
  UNION ALL
SELECT 'post_dislikes', COUNT(*) FROM post_dislikes
  UNION ALL
SELECT 'post_shares', COUNT(*) FROM post_shares
  UNION ALL
SELECT 'app_settings', COUNT(*) FROM app_settings;
"
```

---

## 🔐 Security Best Practices

### 1. Never Commit Database Credentials

```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo "sessions.sqlite" >> .gitignore
echo "*.db" >> .gitignore
```

### 2. Use Strong Passwords

- Minimum 16 characters
- Mix of uppercase, lowercase, numbers, symbols
- Use a password generator
- Rotate credentials periodically

### 3. Enable SSL/TLS

**For production:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
# OR
PGSSL=true
PGSSL_REJECT_UNAUTHORIZED=true
```

### 4. Restrict Database Access

- Whitelist only necessary IP addresses
- Use private networks when possible
- Enable database firewall rules
- Create read-only users for analytics
- Implement role-based access control

### 5. Regular Backups

```bash
# Automated daily backup (add to crontab)
0 2 * * * pg_dump $DATABASE_URL > /backups/space_alone_$(date +\%Y\%m\%d).sql

# Keep last 7 days of backups
0 3 * * * find /backups -name "space_alone_*.sql" -mtime +7 -delete
```

### 6. Input Validation

The application uses parameterized queries to prevent SQL injection:
- All user inputs are sanitized
- Foreign key constraints prevent orphaned records
- Unique constraints on critical fields (username, email, post slug)

---

## 📊 Database Schema Details

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,  -- Hashed with bcrypt
    email TEXT UNIQUE,
    role TEXT DEFAULT 'user',  -- 'user' or 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Posts Table
```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,  -- URL-friendly identifier
    content TEXT NOT NULL,
    image_url TEXT,
    author_id INTEGER REFERENCES users(id),
    author_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_posts_slug ON posts(slug);
```

### Post Engagement Tables
```sql
-- Likes
CREATE TABLE post_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_identifier TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_identifier)
);

-- Dislikes
CREATE TABLE post_dislikes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_identifier TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_identifier)
);

-- Shares
CREATE TABLE post_shares (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,  -- 'facebook', 'twitter', etc.
    user_identifier TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Solar Configuration Table
```sql
CREATE TABLE solar_config (
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
```

### App Settings Table
```sql
CREATE TABLE app_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    solar_rotation_speed REAL DEFAULT 0.5,
    solar_planet_count INTEGER DEFAULT 8,
    solar_orbit_color TEXT DEFAULT '#00f3ff',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📊 Database Comparison

| Feature | PostgreSQL | SQLite | MySQL |
|---------|-----------|--------|-------|
| **Performance** | Excellent | Good | Excellent |
| **Scalability** | High | Low | High |
| **Setup Complexity** | Medium | Low | Medium |
| **Production Ready** | ✅ Yes | ❌ No | ✅ Yes |
| **Concurrent Users** | High | Limited | High |
| **File-based** | No | Yes | No |
| **Foreign Keys** | ✅ Full | ⚠️ Limited | ✅ Full |
| **Indexing** | Advanced | Basic | Advanced |
| **Full-text Search** | ✅ Yes | ⚠️ Basic | ✅ Yes |
| **JSON Support** | ✅ Native | ⚠️ Limited | ✅ Native |
| **Best For** | Production | Development | Enterprise |
| **Cloud Hosting** | ✅ Easy | ⚠️ Limited | ✅ Easy |

---

## 🚀 Production Deployment Checklist

- [ ] Use PostgreSQL (not SQLite)
- [ ] Set `NODE_ENV=production`
- [ ] Enable SSL/TLS (`?sslmode=require`)
- [ ] Use strong `SESSION_SECRET` (32+ characters)
- [ ] Configure connection pooling
- [ ] Set up automated backups
- [ ] Whitelist application IPs
- [ ] Monitor database performance
- [ ] Set up connection retry logic
- [ ] Configure read replicas (if needed)
- [ ] Verify all indexes are created
- [ ] Test foreign key constraints
- [ ] Validate unique constraints
- [ ] Check app_settings defaults

**Production .env example:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
SESSION_SECRET=super_long_random_string_at_least_32_characters_long_12345
PGMAX_CONNECTIONS=20
PGMIN_CONNECTIONS=5
NASA_API_KEY=your_api_key
```

---

## 📞 Need Help?

### Getting Support

1. **Check logs:** `tail -f logs/server.log`
2. **Test connection:** `psql $DATABASE_URL -c "SELECT 1;"`
3. **Verify tables:** `psql $DATABASE_URL -c "\dt"`
4. **Check indexes:** `psql $DATABASE_URL -c "\di"`
5. **Review this documentation**
6. **Open GitHub Issue** with:
   - Error messages
   - Database provider
   - Configuration (without passwords!)
   - Steps to reproduce

### Useful Commands

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# List all tables
psql $DATABASE_URL -c "\dt"

# List all indexes
psql $DATABASE_URL -c "\di"

# Check database size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# Show active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Check table row counts
psql $DATABASE_URL -c "
SELECT schemaname,relname,n_live_tup 
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC;
"

# View app settings
psql $DATABASE_URL -c "SELECT * FROM app_settings;"

# Check post engagement stats
psql $DATABASE_URL -c "
SELECT 
  (SELECT COUNT(*) FROM post_likes) as likes,
  (SELECT COUNT(*) FROM post_dislikes) as dislikes,
  (SELECT COUNT(*) FROM post_shares) as shares;
"
```

---

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Koyeb Database Guide](https://www.koyeb.com/docs/databases)
- [Neon Documentation](https://neon.tech/docs)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [Node.js PostgreSQL Tutorial](https://node-postgres.com/)
- [SQL Indexing Best Practices](https://use-the-index-luke.com/)

---

**💡 Quick Start Tips:**

1. **Development**: Use SQLite for quick local testing
2. **Staging**: Use PostgreSQL (Neon/Supabase free tier)
3. **Production**: Use managed PostgreSQL (Koyeb/Railway/Render)
4. **Always run** `init-db-postgres.js` after setting up a new database
5. **Verify indexes** are created for optimal performance

**🔒 Security First:** Always use SSL in production and never commit `.env` files!

---
