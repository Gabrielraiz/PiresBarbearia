const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticateAdmin } = require('../middleware/auth');
const { getAvailableSlotsForBarber } = require('../scheduling');

router.get('/', (req, res) => {
  const db = getDb();
  const barbers = db.prepare(`
    SELECT 
      b.*, 
      (SELECT AVG(r.rating) FROM reviews r WHERE r.barber_id = b.id AND r.approved = 1) as avg_rating,
      (SELECT COUNT(r.id) FROM reviews r WHERE r.barber_id = b.id AND r.approved = 1) as review_count
    FROM barbers b
    WHERE b.active = 1
  `).all();
  res.json(barbers);
});

router.get('/all', authenticateAdmin, (req, res) => {
  const db = getDb();
  const barbers = db.prepare('SELECT * FROM barbers ORDER BY name').all();
  res.json(barbers);
});

router.get('/:id/schedules', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM barber_schedules WHERE barber_id = ? ORDER BY day_of_week ASC').all(req.params.id);
  const business = db.prepare('SELECT day_of_week, open_time, close_time, is_closed FROM business_hours').all();
  const byDay = new Map(rows.map((row) => [Number(row.day_of_week), row]));
  const businessByDay = new Map(business.map((row) => [Number(row.day_of_week), row]));
  const schedules = [];
  for (let day = 0; day <= 6; day++) {
    const own = byDay.get(day);
    if (own) {
      schedules.push(own);
    } else {
      const fallback = businessByDay.get(day);
      schedules.push({
        id: null,
        barber_id: Number(req.params.id),
        day_of_week: day,
        start_time: fallback?.open_time || '09:00',
        end_time: fallback?.close_time || '20:00',
        active: fallback?.is_closed ? 0 : 1,
      });
    }
  }
  res.json(schedules);
});

router.get('/:id/available-slots', (req, res) => {
  const { date, service_id } = req.query;
  if (!date) return res.status(400).json({ message: 'Data é obrigatória' });
  const db = getDb();
  const slots = getAvailableSlotsForBarber(db, { barberId: req.params.id, date, serviceId: service_id });
  res.json(slots);
});

router.post('/', authenticateAdmin, (req, res) => {
  const { name, specialty, bio, photo } = req.body;
  if (!name) return res.status(400).json({ message: 'Nome é obrigatório' });
  const db = getDb();
  const result = db.prepare('INSERT INTO barbers (name, specialty, bio, photo) VALUES (?, ?, ?, ?)').run(name, specialty || null, bio || null, photo || null);
  const barber = db.prepare('SELECT * FROM barbers WHERE id = ?').get(result.lastInsertRowid);
  for (let day = 1; day <= 6; day++) {
    db.prepare('INSERT INTO barber_schedules (barber_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)').run(barber.id, day, '09:00', '20:00');
  }
  res.json(barber);
});

router.put('/:id', authenticateAdmin, (req, res) => {
  const { name, specialty, bio, photo, active } = req.body;
  const db = getDb();
  db.prepare('UPDATE barbers SET name = ?, specialty = ?, bio = ?, photo = ?, active = ? WHERE id = ?')
    .run(name, specialty || null, bio || null, photo || null, active !== undefined ? active : 1, req.params.id);
  const barber = db.prepare('SELECT * FROM barbers WHERE id = ?').get(req.params.id);
  res.json(barber);
});

router.put('/:id/schedules', authenticateAdmin, (req, res) => {
  const { schedules } = req.body;
  const db = getDb();
  db.prepare('DELETE FROM barber_schedules WHERE barber_id = ?').run(req.params.id);
  const insert = db.prepare('INSERT INTO barber_schedules (barber_id, day_of_week, start_time, end_time, active) VALUES (?, ?, ?, ?, ?)');
  for (const s of schedules) {
    insert.run(req.params.id, s.day_of_week, s.start_time, s.end_time, s.active !== false ? 1 : 0);
  }
  res.json({ message: 'Horários atualizados' });
});

router.delete('/:id', authenticateAdmin, (req, res) => {
  const db = getDb();
  
  try {
    // Primeiro remover horários
    db.prepare('DELETE FROM barber_schedules WHERE barber_id = ?').run(req.params.id);
    
    // Tentar deletar o barbeiro
    const result = db.prepare('DELETE FROM barbers WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Barbeiro não encontrado' });
    }
    
    res.json({ message: 'Barbeiro excluído permanentemente do sistema' });
  } catch (error) {
    if (error.message.includes('FOREIGN KEY')) {
      // Se houver agendamentos, apenas desativa
      db.prepare('UPDATE barbers SET active = 0 WHERE id = ?').run(req.params.id);
      return res.json({ 
        message: 'O barbeiro possui agendamentos vinculados e foi apenas desativado para preservar o histórico.' 
      });
    }
    res.status(500).json({ message: 'Erro ao excluir barbeiro: ' + error.message });
  }
});

module.exports = router;
