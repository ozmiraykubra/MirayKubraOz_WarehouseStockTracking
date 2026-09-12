const express = require('express');
const controller = require('./controller');
const { createWarehouseRules, updateWarehouseRules } = require('./validators');
const handleValidationErrors = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', createWarehouseRules, handleValidationErrors, controller.create);
router.put('/:id', updateWarehouseRules, handleValidationErrors, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;