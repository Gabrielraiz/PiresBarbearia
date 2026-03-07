const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticate, authenticateAdmin } = require('../middleware/auth');

router.get('/', (req, res) => {
  const db = getDb();
  const settings = db.prepare('SELECT key, value FROM settings').all();
  const obj = {};
  for (const s of settings) obj[s.key] = s.value;
  res.json(obj);
});

router.put('/', authenticateAdmin, (req, res) => {
  const db = getDb();
  const update = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
  for (const [key, value] of Object.entries(req.body)) {
    update.run(key, value);
  }
  const settings = db.prepare('SELECT key, value FROM settings').all();
  const obj = {};
  for (const s of settings) obj[s.key] = s.value;
  res.json(obj);
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
