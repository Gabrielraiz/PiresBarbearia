const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticate, authenticateAdmin } = require('../middleware/auth');

// List all active public promotions for clients
router.get('/', (req, res) => {
  const db = getDb();
  const promotions = db.prepare('SELECT * FROM promotions WHERE active = 1 AND is_secret = 0 ORDER BY created_at DESC').all();
  res.json(promotions);
});

// Check/Validate a specific coupon code (including secret ones)
router.get('/validate/:code', authenticate, (req, res) => {
  const db = getDb();
  const promo = db.prepare('SELECT * FROM promotions WHERE code = ? AND active = 1').get(req.params.code.toUpperCase());
  
  if (!promo) return res.status(404).json({ message: 'Cupom inválido ou expirado' });
  
  // Check date constraints if any
  const now = new Date().toISOString().split('T')[0];
  if (promo.start_date && promo.start_date > now) return res.status(400).json({ message: 'Promoção ainda não iniciada' });
  if (promo.end_date && promo.end_date < now) return res.status(400).json({ message: 'Promoção expirada' });
  
  res.json(promo);
});

// Admin: Create promotion
router.post('/', authenticateAdmin, (req, res) => {
  const db = getDb();
  const { 
    title_pt, title_en, description_pt, description_en, 
    discount_type, discount_value, code, 
    start_date, end_date, is_secret, service_id, min_value 
  } = req.body;
  
  try {
    const result = db.prepare(`
      INSERT INTO promotions (
        title_pt, title_en, description_pt, description_en, 
        discount_type, discount_value, code, 
        start_date, end_date, is_secret, service_id, min_value
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title_pt, title_en || null, description_pt || null, description_en || null, 
      discount_type, discount_value, code ? code.toUpperCase() : null, 
      start_date || null, end_date || null, is_secret ? 1 : 0, service_id || null, min_value || 0
    );
    
    const created = db.prepare('SELECT * FROM promotions WHERE id = ?').get(result.lastInsertRowid);
    res.json(created);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar promoção. Verifique se o código é único.' });
  }
});

// Admin: Update promotion
router.put('/:id', authenticateAdmin, (req, res) => {
  const db = getDb();
  const { 
    title_pt, title_en, description_pt, description_en, 
    discount_type, discount_value, code, 
    start_date, end_date, active, is_secret, service_id, min_value 
  } = req.body;
  
  db.prepare(`
    UPDATE promotions SET 
      title_pt = ?, title_en = ?, description_pt = ?, description_en = ?, 
      discount_type = ?, discount_value = ?, code = ?, 
      start_date = ?, end_date = ?, active = ?,
      is_secret = ?, service_id = ?, min_value = ?
    WHERE id = ?
  `).run(
    title_pt, title_en || null, description_pt || null, description_en || null, 
    discount_type, discount_value, code ? code.toUpperCase() : null, 
    start_date || null, end_date || null, active !== undefined ? active : 1,
    is_secret ? 1 : 0, service_id || null, min_value || 0,
    req.params.id
  );
  
  res.json({ message: 'Promoção atualizada' });
});

// Admin: Delete promotion
router.delete('/:id', authenticateAdmin, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM promotions WHERE id = ?').run(req.params.id);
  res.json({ message: 'Promoção excluída' });
});

module.exports = router;
