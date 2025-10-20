const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.sqlite');
const schemaPath = path.join(__dirname, 'models', 'schema.sql');

console.log('\n🚀 Initializing Space Alone Database...\n');

// Remove existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✅ Removed existing database');
}

// Create new database
const db = new sqlite3.Database(dbPath);

// Read and execute schema
if (!fs.existsSync(schemaPath)) {
  console.error('❌ Schema file not found at:', schemaPath);
  process.exit(1);
}

const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema, async (err) => {
  if (err) {
    console.error('❌ Error creating schema:', err);
    process.exit(1);
  }

  console.log('✅ Database schema created');

  // Create admin user with proper hash
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  db.run(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
    ['admin', adminPassword, 'admin'],
    (err) => {
      if (err) {
        console.error('❌ Error creating admin user:', err);
      } else {
        console.log('✅ Admin user created');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('   ⚠️  Change password after first login!\n');
      }

      db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err);
        } else {
          console.log('✅ Database initialization complete\n');
          console.log('🎉 You can now run: npm start\n');
        }
        process.exit(err ? 1 : 0);
      });
    }
  );
});
