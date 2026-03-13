const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticate, authenticateAdmin } = require('../middleware/auth');

router.get('/', (req, res) => {
  const db = getDb();
  const services = db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY name').all();
  res.json(services);
});

router.get('/all', authenticateAdmin, (req, res) => {
  const db = getDb();
  const services = db.prepare('SELECT * FROM services ORDER BY name').all();
  res.json(services);
});

router.post('/', authenticateAdmin, (req, res) => {
  const { name, description, price, duration, icon } = req.body;
  if (!name || !price || !duration) return res.status(400).json({ message: 'Campos obrigatórios faltando' });
  const db = getDb();
  const result = db.prepare('INSERT INTO services (name, description, price, duration, icon) VALUES (?, ?, ?, ?, ?)').run(name, description || null, price, duration, icon || 'scissors');
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
  res.json(service);
});

router.put('/:id', authenticateAdmin, (req, res) => {
  const { name, description, price, duration, icon, active } = req.body;
  const db = getDb();
  db.prepare('UPDATE services SET name = ?, description = ?, price = ?, duration = ?, icon = ?, active = ? WHERE id = ?')
    .run(name, description || null, price, duration, icon || 'scissors', active !== undefined ? active : 1, req.params.id);
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  res.json(service);
});

router.delete('/:id', authenticateAdmin, (req, res) => {
  const db = getDb();
  
  try {
    // Tentar deletar definitivamente
    const result = db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }
    
    res.json({ message: 'Serviço excluído permanentemente do sistema' });
  } catch (error) {
    if (error.message.includes('FOREIGN KEY')) {
      // Se houver agendamentos, apenas desativa para não quebrar o histórico
      db.prepare('UPDATE services SET active = 0 WHERE id = ?').run(req.params.id);
      return res.json({ 
        message: 'O serviço possui agendamentos vinculados e foi apenas desativado para preservar o histórico.' 
      });
    }
    res.status(500).json({ message: 'Erro ao excluir serviço: ' + error.message });
  }
});

module.exports = router;
