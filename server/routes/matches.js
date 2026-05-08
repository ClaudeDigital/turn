'use strict';
const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db/database');
const { authMiddleware } = require('./auth');

function getT(slug, userId) {
  return db.prepare('SELECT * FROM tournaments WHERE slug = ? AND user_id = ?').get(slug, userId);
}

const MATCH_SELECT = `
  SELECT m.*, ht.name as home_name, ht.color as home_color,
         at.name as away_name, at.color as away_color, wt.name as winner_name
  FROM matches m
  LEFT JOIN teams ht ON m.home_team_id = ht.id
  LEFT JOIN teams at ON m.away_team_id = at.id
  LEFT JOIN teams wt ON m.winner_id = wt.id
`;

router.get('/', authMiddleware, (req, res) => {
  const t = getT(req.params.slug, req.user.id);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });
  const { round_id } = req.query;
  let sql = MATCH_SELECT + ' WHERE m.tournament_id = ?';
  const args = [t.id];
  if (round_id) { sql += ' AND m.round_id = ?'; args.push(round_id); }
  sql += ' ORDER BY m.round_id ASC, m.id ASC';
  res.json(db.prepare(sql).all(...args));
});

router.put('/:matchId', authMiddleware, (req, res) => {
  const t = getT(req.params.slug, req.user.id);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });
  const match = db.prepare('SELECT * FROM matches WHERE id = ? AND tournament_id = ?').get(req.params.matchId, t.id);
  if (!match) return res.status(404).json({ error: 'Ndeshja nuk u gjet' });
  if (match.is_bye) return res.status(400).json({ error: 'Ndeshjet bye nuk mund të ndryshohen' });

  const { home_score, away_score, home_pen, away_pen, match_date, match_time, status } = req.body;

  let winner_id = match.winner_id;
  let finalStatus = status || match.status;

  if (home_score !== undefined && away_score !== undefined && home_score !== null && away_score !== null) {
    const hs = parseInt(home_score), as = parseInt(away_score);
    if (hs > as) winner_id = match.home_team_id;
    else if (as > hs) winner_id = match.away_team_id;
    else {
      if (home_pen !== undefined && away_pen !== undefined) {
        winner_id = parseInt(home_pen) > parseInt(away_pen) ? match.home_team_id : match.away_team_id;
      }
    }
    finalStatus = 'perfunduar';
  }

  db.prepare(`UPDATE matches SET
    home_score = COALESCE(?, home_score), away_score = COALESCE(?, away_score),
    home_pen = ?, away_pen = ?,
    match_date = COALESCE(?, match_date), match_time = COALESCE(?, match_time),
    winner_id = ?, status = ?
    WHERE id = ?`).run(
    home_score ?? null, away_score ?? null,
    home_pen ?? null, away_pen ?? null,
    match_date || null, match_time || null,
    winner_id, finalStatus, match.id
  );

  const updated = db.prepare(MATCH_SELECT + ' WHERE m.id = ?').get(match.id);
  res.json(updated);
});

router.get('/:matchId/events', (req, res) => {
  const t = db.prepare('SELECT * FROM tournaments WHERE slug = ?').get(req.params.slug);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });
  const events = db.prepare(`
    SELECT e.*, p.name as player_name, t.name as team_name
    FROM match_events e
    LEFT JOIN players p ON e.player_id = p.id
    LEFT JOIN teams t ON e.team_id = t.id
    WHERE e.match_id = ? ORDER BY e.minute ASC, e.id ASC
  `).all(req.params.matchId);
  res.json(events);
});

router.post('/:matchId/events', authMiddleware, (req, res) => {
  const t = getT(req.params.slug, req.user.id);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });
  const match = db.prepare('SELECT * FROM matches WHERE id = ? AND tournament_id = ?').get(req.params.matchId, t.id);
  if (!match) return res.status(404).json({ error: 'Ndeshja nuk u gjet' });
  const { team_id, player_id, event_type, minute, value, notes } = req.body;
  if (!team_id || !event_type) return res.status(400).json({ error: 'team_id dhe event_type janë të detyrueshëm' });
  const result = db.prepare('INSERT INTO match_events (match_id, tournament_id, team_id, player_id, event_type, minute, value, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(match.id, t.id, team_id, player_id || null, event_type, minute || null, value || 1, notes || null);
  res.json(db.prepare('SELECT e.*, p.name as player_name, t.name as team_name FROM match_events e LEFT JOIN players p ON e.player_id = p.id LEFT JOIN teams t ON e.team_id = t.id WHERE e.id = ?').get(result.lastInsertRowid));
});

router.delete('/:matchId/events/:eventId', authMiddleware, (req, res) => {
  const t = getT(req.params.slug, req.user.id);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });
  const ev = db.prepare('SELECT * FROM match_events WHERE id = ? AND tournament_id = ?').get(req.params.eventId, t.id);
  if (!ev) return res.status(404).json({ error: 'Eventi nuk u gjet' });
  db.prepare('DELETE FROM match_events WHERE id = ?').run(ev.id);
  res.json({ ok: true });
});

module.exports = router;
