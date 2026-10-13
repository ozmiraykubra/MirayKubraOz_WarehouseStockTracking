const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Bu middleware, gelen JWT'yi doğrular ve req.user içine
// { id, companyId, role } bilgisini set eder.
// Bundan sonraki her controller/service, req.user.companyId'yi
// tüm sorgularda filtre olarak kullanmak ZORUNDADIR (multitenancy kuralı).
function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token not found.' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: payload.userId,
      companyId: payload.companyId,
      role: payload.role,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// Belirli role'lere göre erişim kısıtlamak için kullanılır.
// Örnek: router.delete('/:id', authenticate, authorize('admin'), controller.remove)
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
