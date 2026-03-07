const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticate, authenticateAdmin } = require('../middleware/auth');

router.get('/', authenticateAdmin, (req, res) => {
  const db = getDb();
  const clients = db.prepare('SELECT id, name, email, phone, photo, created_at FROM users WHERE role = ? ORDER BY name').all('client');
  res.json(clients);
});

router.delete('/:id', authenticateAdmin, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM users WHERE id = ? AND role = ?').run(req.params.id, 'client');
  res.json({ message: 'Cliente removido' });
});

module.exports = router;
