const { body, query } = require('express-validator');

const createStockMovementRules = [
  body('product_id')
    .isInt({ min: 1 })
    .withMessage('Enter the invalid product id!'),

  body('warehouse_id')
    .isInt({ min: 1 })
    .withMessage('Enter the invalid warehouse id!'),

  body('type')
    .isIn(['in', 'out'])
    .withMessage('Movement type must be in or out!'),

  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be greater than 0 and integer!'),

  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be max 500 character!'),

  body('movement_date')
    .optional()
    .isISO8601()
    .withMessage('Must be enter invalid movement date!'),
];

const listStockMovementRules = [
  query('product_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer.'),

  query('warehouse_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Warehouse ID must be a positive integer.'),

  query('type')
    .optional()
    .isIn(['in', 'out'])
    .withMessage('Movement type must be in or out.'),

  query('from_date')
    .optional()
    .isISO8601()
    .withMessage('From date must be valid.'),

  query('to_date')
    .optional()
    .isISO8601()
    .withMessage('To date must be valid.'),
];

const listWarehouseStockRules = [
  query('product_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer.'),

  query('warehouse_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Warehouse ID must be a positive integer.'),

  query('critical_only')
    .optional()
    .isBoolean()
    .withMessage('Critical only must be true or false.'),
];

module.exports = {
  createStockMovementRules,
  listStockMovementRules,
  listWarehouseStockRules,
};

/*
require('express-validator'): Projede kurulu olan doğrulama paketini dosyaya alır.
body(...): Kullanıcının gönderdiği JSON içindeki bir alanı kontrol eder. Örneğin body('product_id'), req.body.product_id alanını inceler.
isInt({ min: 1 }): ID ve miktarın pozitif tam sayı olmasını zorunlu kılar. 0, -3 veya "abc" kabul edilmez.
isIn(['in', 'out']): Hareket türünü sadece iki seçenekle sınırlar:- in: stok girişi
- out: stok çıkışı

optional(): Bu alanı göndermemek serbesttir. Açıklama ve hareket tarihi zorunlu değildir.
trim(): Açıklamanın başındaki ve sonundaki gereksiz boşlukları kaldırır.
withMessage(...): Kural başarısız olursa kullanıcıya gösterilecek anlaşılır hata mesajıdır.
Köşeli parantez []: Birden çok doğrulama kuralını tek grupta tutar.
module.exports: Bu kuralları daha sonra routes.js dosyasında kullanabilmemizi sağlar.

*/