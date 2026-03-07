const { initDb, getDb } = require('./server/database');

async function checkDb() {
  try {
    await initDb();
    const db = getDb();
    
    const tables = ['users', 'barbers', 'services', 'appointments'];
    console.log('--- DATABASE STATUS ---');
    
    for (const table of tables) {
      try {
        const count = db.prepare(`SELECT count(*) as count FROM ${table}`).get();
        console.log(`${table}: ${count.count} records`);
      } catch (e) {
        console.log(`${table}: Table not found or error: ${e.message}`);
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error checking DB:', err);
    process.exit(1);
  }
}

checkDb();
