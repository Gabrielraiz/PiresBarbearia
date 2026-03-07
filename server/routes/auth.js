const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database');
const { JWT_SECRET, authenticate } = require('../middleware/auth');

router.post('/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Campos obrigatórios faltando' });
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(400).json({ message: 'Email já cadastrado' });
  const hashed = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)').run(name, email, phone || null, hashed, 'client');
  const user = db.prepare('SELECT id, name, email, phone, role, photo FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ message: 'Email ou senha inválidos' });
  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Email ou senha inválidos' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

router.get('/me', authenticate, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, name, email, phone, role, photo, language, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  res.json(user);
});

router.put('/profile', authenticate, (req, res) => {
  const { name, phone, email, language } = req.body;
  const db = getDb();
  if (email && email !== req.user.email) {
    const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.user.id);
    if (existing) return res.status(400).json({ message: 'Email já em uso' });
  }
  db.prepare('UPDATE users SET name = ?, phone = ?, email = COALESCE(?, email), language = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(name, phone || null, email || null, language || 'pt', req.user.id);
  const user = db.prepare('SELECT id, name, email, phone, role, photo, language FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

router.put('/change-password', authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const valid = bcrypt.compareSync(currentPassword, user.password);
  if (!valid) return res.status(400).json({ message: 'Senha atual incorreta' });
  const hashed = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hashed, req.user.id);
  res.json({ message: 'Senha alterada com sucesso' });
});

router.put('/photo', authenticate, (req, res) => {
  const { photo } = req.body;
  if (!photo) return res.status(400).json({ message: 'Foto não fornecida' });
  const db = getDb();
  db.prepare('UPDATE users SET photo = ? WHERE id = ?').run(photo, req.user.id);
  res.json({ photo });
});

// Reset/Criar Admin - Para inicialização ou recuperação
router.post('/setup-admin', (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }
  
  const db = getDb();
  
  // Verificar se já existe um admin
  const existingAdmin = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  
  if (existingAdmin) {
    // Atualizar admin existente
    const hashed = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET email = ?, password = ?, name = ?, phone = ? WHERE role = ?')
      .run(email, hashed, name || 'Admin', phone || null, 'admin');
    const updated = db.prepare('SELECT id, name, email, phone, role FROM users WHERE role = ?').get('admin');
    return res.json({ message: 'Admin atualizado com sucesso', user: updated });
  } else {
    // Criar novo admin
    const hashed = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)')
      .run(name || 'Admin', email, phone || null, hashed, 'admin');
    const created = db.prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?').get(result.lastInsertRowid);
    return res.json({ message: 'Admin criado com sucesso', user: created });
  }
});

module.exports = router;
