const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticate, authenticateAdmin } = require('../middleware/auth');
const { validateAppointmentSlot } = require('../scheduling');
const { addLoyaltyPoints } = require('./loyalty');

router.get('/my', authenticate, (req, res) => {
  const db = getDb();
  const appointments = db.prepare(`
    SELECT a.*, s.name as service_name, s.price as service_price, s.duration as service_duration,
           b.name as barber_name, b.photo as barber_photo
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    JOIN barbers b ON a.barber_id = b.id
    WHERE a.client_id = ?
    ORDER BY a.date DESC, a.time DESC
  `).all(req.user.id);
  res.json(appointments);
});

router.post('/', authenticate, (req, res) => {
  const { barber_id, service_id, date, time, notes } = req.body;
  if (!barber_id || !service_id || !date || !time) return res.status(400).json({ message: 'Campos obrigatórios faltando' });
  const db = getDb();
  const validation = validateAppointmentSlot(db, {
    barberId: barber_id,
    serviceId: service_id,
    date,
    time,
  });
  if (!validation.ok) return res.status(400).json({ message: validation.message });
  const result = db.prepare('INSERT INTO appointments (client_id, barber_id, service_id, date, time, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)').run(req.user.id, barber_id, service_id, date, time, notes || null, 'confirmed');
  const appt = db.prepare(`
    SELECT a.*, s.name as service_name, s.price as service_price,
           b.name as barber_name, u.name as client_name, u.phone as client_phone
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    JOIN barbers b ON a.barber_id = b.id
    JOIN users u ON a.client_id = u.id
    WHERE a.id = ?
  `).get(result.lastInsertRowid);
  db.prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)").run(
    req.user.id, 'Agendamento Confirmado',
    `Seu agendamento de ${appt.service_name} com ${appt.barber_name} foi confirmado para ${date} às ${time}.`,
    'success'
  );
  res.json(appt);
});

router.put('/:id/cancel', authenticate, (req, res) => {
  const db = getDb();
  const appt = db.prepare('SELECT * FROM appointments WHERE id = ? AND client_id = ?').get(req.params.id, req.user.id);
  if (!appt) return res.status(404).json({ message: 'Agendamento não encontrado' });
  if (appt.status === 'cancelled') return res.status(400).json({ message: 'Agendamento já cancelado' });
  db.prepare("UPDATE appointments SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
  db.prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)").run(
    req.user.id, 'Agendamento Cancelado', `Seu agendamento foi cancelado.`, 'warning'
  );
  res.json({ message: 'Agendamento cancelado' });
});

router.put('/:id/reschedule', authenticate, (req, res) => {
  const { date, time, barber_id } = req.body;
  if (!date || !time) return res.status(400).json({ message: 'Data e horário são obrigatórios' });
  const db = getDb();
  const appt = db.prepare('SELECT * FROM appointments WHERE id = ? AND client_id = ?').get(req.params.id, req.user.id);
  if (!appt) return res.status(404).json({ message: 'Agendamento não encontrado' });
  const newBarberId = barber_id || appt.barber_id;
  const validation = validateAppointmentSlot(db, {
    barberId: newBarberId,
    serviceId: appt.service_id,
    date,
    time,
    excludeAppointmentId: req.params.id,
  });
  if (!validation.ok) return res.status(400).json({ message: validation.message });
  db.prepare("UPDATE appointments SET date = ?, time = ?, barber_id = ?, status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(date, time, newBarberId, req.params.id);
  db.prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)").run(
    req.user.id, 'Agendamento Remarcado', `Seu agendamento foi remarcado para ${date} às ${time}.`, 'info'
  );
  res.json({ message: 'Agendamento remarcado com sucesso' });
});

router.get('/admin/all', authenticateAdmin, (req, res) => {
  const { date, status, barber_id } = req.query;
  const db = getDb();
  let query = `SELECT a.*, s.name as service_name, s.price as service_price, s.duration as service_duration,
               b.name as barber_name, u.name as client_name, u.phone as client_phone, u.email as client_email
               FROM appointments a
               JOIN services s ON a.service_id = s.id
               JOIN barbers b ON a.barber_id = b.id
               JOIN users u ON a.client_id = u.id WHERE 1=1`;
  const params = [];
  if (date) { query += ' AND a.date = ?'; params.push(date); }
  if (status) { query += ' AND a.status = ?'; params.push(status); }
  if (barber_id) { query += ' AND a.barber_id = ?'; params.push(barber_id); }
  query += ' ORDER BY a.date DESC, a.time ASC';
  const appointments = db.prepare(query).all(...params);
  res.json(appointments);
});

router.put('/:id/status', authenticateAdmin, (req, res) => {
  const { status } = req.body;
  const db = getDb();
  
  // Get current appointment info
  const oldAppt = db.prepare('SELECT status, client_id, service_id FROM appointments WHERE id = ?').get(req.params.id);
  if (!oldAppt) return res.status(404).json({ message: 'Agendamento não encontrado' });
  
  db.prepare("UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, req.params.id);
  
  const appt = db.prepare(`
    SELECT a.*, u.id as user_id, s.name as service_name, s.price as service_price
    FROM appointments a 
    JOIN users u ON a.client_id = u.id 
    JOIN services s ON a.service_id = s.id
    WHERE a.id = ?
  `).get(req.params.id);
  
  const msgs = { confirmed: 'confirmado', cancelled: 'cancelado', completed: 'concluído' };
  
  if (appt) {
    db.prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)").run(
      appt.user_id, `Agendamento ${msgs[status] || 'atualizado'}`,
      `Seu agendamento de ${appt.service_name} foi ${msgs[status] || 'atualizado'}.`, 
      status === 'confirmed' ? 'success' : 'info'
    );
    
    // Award points if status changed to completed
    if (status === 'completed' && oldAppt.status !== 'completed') {
      // Logic: 1 point for every R$ 10 spent
      const points = Math.floor(appt.service_price / 10);
      if (points > 0) {
        addLoyaltyPoints(
          appt.user_id, 
          points, 
          `Pontos ganhos pelo serviço: ${appt.service_name}`, 
          `Points earned for service: ${appt.service_name}`
        );
      }
    }
  }
  res.json({ message: 'Status atualizado' });
});

router.put('/:id/admin-reschedule', authenticateAdmin, (req, res) => {
  const { date, time } = req.body;
  if (!date || !time) return res.status(400).json({ message: 'Data e horário são obrigatórios' });
  const db = getDb();
  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!appt) return res.status(404).json({ message: 'Agendamento não encontrado' });
  const validation = validateAppointmentSlot(db, {
    barberId: appt.barber_id,
    serviceId: appt.service_id,
    date,
    time,
    excludeAppointmentId: req.params.id,
  });
  if (!validation.ok) return res.status(400).json({ message: validation.message });
  db.prepare("UPDATE appointments SET date = ?, time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(date, time, req.params.id);
  res.json({ message: 'Remarcado com sucesso' });
});

router.delete('/:id', authenticateAdmin, (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: 'Agendamento não encontrado' });
  res.json({ message: 'Agendamento excluído permanentemente' });
});

module.exports = router;
