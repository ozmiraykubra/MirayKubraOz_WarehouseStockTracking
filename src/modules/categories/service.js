const pool = require('../../config/db');
const { buildSort, buildMeta } = require('../../utils/pagination');

const ALLOWED_SORT_COLUMNS = ['name', 'created_at'];

async function listCategories(companyId, { search, sort, page, limit, offset }) {
  const orderBy = buildSort({ sort }, ALLOWED_SORT_COLUMNS, 'created_at:desc');
  const filters = ['company_id = $1'];
  const params = [companyId];

  if (search) {
    params.push(`%${search}%`);
    filters.push(`name ILIKE $${params.length}`);
  }

  const whereClause = filters.join(' AND ');

  const dataResult = await pool.query(
    `SELECT * FROM categories WHERE ${whereClause} ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM categories WHERE ${whereClause}`,
    params
  );

  const total = parseInt(countResult.rows[0].count, 10);
  return { data: dataResult.rows, meta: buildMeta(total, page, limit) };
}

async function getCategoryById(companyId, id) {
  const result = await pool.query(
    'SELECT * FROM categories WHERE id = $1 AND company_id = $2',
    [id, companyId]
  );
  return result.rows[0];
}

async function createCategory(companyId, { name }) {
  const result = await pool.query(
    'INSERT INTO categories (company_id, name) VALUES ($1, $2) RETURNING *',
    [companyId, name]
  );
  return result.rows[0];
}

async function updateCategory(companyId, id, { name }) {
  const result = await pool.query(
    'UPDATE categories SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND company_id = $3 RETURNING *',
    [name, id, companyId]
  );
  return result.rows[0];
}

async function deleteCategory(companyId, id) {
  const result = await pool.query(
    'DELETE FROM categories WHERE id = $1 AND company_id = $2 RETURNING id',
    [id, companyId]
  );
  return result.rows[0];
}

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};