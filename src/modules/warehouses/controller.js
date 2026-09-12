const service = require('./service');
const { buildPagination } = require('../../utils/pagination');

async function list(req, res, next) {
  try {
    const { page, limit, offset } = buildPagination(req.query);
    const result = await service.listWarehouses(req.user.companyId, {
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
    const warehouse = await service.getWarehouseById(req.user.companyId, req.params.id);
    if (!warehouse) return res.status(404).json({ message: 'Warehouse not found.' });
    res.json(warehouse);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const warehouse = await service.createWarehouse(req.user.companyId, req.body);
    res.status(201).json(warehouse);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const warehouse = await service.updateWarehouse(req.user.companyId, req.params.id, req.body);
    if (!warehouse) return res.status(404).json({ message: 'Warehouse not found.' });
    res.json(warehouse);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await service.deleteWarehouse(req.user.companyId, req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Warehouse not found.' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };