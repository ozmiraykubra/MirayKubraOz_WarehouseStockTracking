const { body } = require('express-validator');

const createCategoryRules = [
    body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Category name is required.'),
];

const updateCategoryRules = [
    body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Category name is required.'),
];

module.exports = { createCategoryRules, updateCategoryRules };