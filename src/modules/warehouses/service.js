const pool = require('../../config/db');
const { buildSort, buildMeta } = require('../../utils/pagination');

const ALLOWED_SORT_COLUMNS = ['name', 'created_at'];

async function listWarehouses(companyId, { search, sort, page, limit, offset }) {
  const orderBy = buildSort({ sort }, ALLOWED_SORT_COLUMNS, 'created_at:desc');
  const filters = ['company_id = $1'];
  const params = [companyId];

  if (search) {
    params.push(`%${search}%`);
    filters.push(`name ILIKE $${params.length}`);
  }

  const whereClause = filters.join(' AND ');

  const dataResult = await pool.query(
    `SELECT * FROM warehouses WHERE ${whereClause} ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM warehouses WHERE ${whereClause}`,
    params
  );

  const total = parseInt(countResult.rows[0].count, 10);
  return { data: dataResult.rows, meta: buildMeta(total, page, limit) };
}

async function getWarehouseById(companyId, id) {
  const result = await pool.query(
    'SELECT * FROM warehouses WHERE id = $1 AND company_id = $2',
    [id, companyId]
  );
  return result.rows[0];
}

async function createWarehouse(companyId, { name, address }) {
  const result = await pool.query(
    'INSERT INTO warehouses (company_id, name, address) VALUES ($1, $2, $3) RETURNING *',
    [companyId, name, address || null]
  );
  return result.rows[0];
}

async function updateWarehouse(companyId, id, { name, address }) {
  const result = await pool.query(
    'UPDATE warehouses SET name = $1, address = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND company_id = $4 RETURNING *',
    [name, address || null, id, companyId]
  );
  return result.rows[0];
}

async function deleteWarehouse(companyId, id) {
  const result = await pool.query(
    'DELETE FROM warehouses WHERE id = $1 AND company_id = $2 RETURNING id',
    [id, companyId]
  );
  return result.rows[0];
}

module.exports = {
  listWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
};