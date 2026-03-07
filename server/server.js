require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDb, getDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

const uploadsDir = path.join(__dirname, '..', 'uploads');
const imagesDir = path.join(uploadsDir, 'images');
const videosDir = path.join(uploadsDir, 'videos');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

initDb().then(() => {
  const authRoutes = require('./routes/auth');
  const appointmentsRoutes = require('./routes/appointments');
  const servicesRoutes = require('./routes/services');
  const barbersRoutes = require('./routes/barbers');
  const clientsRoutes = require('./routes/clients');
  const adminRoutes = require('./routes/admin');
  const settingsRoutes = require('./routes/settings');
  const reviewsRoutes = require('./routes/reviews');
  const mediaRoutes = require('./routes/media');
  const notificationsRoutes = require('./routes/notifications');
  const paymentsRoutes = require('./routes/payments');
  const oauthRoutes = require('./routes/oauth');
  const backupRoutes = require('./routes/backup');

  app.use('/api/auth', authRoutes);
  app.use('/api/oauth', oauthRoutes);
  app.use('/api/appointments', appointmentsRoutes);
  app.use('/api/services', servicesRoutes);
  app.use('/api/barbers', barbersRoutes);
  app.use('/api/clients', clientsRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/reviews', reviewsRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/payments', paymentsRoutes);
  app.use('/api/backup', backupRoutes);

  app.get('/api/backup', require('./middleware/auth').authenticateAdmin, (req, res) => {
    const db = getDb();
    const tables = ['users', 'barbers', 'services', 'appointments', 'reviews', 'media', 'settings', 'business_hours', 'barber_schedules', 'notifications'];
    const backup = { timestamp: new Date().toISOString() };
    for (const table of tables) {
      try { backup[table] = db.prepare(`SELECT * FROM ${table}`).all(); } catch { backup[table] = []; }
    }
    res.setHeader('Content-Disposition', `attachment; filename=backup_${Date.now()}.json`);
    res.json(backup);
  });

  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'client', 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).send('<html><body><h1>PiresQK Barbearia API</h1><p>Client not built. Run: npm run build</p></body></html>');
    }
  });

  app.listen(PORT, () => {
    console.log(`PiresQK Barbearia server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
