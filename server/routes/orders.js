'use strict';
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authMiddleware } = require('./auth');
const { sendPaymentNotification } = require('../utils/telegram');

const PLANS = {
  mini:     { amount: 5,  teams_limit: 8,  label: 'Mini' },
  standard: { amount: 12, teams_limit: 16, label: 'Standard' },
  pro:      { amount: 25, teams_limit: 32, label: 'Pro' }
};

router.post('/', authMiddleware, async (req, res) => {
  const { plan, payment_method, notes } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ error: 'Plan i pavlefshëm' });
  const p = PLANS[plan];
  const result = db.prepare(
    'INSERT INTO orders (user_id, plan, amount, teams_limit, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, plan, p.amount, p.teams_limit, payment_method || 'cash', notes || null);
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  try {
    const msgId = await sendPaymentNotification(order, user);
    if (msgId) db.prepare('UPDATE orders SET telegram_message_id = ? WHERE id = ?').run(String(msgId), order.id);
  } catch (e) {
    console.error('[orders] Telegram error:', e.message);
  }
  res.json(order);
});

router.get('/mine', authMiddleware, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(orders);
});

router.get('/:id', authMiddleware, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order nuk u gjet' });
  res.json(order);
});

module.exports = router;
