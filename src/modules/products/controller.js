const service = require('./service');
const { buildPagination } = require('../../utils/pagination');

async function list(req, res, next) {
  try {
    const { page, limit, offset } = buildPagination(req.query);
    const result = await service.listProducts(req.user.companyId, {
      search: req.query.search,
      category_id: req.query.category_id,
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
    const product = await service.getProductById(req.user.companyId, req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const product = await service.createProduct(req.user.companyId, req.body);
    res.status(201).json(product);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Bu ürün kodu zaten kullanılmaktadır.' });
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const product = await service.updateProduct(req.user.companyId, req.params.id, req.body);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Bu ürün kodu başka bir üründe kullanılmaktadır.' });
    }
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await service.deleteProduct(req.user.companyId, req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found.' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };