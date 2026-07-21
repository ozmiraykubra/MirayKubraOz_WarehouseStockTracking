const service = require('./service');

async function register(req, res, next) {
  try {
    const { companyName, companySlug, email, password } = req.body;
    const { company, user } = await service.registerCompanyWithAdmin({
      companyName,
      companySlug,
      email,
      password,
    });
    res.status(201).json({ company, user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { companySlug, email, password } = req.body;
    const result = await service.login({ companySlug, email, password });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
