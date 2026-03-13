const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticate, authenticateAdmin } = require('../middleware/auth');

let settingsCache = null;
let settingsCacheAt = 0;
const SETTINGS_CACHE_TTL = 30000;

function loadSettings(force = false) {
  const now = Date.now();
  if (!force && settingsCache && now - settingsCacheAt < SETTINGS_CACHE_TTL) {
    return settingsCache;
  }
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const obj = {};
  for (const row of rows) obj[row.key] = row.value;
  settingsCache = obj;
  settingsCacheAt = now;
  return obj;
}

router.get('/', (req, res) => {
  res.json(loadSettings());
});

router.put('/', authenticateAdmin, (req, res) => {
  const db = getDb();
  const update = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
  for (const [key, value] of Object.entries(req.body)) {
    update.run(key, value);
  }
  res.json(loadSettings(true));
});

router.get('/business-hours', (req, res) => {
  const db = getDb();
  const hours = db.prepare('SELECT * FROM business_hours ORDER BY day_of_week').all();
  res.json(hours);
});

router.put('/business-hours', authenticateAdmin, (req, res) => {
  const { hours } = req.body;
  const db = getDb();
  const update = db.prepare('UPDATE business_hours SET open_time = ?, close_time = ?, is_closed = ? WHERE day_of_week = ?');
  for (const h of hours) {
    update.run(h.open_time, h.close_time, h.is_closed ? 1 : 0, h.day_of_week);
  }
  res.json({ message: 'Horários atualizados' });
});

module.exports = router;
