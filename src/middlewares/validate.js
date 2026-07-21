const { validationResult } = require('express-validator');

// Her route'ta validator kurallarından sonra bu middleware kullanılır.
// Örnek: router.post('/', createRules, handleValidationErrors, controller.create)
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = handleValidationErrors;
