const express = require('express');
const controller = require('./controller');
const { registerRules, loginRules } = require('./validators');
const handleValidationErrors = require('../../middlewares/validate');

const router = express.Router();

// POST /api/auth/register  -> yeni şirket + ilk admin kullanıcı oluşturur
router.post('/register', registerRules, handleValidationErrors, controller.register);

// POST /api/auth/login  -> JWT döner
router.post('/login', loginRules, handleValidationErrors, controller.login);

module.exports = router;
