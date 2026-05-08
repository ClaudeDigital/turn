'use strict';
const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db/database');
const { authMiddleware } = require('./auth');

function getT(slug, userId) {
  return db.prepare('SELECT * FROM tournaments WHERE slug = ? AND user_id = ?').get(slug, userId);
}

router.get('/', authMiddleware, (req, res) => {
  const t = getT(req.params.slug, req.user.id);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });
  res.json(db.prepare('SELECT * FROM teams WHERE tournament_id = ? ORDER BY name ASC').all(t.id));
});

router.post('/', authMiddleware, (req, res) => {
  const t = getT(req.params.slug, req.user.id);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Emri i ekipit është i detyrueshëm' });
  const count = db.prepare('SELECT COUNT(*) as c FROM teams WHERE tournament_id = ?').get(t.id).c;
  if (count >= t.teams_limit) return res.status(400).json({ error: `Keni arritur limitin e ekipeve (${t.teams_limit})` });
  const result = db.prepare('INSERT INTO teams (tournament_id, name, color) VALUES (?, ?, ?)').run(t.id, name, color || '#3b82f6');
  res.json(db.prepare('SELECT * FROM teams WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:teamId', authMiddleware, (req, res) => {
  const t = getT(req.params.slug, req.user.id);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });
  const team = db.prepare('SELECT * FROM teams WHERE id = ? AND tournament_id = ?').get(req.params.teamId, t.id);
  if (!team) return res.status(404).json({ error: 'Ekipi nuk u gjet' });
  const { name, color, status } = req.body;
  db.prepare('UPDATE teams SET name = COALESCE(?, name), color = COALESCE(?, color), status = COALESCE(?, status) WHERE id = ?')
    .run(name || null, color || null, status || null, team.id);
  res.json(db.prepare('SELECT * FROM teams WHERE id = ?').get(team.id));
});

router.delete('/:teamId', authMiddleware, (req, res) => {
  const t = getT(req.params.slug, req.user.id);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });
  const team = db.prepare('SELECT * FROM teams WHERE id = ? AND tournament_id = ?').get(req.params.teamId, t.id);
  if (!team) return res.status(404).json({ error: 'Ekipi nuk u gjet' });
  db.prepare('DELETE FROM teams WHERE id = ?').run(team.id);
  res.json({ ok: true });
});

module.exports = router;
