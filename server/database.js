const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'barbearia.db');

let sqlJs = null;
let dbInstance = null;
let saveTimeout = null;

function saveDb() {
  if (!dbInstance) return;
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const data = dbInstance.export();
      fs.writeFileSync(DB_PATH, Buffer.from(data));
    } catch (e) {
      console.error('DB save error:', e);
    }
  }, 500);
}

class Statement {
  constructor(db, sql) {
    this.db = db;
    this.sql = sql;
  }

  _flatParams(args) {
    if (args.length === 0) return [];
    if (args.length === 1 && Array.isArray(args[0])) return args[0];
    return args;
  }

  run(...args) {
    const params = this._flatParams(args);
    try {
      this.db.run(this.sql, params);
    } catch(e) {
      throw e;
    }
    const res = this.db.exec('SELECT last_insert_rowid() as id');
    const lastId = res[0]?.values[0]?.[0] ?? 0;
    const changes = this.db.exec('SELECT changes() as c');
    const changesCount = changes[0]?.values[0]?.[0] ?? 0;
    saveDb();
    return { lastInsertRowid: lastId, changes: changesCount };
  }

  get(...args) {
    const params = this._flatParams(args);
    let stmt;
    try {
      stmt = this.db.prepare(this.sql);
      stmt.bind(params);
      if (stmt.step()) {
        return stmt.getAsObject();
      }
      return undefined;
    } catch(e) {
      throw e;
    } finally {
      if (stmt) stmt.free();
    }
  }

  all(...args) {
    const params = this._flatParams(args);
    const results = [];
    let stmt;
    try {
      stmt = this.db.prepare(this.sql);
      stmt.bind(params);
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      return results;
    } catch(e) {
      throw e;
    } finally {
      if (stmt) stmt.free();
    }
  }
}

class DbWrapper {
  constructor(db) {
    this.db = db;
  }

  prepare(sql) {
    return new Statement(this.db, sql);
  }

  exec(sql) {
    this.db.run(sql);
    saveDb();
    return this;
  }

  pragma() { return this; }
}

async function initSqlJs() {
  if (sqlJs) return sqlJs;
  sqlJs = await require('sql.js')({
    locateFile: file => path.join(__dirname, 'node_modules/sql.js/dist/', file)
  });
  return sqlJs;
}

async function getDbAsync() {
  if (dbInstance) return new DbWrapper(dbInstance);

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  const wrapper = new DbWrapper(dbInstance);
  initializeDatabase(wrapper);
  return wrapper;
}

let _db = null;
function getDb() {
  if (_db) return _db;
  throw new Error('Database not initialized. Call initDb() first.');
}

async function initDb() {
  const sqlJsPath = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist');
  const SQL = await require('sql.js')({
    locateFile: file => path.join(sqlJsPath, file)
  });

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  _db = new DbWrapper(dbInstance);
  initializeDatabase(_db);
  return _db;
}

function ensureColumnExists(db, table, column, definition) {
  try {
    const info = db.prepare(`PRAGMA table_info(${table})`).all();
    const exists = info.some(col => col.name === column);
    if (!exists) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      console.log(`Column ${column} added to ${table}`);
    }
  } catch (e) {
    console.error(`Error ensuring column ${column} exists in ${table}:`, e);
  }
}

function initializeDatabase(db) {
  // Migrations for existing tables
  ensureColumnExists(db, 'users', 'role_label', "TEXT DEFAULT 'MEMBRO CLUB'");
  ensureColumnExists(db, 'users', 'privileges_json', "TEXT DEFAULT '{}'");
  ensureColumnExists(db, 'promotions', 'is_secret', 'INTEGER DEFAULT 0');
  ensureColumnExists(db, 'promotions', 'service_id', 'INTEGER');
  ensureColumnExists(db, 'promotions', 'min_value', 'REAL DEFAULT 0');
  ensureColumnExists(db, 'users', 'loyalty_points', 'INTEGER DEFAULT 0');
  ensureColumnExists(db, 'users', 'partner_id', 'INTEGER');

  ensureColumnExists(db, 'loyalty_rewards', 'title_es', 'TEXT');
  ensureColumnExists(db, 'loyalty_rewards', 'description_es', 'TEXT');
  ensureColumnExists(db, 'loyalty_rewards', 'reward_type', "TEXT DEFAULT 'service'");
  ensureColumnExists(db, 'loyalty_rewards', 'service_id', 'INTEGER');
  ensureColumnExists(db, 'loyalty_rewards', 'discount_value', 'REAL DEFAULT 0');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'client',
      role_label TEXT DEFAULT 'MEMBRO CLUB',
      privileges_json TEXT DEFAULT '{}',
      photo TEXT,
      language TEXT DEFAULT 'pt',
      loyalty_points INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description_pt TEXT,
      description_en TEXT,
      discount_value REAL DEFAULT 0,
      discount_type TEXT DEFAULT 'percentage',
      photo TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS loyalty_rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_pt TEXT NOT NULL,
      title_en TEXT,
      title_es TEXT,
      description_pt TEXT,
      description_en TEXT,
      description_es TEXT,
      points_required INTEGER NOT NULL,
      reward_type TEXT DEFAULT 'service',
      service_id INTEGER,
      discount_value REAL DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS loyalty_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      points INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'earned' or 'spent'
      description_pt TEXT,
      description_en TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS barbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialty TEXT,
      photo TEXT,
      photos_json TEXT DEFAULT '[]',
      bio TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS promotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_pt TEXT NOT NULL,
      title_en TEXT,
      description_pt TEXT,
      description_en TEXT,
      discount_type TEXT DEFAULT 'percentage',
      discount_value REAL,
      code TEXT UNIQUE,
      start_date TEXT,
      end_date TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_privileges (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      privileges_json TEXT DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS barber_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barber_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      duration INTEGER NOT NULL,
      icon TEXT DEFAULT 'scissors',
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      barber_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      whatsapp_sent INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      service_id INTEGER,
      barber_id INTEGER,
      appointment_id INTEGER,
      rating INTEGER NOT NULL,
      comment TEXT,
      approved INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT,
      title TEXT,
      description TEXT,
      client_name TEXT,
      uploaded_by INTEGER,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media_likes (
      media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      PRIMARY KEY (media_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS media_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      media_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS blockouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS business_hours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_of_week INTEGER NOT NULL UNIQUE,
      open_time TEXT,
      close_time TEXT,
      is_closed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS auth_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      role TEXT,
      success INTEGER DEFAULT 0,
      ip TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS module_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_key TEXT UNIQUE NOT NULL,
      content_json TEXT DEFAULT '{}',
      theme_json TEXT DEFAULT '{}',
      seo_json TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS module_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_key TEXT NOT NULL,
      item_type TEXT DEFAULT 'card',
      title_pt TEXT,
      title_en TEXT,
      subtitle_pt TEXT,
      subtitle_en TEXT,
      description_pt TEXT,
      description_en TEXT,
      badge_pt TEXT,
      badge_en TEXT,
      cta_label_pt TEXT,
      cta_label_en TEXT,
      cta_to TEXT,
      price_label TEXT,
      event_date TEXT,
      location_label TEXT,
      status_label TEXT,
      capacity_label TEXT,
      media_url TEXT,
      slug TEXT,
      data_json TEXT DEFAULT '{}',
      position INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const setupEmail = process.env.ADMIN_SETUP_EMAIL;
  const setupPassword = process.env.ADMIN_SETUP_PASSWORD;
  if (setupEmail && setupPassword) {
    const hashedPassword = bcrypt.hashSync(setupPassword, 10);
    const targetByEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(setupEmail);
    if (targetByEmail) {
      db.prepare('UPDATE users SET password = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(hashedPassword, 'admin', targetByEmail.id);
    } else {
      const currentAdmin = db.prepare('SELECT id FROM users WHERE role = ? ORDER BY id ASC LIMIT 1').get('admin');
      if (currentAdmin) {
        db.prepare('UPDATE users SET email = ?, password = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(setupEmail, hashedPassword, 'admin', currentAdmin.id);
      } else {
        db.prepare('INSERT INTO users (name, email, phone, password, role, role_label, privileges_json) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run('Admin', setupEmail, null, hashedPassword, 'admin', 'ADMIN MASTER', '{}');
      }
    }
  }

  const servicesCount = db.prepare('SELECT COUNT(*) as count FROM services').get();
  if (!servicesCount || servicesCount.count === 0) {
    const defaultServices = [
      ['Corte', 'Corte de cabelo masculino', 40.00, 30, 'scissors'],
      ['Barba', 'Aparar e modelar a barba', 25.00, 30, 'scissors'],
      ['Bigode', 'Aparar e modelar bigode', 25.00, 30, 'scissors'],
      ['Combo', 'Corte + Barba', 55.00, 60, 'package'],
      ['Sobrancelha', 'Design de sobrancelha', 15.00, 15, 'eye'],
    ];
    for (const [name, desc, price, duration, icon] of defaultServices) {
      db.prepare('INSERT INTO services (name, description, price, duration, icon) VALUES (?, ?, ?, ?, ?)').run(name, desc, price, duration, icon);
    }
  }

  const barbersCount = db.prepare('SELECT COUNT(*) as count FROM barbers').get();
  if (!barbersCount || barbersCount.count === 0) {
    db.prepare('INSERT INTO barbers (name, specialty, bio) VALUES (?, ?, ?)').run('Yuri Pires', 'Cortes Modernos & Degradê', 'Especialista em cortes modernos com mais de 5 anos de experiência.');
    db.prepare('INSERT INTO barbers (name, specialty, bio) VALUES (?, ?, ?)').run('Carlos Silva', 'Barba & Bigode', 'Mestre em barbas desenhadas e bigodes modelados.');
  }

  const hoursCount = db.prepare('SELECT COUNT(*) as count FROM business_hours').get();
  if (!hoursCount || hoursCount.count === 0) {
    for (let i = 0; i <= 6; i++) {
      db.prepare('INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed) VALUES (?, ?, ?, ?)').run(i, '09:00', '20:00', i === 0 ? 1 : 0);
    }
  }

  const defaultSettings = [
    ['site_name', 'PiresQK Barbearia'],
    ['site_tagline', 'Transformando visual em identidade. Onde cada corte é uma obra de arte.'],
    ['phone', '(49) 99918-3044'],
    ['whatsapp', '5549999183044'],
    ['address', 'Rua das Flores, 123 - Centro'],
    ['instagram', 'https://instagram.com/piresqkcortes'],
    ['facebook', 'https://facebook.com/piresqkbarbearia'],
    ['appointment_interval', '30'],
    ['primary_color', '#F5B800'],
    ['language', 'pt'],
    ['map_embed_url', ''],
    ['hero_bg', ''],
    ['site_logo', ''],
    ['theme', 'dark'],
    ['payments_enabled', '0'],
    ['payments_allow_cart', '0'],
    ['payment_provider', 'mercadopago'],
    ['mercadopago_access_token', ''],
    ['stripe_secret_key', ''],
    ['stripe_public_key', ''],
    ['business_type', 'barbershop'],
    ['feature_booking', '1'],
    ['feature_services', '1'],
    ['feature_team', '1'],
    ['feature_gallery', '1'],
    ['feature_contact', '1'],
    ['feature_map', '1'],
    ['feature_whatsapp', '1'],
    ['feature_reviews', '1'],
  ];
  for (const [key, value] of defaultSettings) {
    const exists = db.prepare('SELECT id FROM settings WHERE key = ?').get(key);
    if (!exists) db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, value);
  }

  // Seeding initial module pages for barbershop only
  const initialModules = [
    {
      key: 'barbershop__about',
      content: {
        title_pt: 'Sobre nós',
        title_en: 'About us',
        lead_pt: 'Conheça nossa barbearia especializada em cortes modernos e clássicos.',
        lead_en: 'Discover our barbershop specialized in modern and classic cuts.',
        cta_primary_label_pt: 'Agendar agora',
        cta_primary_label_en: 'Book now',
        cta_primary_to: '/booking',
        cta_secondary_label_pt: 'Ver serviços',
        cta_secondary_label_en: 'See services',
        cta_secondary_to: '/services',
        business_profile: 'barbershop'
      },
      theme: { accent_from: 'from-blue-500/20', accent_to: 'to-indigo-500/10' }
    }
  ];

  for (const mod of initialModules) {
    const exists = db.prepare('SELECT id FROM module_pages WHERE module_key = ?').get(mod.key);
    if (!exists) {
      db.prepare('INSERT INTO module_pages (module_key, content_json, theme_json) VALUES (?, ?, ?)')
        .run(mod.key, JSON.stringify(mod.content), JSON.stringify(mod.theme));
    }
  }

  const schedulesCount = db.prepare('SELECT COUNT(*) as count FROM barber_schedules').get();
  if (!schedulesCount || schedulesCount.count === 0) {
    const barbers = db.prepare('SELECT id FROM barbers').all();
    for (const barber of barbers) {
      for (let day = 1; day <= 6; day++) {
        db.prepare('INSERT INTO barber_schedules (barber_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)').run(barber.id, day, '09:00', '20:00');
      }
    }
  }

  saveDb();
  console.log('Database initialized');
}

module.exports = { getDb, initDb };
