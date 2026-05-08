'use strict';
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { answerCallback, editMessageText, sendMessage } = require('../utils/telegram');

router.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  const body = req.body;
  if (!body.callback_query) return;

  const { id: cbId, data, message } = body.callback_query;
  if (!data) return;

  const confirmMatch = data.match(/^confirm_order_(\d+)$/);
  const rejectMatch = data.match(/^reject_order_(\d+)$/);

  if (confirmMatch) {
    const orderId = parseInt(confirmMatch[1]);
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) { await answerCallback(cbId, '❌ Order nuk u gjet'); return; }
    if (order.payment_status === 'confirmed') { await answerCallback(cbId, '✅ Tashmë e konfirmuar'); return; }
    db.prepare("UPDATE orders SET payment_status = 'confirmed' WHERE id = ?").run(orderId);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(order.user_id);
    await answerCallback(cbId, '✅ Pagesa u konfirmua!');
    if (message?.message_id) {
      await editMessageText(message.message_id, `✅ *Pagesa u konfirmua!*\n\n👤 ${user?.name}\n📧 ${user?.email}\n💶 €${order.amount} - ${order.plan}`);
    }
    await sendMessage(`✅ Pagesa e *${user?.name}* (${user?.email}) u konfirmua!\nPlani: ${order.plan} - €${order.amount}\nTani mund të krijojë turnirin.`);
  } else if (rejectMatch) {
    const orderId = parseInt(rejectMatch[1]);
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) { await answerCallback(cbId, '❌ Order nuk u gjet'); return; }
    db.prepare("UPDATE orders SET payment_status = 'rejected' WHERE id = ?").run(orderId);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(order.user_id);
    await answerCallback(cbId, '❌ Pagesa u refuzua');
    if (message?.message_id) {
      await editMessageText(message.message_id, `❌ *Pagesa u refuzua*\n\n👤 ${user?.name}\n📧 ${user?.email}\n💶 €${order.amount} - ${order.plan}`);
    }
  }
});

module.exports = router;
