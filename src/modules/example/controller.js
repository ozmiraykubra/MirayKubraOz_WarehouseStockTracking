const service = require('./service');
const { buildPagination } = require('../../utils/pagination');

async function list(req, res, next) {
  try {
    const { page, limit, offset } = buildPagination(req.query);
    const result = await service.listItems(req.user.companyId, {
      status: req.query.status,
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
    const item = await service.getItemById(req.user.companyId, req.params.id);
    if (!item) return res.status(404).json({ message: 'Kayıt bulunamadı' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const item = await service.createItem(req.user.companyId, req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await service.deleteItem(req.user.companyId, req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Kayıt bulunamadı' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, remove };
