const { body } = require('express-validator');

const createWarehouseRules = [
  body('name')
  .isString()
  .trim()
  .notEmpty()
  .withMessage('Warehouse name is required.'),
  body('address').optional().isString().trim(),
];

const updateWarehouseRules = [
  body('name')
  .isString()
  .trim()
  .notEmpty()
  .withMessage('Warehouse name is required..'),
  body('address')
  .optional()
  .isString()
  .trim(),
];

module.exports = { createWarehouseRules, updateWarehouseRules };