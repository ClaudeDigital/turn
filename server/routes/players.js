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
  const { team_id } = req.query;
  let sql = 'SELECT p.*, t.name as team_name, t.color as team_color FROM players p JOIN teams t ON p.team_id = t.id WHERE p.tournament_id = ?';
  const args = [t.id];
  if (team_id) { sql += ' AND p.team_id = ?'; args.push(team_id); }
  sql += ' ORDER BY t.name ASC, p.name ASC';
  res.json(db.prepare(sql).all(...args));
});

router.post('/', authMiddleware, (req, res) => {
  const t = getT(req.params.slug, req.user.id);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });
  const { team_id, name, position, jersey_number } = req.body;
  if (!team_id || !name) return res.status(400).json({ error: 'Ekipi dhe emri janë të detyrueshëm' });
  const team = db.prepare('SELECT id FROM teams WHERE id = ? AND tournament_id = ?').get(team_id, t.id);
  if (!team) return res.status(404).json({ error: 'Ekipi nuk u gjet' });
  const result = db.prepare('INSERT INTO players (team_id, tournament_id, name, position, jersey_number) VALUES (?, ?, ?, ?, ?)')
    .run(team_id, t.id, name, position || null, jersey_number || null);
  res.json(db.prepare('SELECT p.*, t.name as team_name FROM players p JOIN teams t ON p.team_id = t.id WHERE p.id = ?').get(result.lastInsertRowid));
});

router.put('/:playerId', authMiddleware, (req, res) => {
  const t = getT(req.params.slug, req.user.id);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });
  const player = db.prepare('SELECT * FROM players WHERE id = ? AND tournament_id = ?').get(req.params.playerId, t.id);
  if (!player) return res.status(404).json({ error: 'Lojtari nuk u gjet' });
  const { name, position, jersey_number, team_id } = req.body;
  db.prepare('UPDATE players SET name = COALESCE(?, name), position = COALESCE(?, position), jersey_number = COALESCE(?, jersey_number), team_id = COALESCE(?, team_id) WHERE id = ?')
    .run(name || null, position || null, jersey_number || null, team_id || null, player.id);
  res.json(db.prepare('SELECT p.*, t.name as team_name FROM players p JOIN teams t ON p.team_id = t.id WHERE p.id = ?').get(player.id));
});

router.delete('/:playerId', authMiddleware, (req, res) => {
  const t = getT(req.params.slug, req.user.id);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });
  const player = db.prepare('SELECT * FROM players WHERE id = ? AND tournament_id = ?').get(req.params.playerId, t.id);
  if (!player) return res.status(404).json({ error: 'Lojtari nuk u gjet' });
  db.prepare('DELETE FROM players WHERE id = ?').run(player.id);
  res.json({ ok: true });
});

module.exports = router;
