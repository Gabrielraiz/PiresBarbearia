const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticateAdmin } = require('../middleware/auth');

router.get('/clients', authenticateAdmin, (req, res) => {
  const db = getDb();
  const clients = db.prepare('SELECT id, name, email, phone, photo, created_at FROM users WHERE role = ? ORDER BY name').all('client');
  res.json(clients);
});

router.get('/dashboard', authenticateAdmin, (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const todayAppts = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE date = ?").get(today).count;
  const pendingAppts = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'").get().count;
  const totalClients = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'client'").get().count;
  const monthStart = new Date(); monthStart.setDate(1);
  const monthRevenue = db.prepare(`
    SELECT SUM(s.price) as total FROM appointments a
    JOIN services s ON a.service_id = s.id
    WHERE a.date >= ? AND a.status = 'completed'
  `).get(monthStart.toISOString().split('T')[0]).total || 0;
  const recentAppts = db.prepare(`
    SELECT a.*, s.name as service_name, b.name as barber_name, u.name as client_name
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    JOIN barbers b ON a.barber_id = b.id
    JOIN users u ON a.client_id = u.id
    WHERE a.date >= ?
    ORDER BY a.date ASC, a.time ASC
    LIMIT 10
  `).all(today);
  res.json({ todayAppts, pendingAppts, totalClients, monthRevenue, recentAppts });
});

router.get('/reports', authenticateAdmin, (req, res) => {
  const db = getDb();
  const { from, to } = req.query;
  const fromDate = from || '2000-01-01';
  const toDate = to || '2099-12-31';
  const totalAppts = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE date BETWEEN ? AND ?").get(fromDate, toDate).count;
  const completedAppts = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE date BETWEEN ? AND ? AND status = 'completed'").get(fromDate, toDate).count;
  const revenue = db.prepare("SELECT SUM(s.price) as total FROM appointments a JOIN services s ON a.service_id = s.id WHERE a.date BETWEEN ? AND ? AND a.status = 'completed'").get(fromDate, toDate).total || 0;
  const topServices = db.prepare("SELECT s.name, COUNT(*) as count FROM appointments a JOIN services s ON a.service_id = s.id WHERE a.date BETWEEN ? AND ? GROUP BY s.id ORDER BY count DESC LIMIT 5").all(fromDate, toDate);
  const topClients = db.prepare("SELECT u.name, u.email, COUNT(*) as count FROM appointments a JOIN users u ON a.client_id = u.id WHERE a.date BETWEEN ? AND ? GROUP BY u.id ORDER BY count DESC LIMIT 5").all(fromDate, toDate);
  const avgRating = db.prepare("SELECT AVG(rating) as avg FROM reviews WHERE approved = 1").get().avg || 0;
  const monthlyData = db.prepare(`
    SELECT strftime('%Y-%m', date) as month, COUNT(*) as appointments,
           SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM appointments WHERE date BETWEEN ? AND ?
    GROUP BY month ORDER BY month
  `).all(fromDate, toDate);
  res.json({ totalAppts, completedAppts, revenue, topServices, topClients, avgRating, monthlyData });
});

module.exports = router;
