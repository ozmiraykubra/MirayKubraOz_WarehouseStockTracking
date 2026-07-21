const pool = require('../../config/db');
const { buildSort, buildMeta } = require('../../utils/pagination');

const ALLOWED_SORT_COLUMNS = ['name', 'created_at', 'status'];

// DİKKAT: her sorgu companyId ile filtrelenir. Bu, tüm domain modüllerinde
// (customers, tasks, employees, appointments...) aynı şekilde uygulanmalı.
async function listItems(companyId, { status, sort, page, limit, offset }) {
  const orderBy = buildSort({ sort }, ALLOWED_SORT_COLUMNS, 'created_at:desc');

  const filters = ['company_id = $1'];
  const params = [companyId];

  if (status) {
    params.push(status);
    filters.push(`status = $${params.length}`);
  }

  const whereClause = filters.join(' AND ');

  const dataResult = await pool.query(
    `SELECT * FROM example_items WHERE ${whereClause} ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM example_items WHERE ${whereClause}`,
    params
  );

  const total = parseInt(countResult.rows[0].count, 10);

  return { data: dataResult.rows, meta: buildMeta(total, page, limit) };
}

async function getItemById(companyId, id) {
  const result = await pool.query(
    'SELECT * FROM example_items WHERE id = $1 AND company_id = $2',
    [id, companyId]
  );
  return result.rows[0];
}

async function createItem(companyId, { name, status }) {
  const result = await pool.query(
    'INSERT INTO example_items (company_id, name, status) VALUES ($1, $2, COALESCE($3, \'active\')) RETURNING *',
    [companyId, name, status]
  );
  return result.rows[0];
}

async function deleteItem(companyId, id) {
  const result = await pool.query(
    'DELETE FROM example_items WHERE id = $1 AND company_id = $2 RETURNING id',
    [id, companyId]
  );
  return result.rows[0];
}

module.exports = { listItems, getItemById, createItem, deleteItem };
