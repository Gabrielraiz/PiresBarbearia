const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticateAdmin } = require('../middleware/auth');

const MODULE_KEYS = ['about'];
const BUSINESS_TYPE = 'barbershop';

function parseJson(input, fallback) {
  try {
    return input ? JSON.parse(input) : fallback;
  } catch {
    return fallback;
  }
}

function scopedModuleKey(moduleKey) {
  return `${BUSINESS_TYPE}__${moduleKey}`;
}

function ensureModulePage(moduleKey) {
  const db = getDb();
  const scopedKey = scopedModuleKey(moduleKey);
  const existing = db.prepare('SELECT * FROM module_pages WHERE module_key = ?').get(scopedKey);
  if (existing) return existing;
  db.prepare('INSERT INTO module_pages (module_key, content_json, theme_json, seo_json) VALUES (?, ?, ?, ?)')
    .run(scopedKey, JSON.stringify({}), JSON.stringify({}), JSON.stringify({}));
  return db.prepare('SELECT * FROM module_pages WHERE module_key = ?').get(scopedKey);
}

function normalizeItemPayload(body) {
  return {
    item_type: body.item_type || 'card',
    title_pt: body.title_pt || '',
    title_en: body.title_en || '',
    subtitle_pt: body.subtitle_pt || '',
    subtitle_en: body.subtitle_en || '',
    description_pt: body.description_pt || '',
    description_en: body.description_en || '',
    badge_pt: body.badge_pt || '',
    badge_en: body.badge_en || '',
    cta_label_pt: body.cta_label_pt || '',
    cta_label_en: body.cta_label_en || '',
    cta_to: body.cta_to || '',
    price_label: body.price_label || '',
    event_date: body.event_date || '',
    location_label: body.location_label || '',
    status_label: body.status_label || '',
    capacity_label: body.capacity_label || '',
    media_url: body.media_url || '',
    slug: body.slug || '',
    position: Number.isFinite(Number(body.position)) ? Number(body.position) : 0,
    active: body.active === 0 || body.active === '0' || body.active === false ? 0 : 1,
    data_json: JSON.stringify(parseJson(body.data_json, body.data || {})),
  };
}

router.get('/page/:moduleKey', (req, res) => {
  const { moduleKey } = req.params;
  if (!MODULE_KEYS.includes(moduleKey)) return res.status(404).json({ message: 'Módulo não encontrado' });
  const db = getDb();
  const scopeKey = scopedModuleKey(moduleKey);
  const row = ensureModulePage(moduleKey);
  const items = db.prepare('SELECT * FROM module_items WHERE module_key = ? AND active = 1 ORDER BY position ASC, id DESC').all(scopeKey)
    .map((item) => ({ ...item, data: parseJson(item.data_json, {}) }));
  res.json({
    module_key: moduleKey,
    business_type: BUSINESS_TYPE,
    content: parseJson(row.content_json, {}),
    theme: parseJson(row.theme_json, {}),
    seo: parseJson(row.seo_json, {}),
    items,
  });
});

router.get('/admin/pages', authenticateAdmin, (req, res) => {
  const list = MODULE_KEYS.map((moduleKey) => {
    const page = ensureModulePage(moduleKey);
    return {
      module_key: moduleKey,
      business_type: BUSINESS_TYPE,
      content: parseJson(page.content_json, {}),
      theme: parseJson(page.theme_json, {}),
      seo: parseJson(page.seo_json, {}),
    };
  });
  res.json(list);
});

router.put('/admin/pages/:moduleKey', authenticateAdmin, (req, res) => {
  const { moduleKey } = req.params;
  if (!MODULE_KEYS.includes(moduleKey)) return res.status(404).json({ message: 'Módulo não encontrado' });
  const db = getDb();
  const scopeKey = scopedModuleKey(moduleKey);
  ensureModulePage(moduleKey);
  db.prepare('UPDATE module_pages SET content_json = ?, theme_json = ?, seo_json = ?, updated_at = CURRENT_TIMESTAMP WHERE module_key = ?')
    .run(
      JSON.stringify(req.body.content || {}),
      JSON.stringify(req.body.theme || {}),
      JSON.stringify(req.body.seo || {}),
      scopeKey
    );
  const updated = db.prepare('SELECT * FROM module_pages WHERE module_key = ?').get(scopeKey);
  res.json({
    module_key: moduleKey,
    business_type: BUSINESS_TYPE,
    content: parseJson(updated.content_json, {}),
    theme: parseJson(updated.theme_json, {}),
    seo: parseJson(updated.seo_json, {}),
  });
});

router.get('/admin/pages/:moduleKey/items', authenticateAdmin, (req, res) => {
  const { moduleKey } = req.params;
  if (!MODULE_KEYS.includes(moduleKey)) return res.status(404).json({ message: 'Módulo não encontrado' });
  const db = getDb();
  const scopeKey = scopedModuleKey(moduleKey);
  ensureModulePage(moduleKey);
  const items = db.prepare('SELECT * FROM module_items WHERE module_key = ? ORDER BY position ASC, id DESC').all(scopeKey)
    .map((item) => ({ ...item, data: parseJson(item.data_json, {}) }));
  res.json(items);
});

router.post('/admin/pages/:moduleKey/items', authenticateAdmin, (req, res) => {
  const { moduleKey } = req.params;
  if (!MODULE_KEYS.includes(moduleKey)) return res.status(404).json({ message: 'Módulo não encontrado' });
  const db = getDb();
  const scopeKey = scopedModuleKey(moduleKey);
  const payload = normalizeItemPayload(req.body || {});
  const result = db.prepare(`
    INSERT INTO module_items (
      module_key, item_type, title_pt, title_en, subtitle_pt, subtitle_en, description_pt, description_en,
      badge_pt, badge_en, cta_label_pt, cta_label_en, cta_to, price_label, event_date, location_label,
      status_label, capacity_label, media_url, slug, data_json, position, active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    scopeKey, payload.item_type, payload.title_pt, payload.title_en, payload.subtitle_pt, payload.subtitle_en,
    payload.description_pt, payload.description_en, payload.badge_pt, payload.badge_en, payload.cta_label_pt,
    payload.cta_label_en, payload.cta_to, payload.price_label, payload.event_date, payload.location_label,
    payload.status_label, payload.capacity_label, payload.media_url, payload.slug, payload.data_json, payload.position, payload.active
  );
  const created = db.prepare('SELECT * FROM module_items WHERE id = ?').get(result.lastInsertRowid);
  res.json({ ...created, data: parseJson(created.data_json, {}) });
});

router.put('/admin/items/:id', authenticateAdmin, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM module_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Item não encontrado' });
  const payload = normalizeItemPayload(req.body || {});
  db.prepare(`
    UPDATE module_items SET
      item_type = ?, title_pt = ?, title_en = ?, subtitle_pt = ?, subtitle_en = ?, description_pt = ?, description_en = ?,
      badge_pt = ?, badge_en = ?, cta_label_pt = ?, cta_label_en = ?, cta_to = ?, price_label = ?, event_date = ?,
      location_label = ?, status_label = ?, capacity_label = ?, media_url = ?, slug = ?, data_json = ?, position = ?,
      active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    payload.item_type, payload.title_pt, payload.title_en, payload.subtitle_pt, payload.subtitle_en, payload.description_pt, payload.description_en,
    payload.badge_pt, payload.badge_en, payload.cta_label_pt, payload.cta_label_en, payload.cta_to, payload.price_label, payload.event_date,
    payload.location_label, payload.status_label, payload.capacity_label, payload.media_url, payload.slug, payload.data_json, payload.position,
    payload.active, req.params.id
  );
  const updated = db.prepare('SELECT * FROM module_items WHERE id = ?').get(req.params.id);
  res.json({ ...updated, data: parseJson(updated.data_json, {}) });
});

router.delete('/admin/items/:id', authenticateAdmin, (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM module_items WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: 'Item não encontrado' });
  res.json({ message: 'Item removido com sucesso' });
});

module.exports = router;
