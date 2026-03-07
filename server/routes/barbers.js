const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticateAdmin } = require('../middleware/auth');

router.get('/', (req, res) => {
  const db = getDb();
  const barbers = db.prepare('SELECT b.*, GROUP_CONCAT(bs.day_of_week || ":" || bs.start_time || "-" || bs.end_time) as schedules FROM barbers b LEFT JOIN barber_schedules bs ON b.id = bs.barber_id AND bs.active = 1 WHERE b.active = 1 GROUP BY b.id').all();
  res.json(barbers);
});

router.get('/all', authenticateAdmin, (req, res) => {
  const db = getDb();
  const barbers = db.prepare('SELECT * FROM barbers ORDER BY name').all();
  res.json(barbers);
});

router.get('/:id/schedules', (req, res) => {
  const db = getDb();
  const schedules = db.prepare('SELECT * FROM barber_schedules WHERE barber_id = ? AND active = 1').all(req.params.id);
  res.json(schedules);
});

router.get('/:id/available-slots', (req, res) => {
  const { date, service_id } = req.query;
  if (!date) return res.status(400).json({ message: 'Data é obrigatória' });
  const db = getDb();
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  const schedule = db.prepare('SELECT * FROM barber_schedules WHERE barber_id = ? AND day_of_week = ? AND active = 1').get(req.params.id, dayOfWeek);
  if (!schedule) return res.json([]);
  const service = service_id ? db.prepare('SELECT duration FROM services WHERE id = ?').get(service_id) : null;
  const interval = parseInt(db.prepare("SELECT value FROM settings WHERE key = 'appointment_interval'").get()?.value || '30');
  const slots = [];
  const [startH, startM] = schedule.start_time.split(':').map(Number);
  const [endH, endM] = schedule.end_time.split(':').map(Number);
  let current = startH * 60 + startM;
  const end = endH * 60 + endM;
  const duration = service ? service.duration : interval;
  const booked = db.prepare("SELECT time FROM appointments WHERE barber_id = ? AND date = ? AND status NOT IN ('cancelled')").all(req.params.id, date).map(a => a.time);
  while (current + duration <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    const timeStr = `${h}:${m}`;
    if (!booked.includes(timeStr)) slots.push(timeStr);
    current += interval;
  }
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
  const { force } = req.query;
  const db = getDb();
  
  if (force === 'true') {
    try {
      // Primeiro remover horários
      db.prepare('DELETE FROM barber_schedules WHERE barber_id = ?').run(req.params.id);
      // Tentar deletar o barbeiro
      db.prepare('DELETE FROM barbers WHERE id = ?').run(req.params.id);
      return res.json({ message: 'Barbeiro excluído permanentemente' });
    } catch (error) {
      if (error.message.includes('FOREIGN KEY')) {
        return res.status(400).json({ 
          message: 'Não é possível excluir: este barbeiro possui agendamentos vinculados. Desative-o em vez disso.',
          canDisable: true 
        });
      }
      throw error;
    }
  }

  // Comportamento padrão: apenas desativa
  db.prepare('UPDATE barbers SET active = 0 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Barbeiro desativado' });
});

module.exports = router;
