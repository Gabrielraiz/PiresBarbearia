const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticate, authenticateAdmin, JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do Multer para upload de mídia
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = file.mimetype.startsWith('video/') ? 'videos' : 'images';
    const dir = path.join(__dirname, '../../uploads', type);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Listar mídia com contagem de curtidas e se o usuário atual curtiu (Público)
router.get('/', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  let userId = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch {}
  }

  const db = getDb();
  const media = db.prepare(`
    SELECT m.*, 
           (SELECT COUNT(*) FROM media_likes WHERE media_id = m.id) as likes,
           (SELECT COUNT(*) FROM media_likes WHERE media_id = m.id AND user_id = ?) as user_liked
    FROM media m 
    WHERE m.active = 1
    ORDER BY created_at DESC
  `).all(userId);

  // Formatar a URL para o frontend
  const formattedMedia = media.map(item => {
    let filename = item.filename;
    if (!filename.startsWith('/uploads/')) {
      filename = `/uploads/${item.type === 'video' ? 'videos' : 'images'}/${filename}`;
    }
    return { ...item, filename };
  });

  res.json(formattedMedia);
});

// Upload de nova mídia (Admin)
router.post('/', authenticateAdmin, upload.single('file'), (req, res) => {
  const { title, description, client_name } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'Nenhum arquivo enviado' });

  const type = file.mimetype.startsWith('video/') ? 'video' : 'image';
  const db = getDb();
  
  const result = db.prepare(`
    INSERT INTO media (type, filename, original_name, title, description, client_name, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(type, file.filename, file.originalname, title || null, description || null, client_name || null, req.user.id);

  const newMedia = db.prepare('SELECT * FROM media WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newMedia);
});

// Deletar mídia (Admin)
router.delete('/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const item = db.prepare('SELECT * FROM media WHERE id = ?').get(id);

  if (!item) return res.status(404).json({ message: 'Mídia não encontrada' });

  // Remover arquivo físico
  const filePath = path.join(__dirname, '../../uploads', item.type === 'video' ? 'videos' : 'images', item.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  db.prepare('DELETE FROM media WHERE id = ?').run(id);
  res.json({ message: 'Mídia removida com sucesso' });
});

// Curtir/Descurtir uma mídia
router.post('/:id/like', authenticate, (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const db = getDb();

  const existingLike = db.prepare('SELECT * FROM media_likes WHERE media_id = ? AND user_id = ?').get(id, user_id);

  if (existingLike) {
    db.prepare('DELETE FROM media_likes WHERE media_id = ? AND user_id = ?').run(id, user_id);
    res.json({ liked: false });
  } else {
    db.prepare('INSERT INTO media_likes (media_id, user_id) VALUES (?, ?)').run(id, user_id);
    res.json({ liked: true });
  }
});

// Listar comentários de uma mídia
router.get('/:id/comments', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const comments = db.prepare(`
    SELECT c.*, u.name as user_name, u.photo as user_photo
    FROM media_comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.media_id = ?
    ORDER BY c.created_at DESC
  `).all(id);
  res.json(comments);
});

// Adicionar um comentário
router.post('/:id/comments', authenticate, (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const user_id = req.user.id;
  if (!comment) return res.status(400).json({ message: 'Comentário não pode ser vazio' });

  const db = getDb();
  
  // Verificar se a mídia existe antes de comentar
  const media = db.prepare('SELECT id FROM media WHERE id = ?').get(id);
  if (!media) return res.status(404).json({ message: 'Mídia não encontrada' });

  const result = db.prepare('INSERT INTO media_comments (media_id, user_id, comment) VALUES (?, ?, ?)').run(id, user_id, comment);
  
  const newComment = db.prepare(`
    SELECT c.*, u.name as user_name, u.photo as user_photo
    FROM media_comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(newComment);
});

module.exports = router;
