const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticate, authenticateAdmin } = require('../middleware/auth');

router.get('/', authenticateAdmin, (req, res) => {
  const db = getDb();
  const clients = db.prepare('SELECT id, name, email, phone, photo, role_label, loyalty_points, partner_id, privileges_json, created_at FROM users WHERE role = ? ORDER BY name').all('client');
  res.json(clients);
});

router.post('/:id/points', authenticateAdmin, (req, res) => {
  const db = getDb();
  const { points, reason } = req.body;
  const clientId = req.params.id;

  db.prepare('UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?').run(points, clientId);
  
  db.prepare(`
    INSERT INTO loyalty_history (user_id, points, type, description_pt, description_en)
    VALUES (?, ?, ?, ?, ?)
  `).run(clientId, Math.abs(points), points >= 0 ? 'earned' : 'spent', reason, reason);

  res.json({ message: 'Pontos atualizados' });
});

router.post('/:id/partner', authenticateAdmin, (req, res) => {
  const db = getDb();
  const { partner_id } = req.body;
  const clientId = req.params.id;

  db.prepare('UPDATE users SET partner_id = ? WHERE id = ?').run(partner_id, clientId);
  res.json({ message: 'Parceria vinculada' });
});

router.put('/:id', authenticateAdmin, (req, res) => {
  const db = getDb();
  const { name, role_label, privileges_json, phone } = req.body;
  db.prepare('UPDATE users SET name = ?, role_label = ?, privileges_json = ?, phone = ? WHERE id = ? AND role = ?')
    .run(name, role_label, privileges_json, phone, req.params.id, 'client');
  res.json({ message: 'Cliente atualizado' });
});

router.delete('/:id', authenticateAdmin, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM users WHERE id = ? AND role = ?').run(req.params.id, 'client');
  res.json({ message: 'Cliente removido' });
});

module.exports = router;
