'use strict';
const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db/database');
const { authMiddleware } = require('./auth');

function getT(slug, userId) {
  return db.prepare('SELECT * FROM tournaments WHERE slug = ? AND user_id = ?').get(slug, userId);
}

function getRoundName(teams_count) {
  if (teams_count <= 2) return 'Finale';
  if (teams_count <= 4) return 'Gjysmëfinale';
  if (teams_count <= 8) return 'Çerekfinale';
  if (teams_count <= 16) return 'Runda e 16-ës';
  return 'Runda e 32-ës';
}

router.get('/', authMiddleware, (req, res) => {
  const t = getT(req.params.slug, req.user.id);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });
  const rounds = db.prepare('SELECT * FROM rounds WHERE tournament_id = ? ORDER BY round_number ASC').all(t.id);
  const allMatches = db.prepare(`
    SELECT m.*, ht.name as home_name, ht.color as home_color,
           at.name as away_name, at.color as away_color, wt.name as winner_name
    FROM matches m
    LEFT JOIN teams ht ON m.home_team_id = ht.id
    LEFT JOIN teams at ON m.away_team_id = at.id
    LEFT JOIN teams wt ON m.winner_id = wt.id
    WHERE m.tournament_id = ? ORDER BY m.id ASC
  `).all(t.id);
  res.json(rounds.map(r => ({ ...r, matches: allMatches.filter(m => m.round_id === r.id) })));
});

router.post('/draw-preview', authMiddleware, (req, res) => {
  const t = getT(req.params.slug, req.user.id);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });

  const rounds = db.prepare('SELECT * FROM rounds WHERE tournament_id = ? ORDER BY round_number DESC').all(t.id);
  let eligibleTeams;

  if (rounds.length === 0) {
    eligibleTeams = db.prepare("SELECT id, name, color FROM teams WHERE tournament_id = ? AND status = 'aktiv'").all(t.id);
  } else {
    const lastRound = rounds[0];
    const incomplete = db.prepare("SELECT COUNT(*) as c FROM matches WHERE round_id = ? AND status != 'perfunduar' AND is_bye = 0").get(lastRound.id).c;
    if (incomplete > 0) return res.status(400).json({ error: `Runda aktive ka ${incomplete} ndeshje të papërfunduara` });
    const winnerIds = db.prepare('SELECT winner_id FROM matches WHERE round_id = ? AND is_bye = 0 AND winner_id IS NOT NULL').all(lastRound.id).map(m => m.winner_id);
    const byeIds = db.prepare('SELECT home_team_id FROM matches WHERE round_id = ? AND is_bye = 1').all(lastRound.id).map(m => m.home_team_id);
    const allIds = [...new Set([...winnerIds, ...byeIds])];
    if (allIds.length < 2) return res.status(400).json({ error: 'Nuk ka ekipe të mjaftueshme për raundin tjetër' });
    eligibleTeams = allIds.map(id => db.prepare('SELECT id, name, color FROM teams WHERE id = ?').get(id)).filter(Boolean);
  }

  if (eligibleTeams.length < 2) return res.status(400).json({ error: 'Duhen të paktën 2 ekipe' });

  const shuffled = [...eligibleTeams];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const pairs = [];
  const arr = [...shuffled];
  while (arr.length >= 2) pairs.push({ home_team: arr.shift(), away_team: arr.shift(), is_bye: false });
  if (arr.length === 1) pairs.push({ home_team: arr[0], away_team: null, is_bye: true });

  res.json({ pairs, team_count: eligibleTeams.length, round_name: getRoundName(eligibleTeams.length) });
});

router.post('/draw-confirm', authMiddleware, (req, res) => {
  const t = getT(req.params.slug, req.user.id);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });
  const { pairs, name, start_date, end_date } = req.body;
  if (!pairs || !Array.isArray(pairs)) return res.status(400).json({ error: 'Pairs janë të detyrueshme' });

  const rounds = db.prepare('SELECT * FROM rounds WHERE tournament_id = ? ORDER BY round_number DESC').all(t.id);
  if (rounds.length > 0) {
    db.prepare("UPDATE rounds SET status = 'perfunduar' WHERE id = ? AND status = 'aktiv'").run(rounds[0].id);
  }

  const nextNum = (rounds[0]?.round_number || 0) + 1;
  const roundName = name || getRoundName(pairs.filter(p => !p.is_bye).length * 2 + pairs.filter(p => p.is_bye).length);
  const rRes = db.prepare("INSERT INTO rounds (tournament_id, round_number, name, start_date, end_date, status, draw_done) VALUES (?, ?, ?, ?, ?, 'aktiv', 1)")
    .run(t.id, nextNum, roundName, start_date || null, end_date || null);
  const roundId = rRes.lastInsertRowid;

  const insertMatch = db.prepare("INSERT INTO matches (tournament_id, round_id, home_team_id, away_team_id, is_bye, status) VALUES (?, ?, ?, ?, ?, 'planifikuar')");
  const byeMatch = db.prepare("INSERT INTO matches (tournament_id, round_id, home_team_id, is_bye, winner_id, status) VALUES (?, ?, ?, 1, ?, 'perfunduar')");

  db.transaction(() => {
    for (const p of pairs) {
      if (p.is_bye) {
        byeMatch.run(t.id, roundId, p.home_team.id, p.home_team.id);
      } else {
        insertMatch.run(t.id, roundId, p.home_team.id, p.away_team.id, 0);
      }
    }
  })();

  const round = db.prepare('SELECT * FROM rounds WHERE id = ?').get(roundId);
  const matches = db.prepare(`
    SELECT m.*, ht.name as home_name, ht.color as home_color,
           at.name as away_name, at.color as away_color
    FROM matches m
    LEFT JOIN teams ht ON m.home_team_id = ht.id
    LEFT JOIN teams at ON m.away_team_id = at.id
    WHERE m.round_id = ? ORDER BY m.id ASC
  `).all(roundId);
  res.json({ ...round, matches });
});

router.put('/:roundId', authMiddleware, (req, res) => {
  const t = getT(req.params.slug, req.user.id);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });
  const round = db.prepare('SELECT * FROM rounds WHERE id = ? AND tournament_id = ?').get(req.params.roundId, t.id);
  if (!round) return res.status(404).json({ error: 'Runda nuk u gjet' });
  const { name, start_date, end_date, status } = req.body;
  db.prepare('UPDATE rounds SET name = COALESCE(?, name), start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date), status = COALESCE(?, status) WHERE id = ?')
    .run(name || null, start_date || null, end_date || null, status || null, round.id);
  res.json(db.prepare('SELECT * FROM rounds WHERE id = ?').get(round.id));
});

router.delete('/:roundId', authMiddleware, (req, res) => {
  const t = getT(req.params.slug, req.user.id);
  if (!t) return res.status(404).json({ error: 'Turniri nuk u gjet' });
  const round = db.prepare('SELECT * FROM rounds WHERE id = ? AND tournament_id = ?').get(req.params.roundId, t.id);
  if (!round) return res.status(404).json({ error: 'Runda nuk u gjet' });
  db.prepare('DELETE FROM rounds WHERE id = ?').run(round.id);
  res.json({ ok: true });
});

module.exports = router;
