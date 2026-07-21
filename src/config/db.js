const { Pool } = require('pg');
const env = require('./env');

// Tek bir pool oluşturulur, tüm uygulama boyunca bu pool kullanılır.
// Her sorgu için yeni bir client açılmaz.
const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.on('error', (err) => {
  console.error('Beklenmeyen veritabanı hatası:', err);
  process.exit(1);
});

module.exports = pool;
