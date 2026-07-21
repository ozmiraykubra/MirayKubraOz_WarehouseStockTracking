const { body } = require('express-validator');

function companySlugRule() {
  return body('companySlug')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Company slug zorunlu')
    .bail()
    .isLength({ min: 3, max: 50 })
    .withMessage('Company slug 3-50 karakter olmalı')
    .bail()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Company slug sadece kucuk harf, rakam ve tire icerebilir')
    .toLowerCase();
}

// Yeni şirket + ilk admin kullanıcı kaydı
const registerRules = [
  companySlugRule(),
  body('companyName').isString().trim().notEmpty().withMessage('Şirket adı zorunlu'),
  body('email').isEmail().withMessage('Geçerli bir email giriniz').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
];

const loginRules = [
  companySlugRule(),
  body('email').isEmail().withMessage('Geçerli bir email giriniz').normalizeEmail(),
  body('password').notEmpty().withMessage('Şifre zorunlu'),
];

module.exports = { registerRules, loginRules };
