// Controller'larda try/catch içinde yakalanan hatalar next(err) ile buraya devredilir.
// Bu, her controller'ın kendi hata formatlama mantığını tekrar yazmasını önler.
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Sunucu hatası' });
}

module.exports = errorHandler;
