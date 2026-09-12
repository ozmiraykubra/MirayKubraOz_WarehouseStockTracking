const { body } = require('express-validator');

const createProductRules = [
  body('category_id').isInt().withMessage('Geçerli bir kategori ID girilmelidir.'),
  body('code').isString().trim().notEmpty().withMessage('Ürün kodu zorunludur.'),
  body('name').isString().trim().notEmpty().withMessage('Ürün adı zorunludur.'),
  body('unit').isString().trim().notEmpty().withMessage('Birim zorunludur (örn: adet, kg).'),
  body('critical_stock').optional().isInt({ min: 0 }).withMessage('Kritik stok 0 veya daha büyük olmalıdır.'),
  body('status').optional().isIn(['active', 'passive']).withMessage('Durum active veya passive olmalıdır.'),
];

const updateProductRules = [
  body('category_id').isInt().withMessage('Geçerli bir kategori ID girilmelidir.'),
  body('code').isString().trim().notEmpty().withMessage('Ürün kodu zorunludur.'),
  body('name').isString().trim().notEmpty().withMessage('Ürün adı zorunludur.'),
  body('unit').isString().trim().notEmpty().withMessage('Birim zorunludur.'),
  body('critical_stock').optional().isInt({ min: 0 }).withMessage('Kritik stok 0 veya daha büyük olmalıdır.'),
  body('status').optional().isIn(['active', 'passive']).withMessage('Durum active veya passive olmalıdır.'),
];

module.exports = { createProductRules, updateProductRules };