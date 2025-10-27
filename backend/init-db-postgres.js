const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initDatabase() {
  console.log('\n🚀 Initializing Space Alone PostgreSQL Database...\n');

  const sql = postgres({
    host: process.env.PGHOST || 'ep-cool-truth-a1nvfpxx.ap-southeast-1.pg.koyeb.app',
    database: process.env.PGDATABASE || 'koyebdb',
    username: process.env.PGUSER || 'koyeb-adm',
    password: process.env.PGPASSWORD || 'npg_TZFIqH73wmQa',
    ssl: process.env.PGSSL === 'require' ? 'require' : false,
  });

  try {
    const schemaPath = path.join(__dirname, 'models', 'schema-postgres.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Schema file not found at:', schemaPath);
      process.exit(1);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await sql.unsafe(schema);
    console.log('✅ Database schema created/verified');

    let adminUser;
    const existingAdmin = await sql`
      SELECT * FROM users WHERE username = 'admin'
    `;

    if (existingAdmin.length === 0) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const result = await sql`
        INSERT INTO users (username, password, email, role)
        VALUES ('admin', ${adminPassword}, 'admin@spacealone.com', 'admin')
        RETURNING id, username, role
      `;
      adminUser = result[0];
      console.log('✅ Admin user created');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Role: admin');
      console.log('   ⚠️  Change password after first login!\n');
    } else {
      adminUser = existingAdmin[0];
      console.log('✅ Admin user already exists');
      console.log(`   Role: ${adminUser.role}`);
    }

    const existingPosts = await sql`SELECT COUNT(*) as count FROM posts`;
    
    if (existingPosts[0].count === '0' || existingPosts[0].count === 0) {
      await sql`
        INSERT INTO posts (title, slug, content, image_url, author_id, author_name)
        VALUES 
        (
          'The Search for Extraterrestrial Life',
          'the-search-for-extraterrestrial-life',
          'Scientists continue their quest to find signs of life beyond Earth. With advanced telescopes and space missions, we are exploring distant planets and moons that might harbor the conditions necessary for life. From Europa''s subsurface ocean to the methane lakes of Titan, the possibilities are endless.

Recent discoveries of exoplanets in the habitable zone have renewed hope in finding our cosmic neighbors. The James Webb Space Telescope is revolutionizing our ability to analyze the atmospheres of distant worlds, searching for biosignatures that could indicate the presence of life.

The search extends beyond our solar system to potentially billions of Earth-like planets in the Milky Way galaxy. Each discovery brings us closer to answering one of humanity''s most profound questions: Are we alone in the universe?',
          'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06',
          ${adminUser.id},
          'Space Explorer'
        ),
        (
          'Understanding Black Holes',
          'understanding-black-holes',
          'Black holes remain one of the universe''s greatest mysteries. These regions of spacetime exhibit such strong gravitational effects that nothing, not even light, can escape. Recent observations using the Event Horizon Telescope have given us unprecedented views of these cosmic phenomena.

The first image of a black hole, captured in 2019, showed the supermassive black hole at the center of galaxy M87. This groundbreaking achievement confirmed decades of theoretical predictions and opened new avenues for understanding gravity''s most extreme manifestation.

Scientists are now studying how black holes influence galaxy formation and evolution across cosmic time. From stellar-mass black holes formed by collapsing stars to supermassive black holes millions of times the mass of our Sun, these objects play a crucial role in shaping the universe we observe today.',
          'https://images.unsplash.com/photo-1543722530-d2c3201371e7',
          ${adminUser.id},
          'Cosmic Scientist'
        ),
        (
          'Journey to Mars: The Next Frontier',
          'journey-to-mars-the-next-frontier',
          'Mars exploration has entered an exciting new phase with multiple rovers exploring the Red Planet. NASA''s Perseverance rover is collecting samples that could reveal ancient microbial life. Plans for human missions to Mars are progressing, with various space agencies working on the technology needed for this ambitious journey.

The dream of becoming a multi-planetary species is closer than ever. SpaceX, NASA, and other organizations are developing the spacecraft, life support systems, and habitats necessary for sustained human presence on Mars. The challenges are immense - from the harsh radiation environment to the need for in-situ resource utilization.

Yet with each passing year, the technologies mature and the plans become more concrete. The first humans to set foot on Mars may already be alive today, preparing for a journey that will forever change humanity''s relationship with the cosmos.',
          'https://images.unsplash.com/photo-1614732414444-096e5f1122d5',
          ${adminUser.id},
          'Mars Explorer'
        )
      `;
      console.log('✅ Sample blog posts created');
    }

    console.log('\n✅ Database initialization complete\n');
    console.log('🎉 You can now run: npm start\n');

  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

initDatabase();
