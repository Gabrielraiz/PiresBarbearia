require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initDb, getDb } = require('./database');

const app = express();

// Segurança: Adiciona cabeçalhos HTTP seguros
app.use(helmet({
  contentSecurityPolicy: false, // Desativado para facilitar carregamento de recursos externos se necessário
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Segurança: Limita o número de requisições por IP (Rate Limit)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // Limite de 500 requisições por IP por janela
  message: { message: 'Muitas requisições vindas deste IP, tente novamente após 15 minutos.' }
});

// Aplica o limitador apenas às rotas da API
app.use('/api/', limiter);

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
  const blockoutsRoutes = require('./routes/blockouts');
  const securityRoutes = require('./routes/security');
  const modulesRoutes = require('./routes/modules');
  const promotionsRoutes = require('./routes/promotions');
  const partnersRoutes = require('./routes/partners');
  const loyaltyRoutes = require('./routes/loyalty');

  app.use('/api/auth', authRoutes);
  app.use('/api/oauth', oauthRoutes);
  app.use('/api/security', securityRoutes);
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
  app.use('/api/blockouts', blockoutsRoutes);
  app.use('/api/modules', modulesRoutes);
  app.use('/api/promotions', promotionsRoutes);
  app.use('/api/partners', partnersRoutes);
  app.use('/api/loyalty', loyaltyRoutes);

  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'client', 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).send('<html><body><h1>PiresQK Barbearia API</h1><p>Client not built. Run: npm run build</p></body></html>');
    }
  });

  app.listen(PORT, () => {
    console.log(`\n🚀 SERVER RUNNING: http://localhost:${PORT}`);
    console.log(`📡 API ENDPOINT: http://localhost:${PORT}/api`);
    console.log(`🌐 DEV FRONTEND: http://localhost:5173 (Use this while developing)\n`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
