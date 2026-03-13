const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticate, authenticateAdmin } = require('../middleware/auth');

// Get current user points and history
router.get('/my-status', authenticate, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT loyalty_points FROM users WHERE id = ?').get(req.user.id);
  const history = db.prepare('SELECT * FROM loyalty_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
  res.json({ points: user.loyalty_points, history });
});

// List active rewards for clients
router.get('/rewards', (req, res) => {
  const db = getDb();
  const rewards = db.prepare('SELECT * FROM loyalty_rewards WHERE active = 1 ORDER BY points_required ASC').all();
  res.json(rewards);
});

// Exchange points for a reward
router.post('/redeem', authenticate, (req, res) => {
  const db = getDb();
  const { reward_id } = req.body;
  
  const reward = db.prepare('SELECT * FROM loyalty_rewards WHERE id = ? AND active = 1').get(reward_id);
  if (!reward) return res.status(404).json({ message: 'Recompensa não encontrada' });
  
  const user = db.prepare('SELECT loyalty_points FROM users WHERE id = ?').get(req.user.id);
  if (user.loyalty_points < reward.points_required) {
    return res.status(400).json({ message: 'Pontos insuficientes' });
  }
  
  // Deduct points and log history
  db.prepare('UPDATE users SET loyalty_points = loyalty_points - ? WHERE id = ?').run(reward.points_required, req.user.id);
  db.prepare(`
    INSERT INTO loyalty_history (user_id, points, type, description_pt, description_en)
    VALUES (?, ?, 'spent', ?, ?)
  `).run(
    req.user.id, 
    reward.points_required, 
    `Resgate de recompensa: ${reward.title_pt}`, 
    `Reward redemption: ${reward.title_en || reward.title_pt}`
  );
  
  // Create a special notification or record for the admin to see (could be an appointment or just a log)
  // For now, just respond success
  res.json({ message: 'Recompensa resgatada com sucesso!', remaining_points: user.loyalty_points - reward.points_required });
});

// Admin: List all rewards
router.get('/rewards/all', authenticateAdmin, (req, res) => {
  const db = getDb();
  const rewards = db.prepare('SELECT * FROM loyalty_rewards ORDER BY points_required ASC').all();
  res.json(rewards);
});

// Admin: Manage rewards
router.post('/rewards', authenticateAdmin, (req, res) => {
  const db = getDb();
  const { 
    title_pt, title_en, title_es,
    description_pt, description_en, description_es,
    points_required, active, reward_type, service_id, discount_value 
  } = req.body;
  
  db.prepare(`
    INSERT INTO loyalty_rewards (
      title_pt, title_en, title_es, 
      description_pt, description_en, description_es, 
      points_required, active, reward_type, service_id, discount_value
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title_pt, title_en, title_es, 
    description_pt, description_en, description_es, 
    points_required, active !== undefined ? active : 1,
    reward_type || 'service', service_id || null, discount_value || 0
  );
  res.json({ message: 'Recompensa criada' });
});

router.put('/rewards/:id', authenticateAdmin, (req, res) => {
  const db = getDb();
  const { 
    title_pt, title_en, title_es,
    description_pt, description_en, description_es,
    points_required, active, reward_type, service_id, discount_value 
  } = req.body;
  
  db.prepare(`
    UPDATE loyalty_rewards SET 
      title_pt = ?, title_en = ?, title_es = ?, 
      description_pt = ?, description_en = ?, description_es = ?, 
      points_required = ?, active = ?, reward_type = ?, 
      service_id = ?, discount_value = ?
    WHERE id = ?
  `).run(
    title_pt, title_en, title_es, 
    description_pt, description_en, description_es, 
    points_required, active !== undefined ? active : 1,
    reward_type || 'service', service_id || null, discount_value || 0,
    req.params.id
  );
  res.json({ message: 'Recompensa atualizada' });
});

router.delete('/rewards/:id', authenticateAdmin, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM loyalty_rewards WHERE id = ?').run(req.params.id);
  res.json({ message: 'Recompensa excluída' });
});

// Helper function to add points (can be called from appointments confirmation)
// This is not an exported route but logic to be used elsewhere
const addLoyaltyPoints = (userId, points, descPt, descEn) => {
  const db = getDb();
  db.prepare('UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?').run(points, userId);
  db.prepare(`
    INSERT INTO loyalty_history (user_id, points, type, description_pt, description_en)
    VALUES (?, ?, 'earned', ?, ?)
  `).run(userId, points, descPt, descEn);
};

module.exports = router;
module.exports.addLoyaltyPoints = addLoyaltyPoints;
