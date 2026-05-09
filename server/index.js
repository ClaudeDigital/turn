'use strict';
const express = require('express');
const path = require('path');
const fs = require('fs');

require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/orders',      require('./routes/orders'));
app.use('/api/tournaments', require('./routes/tournaments'));
app.use('/api/tournaments/:slug/teams',   require('./routes/teams'));
app.use('/api/tournaments/:slug/players', require('./routes/players'));
app.use('/api/tournaments/:slug/rounds',  require('./routes/rounds'));
app.use('/api/tournaments/:slug/matches', require('./routes/matches'));
app.use('/api/telegram',    require('./routes/telegram-webhook'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const DIST = path.join(__dirname, '../public');
app.use(express.static(DIST, {
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));
app.get('*', (_req, res) => {
  const idx = path.join(DIST, 'index.html');
  if (fs.existsSync(idx)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.sendFile(idx);
  }
  res.status(503).send('Frontend duke u ndërtuar...');
});

app.listen(PORT, () => console.log(`[turn] Port ${PORT}`));
