const service = require('./service');
const { buildPagination } = require('../../utils/pagination');

async function list(req, res, next) {
  try {
    const { page, limit, offset } = buildPagination(req.query);
    const result = await service.listCategories(req.user.companyId, {
      search: req.query.search,
      sort: req.query.sort,
      page,
      limit,
      offset,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const category = await service.getCategoryById(req.user.companyId, req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json(category);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const category = await service.createCategory(req.user.companyId, req.body);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const category = await service.updateCategory(req.user.companyId, req.params.id, req.body);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json(category);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await service.deleteCategory(req.user.companyId, req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Category not found.' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };