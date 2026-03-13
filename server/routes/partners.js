const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticate, authenticateAdmin } = require('../middleware/auth');

// List all active partners for clients
router.get('/', (req, res) => {
  const db = getDb();
  const partners = db.prepare('SELECT * FROM partners WHERE active = 1 ORDER BY name ASC').all();
  res.json(partners);
});

// Admin: List all partners
router.get('/all', authenticateAdmin, (req, res) => {
  const db = getDb();
  const partners = db.prepare('SELECT * FROM partners ORDER BY created_at DESC').all();
  res.json(partners);
});

// Admin: Create partner
router.post('/', authenticateAdmin, (req, res) => {
  const db = getDb();
  const { name, description_pt, description_en, discount_value, discount_type, photo, active } = req.body;
  
  const result = db.prepare(`
    INSERT INTO partners (name, description_pt, description_en, discount_value, discount_type, photo, active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(name, description_pt || null, description_en || null, discount_value || 0, discount_type || 'percentage', photo || null, active !== undefined ? active : 1);
  
  const created = db.prepare('SELECT * FROM partners WHERE id = ?').get(result.lastInsertRowid);
  res.json(created);
});

// Admin: Update partner
router.put('/:id', authenticateAdmin, (req, res) => {
  const db = getDb();
  const { name, description_pt, description_en, discount_value, discount_type, photo, active } = req.body;
  
  db.prepare(`
    UPDATE partners SET 
      name = ?, description_pt = ?, description_en = ?, 
      discount_value = ?, discount_type = ?, photo = ?, active = ?
    WHERE id = ?
  `).run(name, description_pt, description_en, discount_value, discount_type, photo, active !== undefined ? active : 1, req.params.id);
  
  res.json({ message: 'Parceiro atualizado' });
});

// Admin: Delete partner
router.delete('/:id', authenticateAdmin, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM partners WHERE id = ?').run(req.params.id);
  res.json({ message: 'Parceiro excluído' });
});

module.exports = router;
