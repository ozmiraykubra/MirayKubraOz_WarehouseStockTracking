const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', require('./modules/auth/routes'));

// ÖRNEK modül — kendi domain modülünüzü (customers, tasks, employees, appointments...)
// aynı pattern ile buraya ekleyin: app.use('/api/customers', require('./modules/customers/routes'));
app.use('/api/example-items', require('./modules/example/routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint bulunamadı' });
});

// Merkezi hata yönetimi en sonda olmalı
app.use(errorHandler);

module.exports = app;
