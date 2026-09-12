const express = require('express');
const controller = require('./controller');
const { createProductRules, updateProductRules } = require('./validators');
const handleValidationErrors = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', createProductRules, handleValidationErrors, controller.create);
router.put('/:id', updateProductRules, handleValidationErrors, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
