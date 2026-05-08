'use strict';
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');
const { authMiddleware } = require('./auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads/logos')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 3 * 1024 * 1024 } });

function ownerMiddleware(req, res, next) {
  const t = db.prepare('SELECT * FROM tournaments WHERE slug = ?').get(req.params.slug);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });
  if (t.user_id !== req.user.id) return res.status(403).json({ error: 'Nuk keni leje' });
  req.tournament = t;
  next();
}

router.get('/', authMiddleware, (req, res) => {
  const list = db.prepare('SELECT * FROM tournaments WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(list);
});

router.post('/', authMiddleware, upload.single('logo'), (req, res) => {
  const { name, slug, order_id } = req.body;
  if (!name || !slug) return res.status(400).json({ error: 'Emri dhe slug-u janë të detyrueshëm' });
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!cleanSlug) return res.status(400).json({ error: 'Slug i pavlefshëm' });
  const exists = db.prepare('SELECT id FROM tournaments WHERE slug = ?').get(cleanSlug);
  if (exists) return res.status(400).json({ error: 'Ky slug ekziston tashmë, zgjedh tjetër' });

  let teams_limit = 16;
  let usedOrderId = null;
  if (order_id) {
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(order_id, req.user.id);
    if (!order) return res.status(400).json({ error: 'Order i pavlefshëm' });
    if (order.payment_status !== 'confirmed') return res.status(400).json({ error: 'Pagesa nuk është konfirmuar ende' });
    const alreadyUsed = db.prepare('SELECT id FROM tournaments WHERE order_id = ?').get(order.id);
    if (alreadyUsed) return res.status(400).json({ error: 'Ky order është përdorur tashmë' });
    teams_limit = order.teams_limit;
    usedOrderId = order.id;
  }

  const logo_path = req.file ? `/uploads/logos/${req.file.filename}` : null;
  const result = db.prepare(
    'INSERT INTO tournaments (user_id, order_id, slug, name, logo_path, teams_limit) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, usedOrderId, cleanSlug, name, logo_path, teams_limit);
  const t = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(result.lastInsertRowid);
  res.json(t);
});

router.get('/public/:slug', (req, res) => {
  const t = db.prepare('SELECT id, slug, name, logo_path, status, created_at, teams_limit FROM tournaments WHERE slug = ?').get(req.params.slug);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });
  const teams = db.prepare('SELECT * FROM teams WHERE tournament_id = ?').all(t.id);
  const rounds = db.prepare('SELECT * FROM rounds WHERE tournament_id = ? ORDER BY round_number ASC').all(t.id);
  const matches = db.prepare(`
    SELECT m.*, ht.name as home_name, ht.color as home_color,
           at.name as away_name, at.color as away_color, wt.name as winner_name
    FROM matches m
    LEFT JOIN teams ht ON m.home_team_id = ht.id
    LEFT JOIN teams at ON m.away_team_id = at.id
    LEFT JOIN teams wt ON m.winner_id = wt.id
    WHERE m.tournament_id = ? ORDER BY m.round_id ASC, m.id ASC
  `).all(t.id);
  const roundsWithMatches = rounds.map(r => ({ ...r, matches: matches.filter(m => m.round_id === r.id) }));
  res.json({ tournament: t, teams, rounds: roundsWithMatches });
});

router.get('/:slug', authMiddleware, ownerMiddleware, (req, res) => {
  const t = req.tournament;
  const teams = db.prepare('SELECT * FROM teams WHERE tournament_id = ?').all(t.id);
  const rounds = db.prepare('SELECT * FROM rounds WHERE tournament_id = ? ORDER BY round_number ASC').all(t.id);
  const matches = db.prepare(`
    SELECT m.*, ht.name as home_name, ht.color as home_color,
           at.name as away_name, at.color as away_color, wt.name as winner_name
    FROM matches m
    LEFT JOIN teams ht ON m.home_team_id = ht.id
    LEFT JOIN teams at ON m.away_team_id = at.id
    LEFT JOIN teams wt ON m.winner_id = wt.id
    WHERE m.tournament_id = ? ORDER BY m.round_id ASC, m.id ASC
  `).all(t.id);
  const roundsWithMatches = rounds.map(r => ({ ...r, matches: matches.filter(m => m.round_id === r.id) }));
  res.json({ tournament: t, teams, rounds: roundsWithMatches });
});

router.put('/:slug', authMiddleware, ownerMiddleware, upload.single('logo'), (req, res) => {
  const { name } = req.body;
  const t = req.tournament;
  const logo_path = req.file ? `/uploads/logos/${req.file.filename}` : t.logo_path;
  db.prepare('UPDATE tournaments SET name = COALESCE(?, name), logo_path = ? WHERE id = ?')
    .run(name || null, logo_path, t.id);
  res.json(db.prepare('SELECT * FROM tournaments WHERE id = ?').get(t.id));
});

router.delete('/:slug', authMiddleware, ownerMiddleware, (req, res) => {
  db.prepare('DELETE FROM tournaments WHERE id = ?').run(req.tournament.id);
  res.json({ ok: true });
});

module.exports = router;
