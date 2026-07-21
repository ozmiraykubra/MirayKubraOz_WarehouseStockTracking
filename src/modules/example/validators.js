const { body } = require('express-validator');

const createItemRules = [
  body('name').isString().trim().notEmpty().withMessage('İsim zorunlu'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('status active veya inactive olmalı'),
];

module.exports = { createItemRules };
