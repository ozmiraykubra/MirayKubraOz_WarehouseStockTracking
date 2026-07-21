const express = require('express');
const controller = require('./controller');
const { createItemRules } = require('./validators');
const handleValidationErrors = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/auth');

const router = express.Router();

// Bu modüldeki tüm endpoint'ler auth gerektirir (JWT + company scope).
router.use(authenticate);

// GET /api/example-items?status=active&sort=name:asc&page=1&limit=20
router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', createItemRules, handleValidationErrors, controller.create);
router.delete('/:id', controller.remove);

module.exports = router;
