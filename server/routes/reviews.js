const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticate, authenticateAdmin } = require('../middleware/auth');

router.get('/', (req, res) => {
  const db = getDb();
  const reviews = db.prepare(`
    SELECT r.*, u.name as client_name, u.photo as client_photo,
           s.name as service_name, b.name as barber_name
    FROM reviews r
    JOIN users u ON r.client_id = u.id
    LEFT JOIN services s ON r.service_id = s.id
    LEFT JOIN barbers b ON r.barber_id = b.id
    WHERE r.approved = 1
    ORDER BY r.created_at DESC
  `).all();
  res.json(reviews);
});

router.post('/', authenticate, (req, res) => {
  const { service_id, barber_id, appointment_id, rating, comment } = req.body;
  if (!rating) return res.status(400).json({ message: 'Avaliação é obrigatória' });
  const db = getDb();
  const result = db.prepare('INSERT INTO reviews (client_id, service_id, barber_id, appointment_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)')
    .run(req.user.id, service_id || null, barber_id || null, appointment_id || null, rating, comment || null);
  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
  res.json(review);
});

router.put('/:id/approve', authenticateAdmin, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE reviews SET approved = 1 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Avaliação aprovada' });
});

router.delete('/:id', authenticateAdmin, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  res.json({ message: 'Avaliação removida' });
});

module.exports = router;
