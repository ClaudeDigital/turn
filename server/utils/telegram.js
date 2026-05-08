'use strict';
const https = require('https');

const BOT_TOKEN = '8637697701:AAH9l4BHTt7UMPv1TuRY-6BXHLrGquI16-4';
const CHAT_ID = '1613742845';

function apiRequest(method, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { resolve({}); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function sendPaymentNotification(order, user) {
  const planLabel = { mini: 'Mini €5', standard: 'Standard €12', pro: 'Pro €25' }[order.plan] || order.plan;
  const text = `💰 *Kërkesë pagese e re!*\n\n👤 *Emri:* ${user.name}\n📧 *Email:* ${user.email}\n📱 *Tel:* ${user.phone || 'N/A'}\n📦 *Plani:* ${planLabel}\n💶 *Shuma:* €${order.amount}\n🏆 *Ekipe maks:* ${order.teams_limit}\n🆔 *Order ID:* ${order.id}`;
  const res = await apiRequest('sendMessage', {
    chat_id: CHAT_ID,
    text,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ Konfirmo Pagesën', callback_data: `confirm_order_${order.id}` },
        { text: '❌ Refuzo', callback_data: `reject_order_${order.id}` }
      ]]
    }
  });
  return res.result?.message_id;
}

async function sendMessage(text) {
  return apiRequest('sendMessage', { chat_id: CHAT_ID, text, parse_mode: 'Markdown' });
}

async function answerCallback(callback_query_id, text) {
  return apiRequest('answerCallbackQuery', { callback_query_id, text });
}

async function editMessageText(message_id, text) {
  return apiRequest('editMessageText', { chat_id: CHAT_ID, message_id, text, parse_mode: 'Markdown' });
}

module.exports = { sendPaymentNotification, sendMessage, answerCallback, editMessageText };
