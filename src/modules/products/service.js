const pool = require('../../config/db');
const { buildSort, buildMeta } = require('../../utils/pagination');

const ALLOWED_SORT_COLUMNS = ['name', 'code', 'created_at'];

async function listProducts(companyId, { search, category_id, sort, page, limit, offset }) {
  const orderBy = buildSort({ sort }, ALLOWED_SORT_COLUMNS, 'created_at:desc');
  const filters = ['p.company_id = $1'];
  const params = [companyId];

  if (search) {
    params.push(`%${search}%`);
    filters.push(`(p.name ILIKE $${params.length} OR p.code ILIKE $${params.length})`);
  }

  if (category_id) {
    params.push(category_id);
    filters.push(`p.category_id = $${params.length}`);
  }

  const whereClause = filters.join(' AND ');

  const dataQuery = `
    SELECT 
      p.*, 
      c.name AS category_name,
      COALESCE(SUM(ws.quantity), 0)::INT AS total_stock
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN warehouse_stocks ws ON p.id = ws.product_id
    WHERE ${whereClause}
    GROUP BY p.id, c.name
    ORDER BY ${orderBy}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const countQuery = `SELECT COUNT(*) FROM products p WHERE ${whereClause}`;

  const dataResult = await pool.query(dataQuery, [...params, limit, offset]);
  const countResult = await pool.query(countQuery, params);

  const total = parseInt(countResult.rows[0].count, 10);
  return { data: dataResult.rows, meta: buildMeta(total, page, limit) };
}

async function getProductById(companyId, id) {
  const query = `
    SELECT 
      p.*, 
      c.name AS category_name,
      COALESCE(SUM(ws.quantity), 0)::INT AS total_stock
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN warehouse_stocks ws ON p.id = ws.product_id
    WHERE p.id = $1 AND p.company_id = $2
    GROUP BY p.id, c.name
  `;
  const result = await pool.query(query, [id, companyId]);
  return result.rows[0];
}

async function createProduct(companyId, { category_id, code, name, unit, critical_stock = 0, status = 'active' }) {
  const result = await pool.query(
    `INSERT INTO products (company_id, category_id, code, name, unit, critical_stock, status) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [companyId, category_id, code, name, unit, critical_stock, status]
  );
  return result.rows[0];
}

async function updateProduct(companyId, id, { category_id, code, name, unit, critical_stock, status }) {
  const result = await pool.query(
    `UPDATE products 
     SET category_id = $1, code = $2, name = $3, unit = $4, critical_stock = $5, status = $6, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $7 AND company_id = $8 RETURNING *`,
    [category_id, code, name, unit, critical_stock, status, id, companyId]
  );
  return result.rows[0];
}

async function deleteProduct(companyId, id) {
  const result = await pool.query(
    'DELETE FROM products WHERE id = $1 AND company_id = $2 RETURNING id',
    [id, companyId]
  );
  return result.rows[0];
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};