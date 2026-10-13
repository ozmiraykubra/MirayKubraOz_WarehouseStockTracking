const express = require('express');
const controller = require('./controller');
const { authenticate } = require('../../middlewares/auth');
const handleValidationErrors = require('../../middlewares/validate');
const { 
  createStockMovementRules,
  listStockMovementRules,
  listWarehouseStockRules,
} = require('./validators');

const router = express.Router();

router.use(authenticate);

router.get(
  '/stock',
  listWarehouseStockRules,
  handleValidationErrors,
  controller.listStocks
);

router.get(
  '/',
  listStockMovementRules,
  handleValidationErrors,
  controller.list
);

router.post(
  '/',
  createStockMovementRules,
  handleValidationErrors,
  controller.create
);

module.exports = router;


/*

express.Router(): Bu modüle özel bir URL yönlendiricisi oluşturur.
authenticate: İstek sahibinin giriş yapmış kullanıcı olduğunu doğrular. Doğrulanırsa req.user.companyId bilgisi oluşur; böylece başka şirketin verisine işlem yapılamaz.
router.post('/'): Bu modül uygulamaya /api/stock-movements olarak bağlanınca, POST /api/stock-movements isteğini yakalar.
createStockMovementRules: Biraz önce yazdığın alan kontrollerini çalıştırır.
handleValidationErrors: Hatalı veri varsa controller’a geçmeden 400 hatası döner.
controller.create: Veri doğruysa stok hareketi oluşturma işini başlatır. Bu fonksiyonu sıradaki adımda yazacağız.
Sıra önemlidir: önce kimlik doğrulama, sonra veri doğrulama, en son işlemi yapan controller.

*/