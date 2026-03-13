const express = require('express');
const router = express.Router();
const { getDb } = require('../../database');
const { authenticateAdmin } = require('../../middleware/auth');
const { getBusinessType } = require('./utils');

const PAGE_KEYS = ['about'];

function parseJson(input, fallback) {
  try {
    return input ? JSON.parse(input) : fallback;
  } catch {
    return fallback;
  }
}

function ensurePage(db, businessType, pageKey) {
  const row = db.prepare('SELECT * FROM content_pages WHERE business_type = ? AND page_key = ?').get(businessType, pageKey);
  if (row) return row;
  db.prepare(`
    INSERT INTO content_pages (
      business_type, page_key, title_pt, title_en, lead_pt, lead_en, cta_primary_label_pt, cta_primary_label_en,
      cta_primary_to, cta_secondary_label_pt, cta_secondary_label_en, cta_secondary_to, body_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    businessType, pageKey, '', '', '', '', 'Saiba mais', 'Learn more', '/contact', 'Ver detalhes', 'See details', '/', JSON.stringify([])
  );
  return db.prepare('SELECT * FROM content_pages WHERE business_type = ? AND page_key = ?').get(businessType, pageKey);
}

router.get('/page/:pageKey', (req, res) => {
  const { pageKey } = req.params;
  if (!PAGE_KEYS.includes(pageKey)) return res.status(404).json({ message: 'Página não encontrada' });
  const db = getDb();
  const businessType = getBusinessType(req, db);
  const page = ensurePage(db, businessType, pageKey);
  res.json({ ...page, body: parseJson(page.body_json, []) });
});

router.get('/admin/all', authenticateAdmin, (req, res) => {
  const db = getDb();
  const businessType = getBusinessType(req, db);
  const list = PAGE_KEYS.map((pageKey) => {
    const page = ensurePage(db, businessType, pageKey);
    return { ...page, body: parseJson(page.body_json, []) };
  });
  res.json(list);
});

router.put('/admin/:pageKey', authenticateAdmin, (req, res) => {
  const { pageKey } = req.params;
  if (!PAGE_KEYS.includes(pageKey)) return res.status(404).json({ message: 'Página não encontrada' });
  const db = getDb();
  const businessType = getBusinessType(req, db);
  ensurePage(db, businessType, pageKey);
  const p = req.body || {};
  db.prepare(`
    UPDATE content_pages SET
      title_pt = ?, title_en = ?, lead_pt = ?, lead_en = ?, cta_primary_label_pt = ?, cta_primary_label_en = ?,
      cta_primary_to = ?, cta_secondary_label_pt = ?, cta_secondary_label_en = ?, cta_secondary_to = ?, body_json = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE business_type = ? AND page_key = ?
  `).run(
    p.title_pt || '', p.title_en || '', p.lead_pt || '', p.lead_en || '', p.cta_primary_label_pt || '', p.cta_primary_label_en || '',
    p.cta_primary_to || '', p.cta_secondary_label_pt || '', p.cta_secondary_label_en || '', p.cta_secondary_to || '',
    JSON.stringify(Array.isArray(p.body) ? p.body : []),
    businessType, pageKey
  );
  const updated = db.prepare('SELECT * FROM content_pages WHERE business_type = ? AND page_key = ?').get(businessType, pageKey);
  res.json({ ...updated, body: parseJson(updated.body_json, []) });
});

module.exports = router;
