const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticateAdmin } = require('../middleware/auth');

// Listar todos os bloqueios
router.get('/', authenticateAdmin, (req, res) => {
  const db = getDb();
  const blockouts = db.prepare('SELECT * FROM blockouts ORDER BY start_date DESC').all();
  res.json(blockouts);
});

// Criar um novo bloqueio
router.post('/', authenticateAdmin, (req, res) => {
  const { start_date, end_date, reason } = req.body;
  if (!start_date || !end_date) {
    return res.status(400).json({ message: 'Datas de início e fim são obrigatórias' });
  }
  const db = getDb();
  const result = db.prepare('INSERT INTO blockouts (start_date, end_date, reason) VALUES (?, ?, ?)').run(start_date, end_date, reason || null);
  const newBlockout = db.prepare('SELECT * FROM blockouts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newBlockout);
});

// Deletar um bloqueio
router.delete('/:id', authenticateAdmin, (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM blockouts WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Bloqueio não encontrado' });
  }
  res.status(204).send();
});

module.exports = router;
