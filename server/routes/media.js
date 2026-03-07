const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../database');
const { authenticate, authenticateAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = file.mimetype.startsWith('video') ? 'videos' : 'images';
    cb(null, path.join(__dirname, '../../uploads', type));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

router.get('/', (req, res) => {
  const db = getDb();
  const media = db.prepare('SELECT * FROM media WHERE active = 1 ORDER BY created_at DESC').all();
  res.json(media);
});

router.post('/', authenticateAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Arquivo não enviado' });
  const db = getDb();
  const type = req.file.mimetype.startsWith('video') ? 'video' : 'image';
  const subDir = type === 'video' ? 'videos' : 'images';
  const result = db.prepare('INSERT INTO media (type, filename, original_name, title, description, client_name, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(type, `/uploads/${subDir}/${req.file.filename}`, req.file.originalname, req.body.title || null, req.body.description || null, req.body.client_name || null, req.user.id);
  const media = db.prepare('SELECT * FROM media WHERE id = ?').get(result.lastInsertRowid);
  res.json(media);
});

router.delete('/:id', authenticateAdmin, (req, res) => {
  const db = getDb();
  const media = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id);
  if (media) {
    const filePath = path.join(__dirname, '../..', media.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
  }
  res.json({ message: 'Mídia removida' });
});

module.exports = router;
