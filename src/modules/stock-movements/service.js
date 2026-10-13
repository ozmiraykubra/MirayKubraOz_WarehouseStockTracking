const e = require('express');
const pool = require('../../config/db');

function createHttpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function createStockMovement(companyId, data) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const productResult = await client.query(
      `SELECT id, status
       FROM products
       WHERE id = $1 AND company_id = $2
       FOR UPDATE`,
      [data.product_id, companyId]
    );

    const product = productResult.rows[0];

    if (!product) {
      throw createHttpError('Product not found.', 404);
    }

    if (product.status !== 'active') {
      throw createHttpError(
        'Stock movement cannot be created for an inactive product.',
        400
      );
    }

    const warehouseResult = await client.query(
      `SELECT id
       FROM warehouses
       WHERE id = $1 AND company_id = $2`,
      [data.warehouse_id, companyId]
    );

    const warehouse = warehouseResult.rows[0];

    if (!warehouse) {
      throw createHttpError('Warehouse not found.', 404);
    }

    const stockResult = await client.query(
      `SELECT quantity
       FROM warehouse_stocks
       WHERE company_id = $1
         AND product_id = $2
         AND warehouse_id = $3
       FOR UPDATE`,
      [companyId, data.product_id, data.warehouse_id]
    );

    const currentQuantity = stockResult.rows[0]
      ? Number(stockResult.rows[0].quantity)
      : 0;

    const quantity = Number(data.quantity);

    if (data.type === 'out' && currentQuantity < quantity) {
      throw createHttpError('There is not enough stock in this warehouse.', 400);
    }

    const change = data.type === 'in' ? quantity : -quantity;

    let newQuantity;

    if (stockResult.rows[0]) {
      const updatedStockResult = await client.query(
        `UPDATE warehouse_stocks
         SET quantity = quantity + $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE company_id = $2
           AND product_id = $3
           AND warehouse_id = $4
         RETURNING quantity`,
        [change, companyId, data.product_id, data.warehouse_id]
      );

      newQuantity = Number(updatedStockResult.rows[0].quantity);
    } else {
      const insertedStockResult = await client.query(
        `INSERT INTO warehouse_stocks
           (company_id, product_id, warehouse_id, quantity)
         VALUES ($1, $2, $3, $4)
         RETURNING quantity`,
        [companyId, data.product_id, data.warehouse_id, change]
      );

      newQuantity = Number(insertedStockResult.rows[0].quantity);
    }

    const movementResult = await client.query(
      `INSERT INTO stock_movements
         (company_id, product_id, warehouse_id, type, quantity, description, movement_date)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_TIMESTAMP))
       RETURNING *`,
      [
        companyId,
        data.product_id,
        data.warehouse_id,
        data.type,
        quantity,
        data.description || null,
        data.movement_date || null,
      ]
    );

    await client.query('COMMIT');

    return {
      ...movementResult.rows[0],
      current_stock: newQuantity,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

const { buildMeta } = require('../../utils/pagination');

async function listStockMovements(companyId, filters) {
  const conditions = ['sm.company_id = $1'];
  const params = [companyId];

  if (filters.product_id) {
    params.push(filters.product_id);
    conditions.push(`sm.product_id = $${params.length}`);
  }

  if (filters.warehouse_id) {
    params.push(filters.warehouse_id);
    conditions.push(`sm.warehouse_id = $${params.length}`);
  }

  if (filters.type) {
    params.push(filters.type);
    conditions.push(`sm.type = $${params.length}`);
  }

  if (filters.from_date) {
    params.push(filters.from_date);
    conditions.push(`sm.movement_date >= $${params.length}`);
  }

  if (filters.to_date) {
    params.push(filters.to_date);
    conditions.push(`sm.movement_date <= $${params.length}`);
  }

  const whereClause = conditions.join(' AND ');

  const dataResult = await pool.query(
    `SELECT
       sm.*,
       p.name AS product_name,
       p.code AS product_code,
       w.name AS warehouse_name
     FROM stock_movements sm
     JOIN products p
       ON p.id = sm.product_id
      AND p.company_id = sm.company_id
     JOIN warehouses w
       ON w.id = sm.warehouse_id
      AND w.company_id = sm.company_id
     WHERE ${whereClause}
     ORDER BY sm.movement_date DESC, sm.id DESC
     LIMIT $${params.length + 1}
     OFFSET $${params.length + 2}`,
    [...params, filters.limit, filters.offset]
  );

  const countResult = await pool.query(
    `SELECT COUNT(*)
     FROM stock_movements sm
     WHERE ${whereClause}`,
    params
  );

  const total = Number(countResult.rows[0].count);

  return {
    data: dataResult.rows,
    meta: buildMeta(total, filters.page, filters.limit),
  };
}

async function listWarehouseStocks(companyId, filters) {
  const conditions = [
    'ws.company_id = $1',
    'p.company_id = $1',
    'w.company_id = $1',
  ];

  const params = [companyId];

  if (filters.product_id) {
    params.push(filters.product_id);
    conditions.push(`ws.product_id = $${params.length}`);
  }

  if (filters.warehouse_id) {
    params.push(filters.warehouse_id);
    conditions.push(`ws.warehouse_id = $${params.length}`);
  }

  if (filters.critical_only === 'true') {
    conditions.push('ws.quantity <= p.critical_stock');
  }

  const whereClause = conditions.join(' AND ');

  const dataResult = await pool.query(
    `SELECT
       ws.id,
       ws.product_id,
       ws.warehouse_id,
       ws.quantity,
       ws.updated_at,
       p.code AS product_code,
       p.name AS product_name,
       p.unit,
       p.critical_stock,
       p.status AS product_status,
       w.name AS warehouse_name
     FROM warehouse_stocks ws
     JOIN products p
       ON p.id = ws.product_id
      AND p.company_id = ws.company_id
     JOIN warehouses w
       ON w.id = ws.warehouse_id
      AND w.company_id = ws.company_id
     WHERE ${whereClause}
     ORDER BY p.name ASC, w.name ASC
     LIMIT $${params.length + 1}
     OFFSET $${params.length + 2}`,
    [...params, filters.limit, filters.offset]
  );

  const countResult = await pool.query(
    `SELECT COUNT(*)
     FROM warehouse_stocks ws
     JOIN products p
       ON p.id = ws.product_id
      AND p.company_id = ws.company_id
     JOIN warehouses w
       ON w.id = ws.warehouse_id
      AND w.company_id = ws.company_id
     WHERE ${whereClause}`,
    params
  );

  const total = Number(countResult.rows[0].count);

  return {
    data: dataResult.rows,
    meta: buildMeta(total, filters.page, filters.limit),
  };
}

module.exports = { 
  createStockMovement,
  listStockMovements,
  listWarehouseStocks,
 };

/*

pool: Projenin tek PostgreSQL bağlantı havuzu. Yeni bağlantı ayarı yazmıyoruz; mevcut db.js kullanılıyor.

createHttpError: Mesajı ve HTTP durum kodunu birlikte taşıyan hata üretir. Controller bu hatayı merkezi errorHandlera gönderir.

client = await pool.connect(): Stok güncellemesi boyunca tek veritabanı bağlantısı alır.

BEGIN: Transaction başlatır. Aşağıdaki iki işlem tek paket sayılır:
1. Depodaki güncel stok miktarını değiştirir.
2. Stok hareketi geçmişine kayıt ekler.
İkisinden biri başarısız olursa hiçbirinin kaydedilmemesi gerekir.

Ürün sorgusundaki company_id = $2: Başka şirkete ait ürünle hareket yapılmasını engeller.

FOR UPDATE: Aynı ürün için iki kişi eşzamanlı stok çıkışı yaparsa satırı kilitler. Böylece iki işlem de aynı eski stok miktarını görüp eksi stok oluşturamaz.

product.status !== 'active': Pasif ürün için hareket oluşturulmasını engeller.

Depo sorgusu da aynı şekilde şirket kontrolü yapar.

warehouse_stocks: Belirli bir ürünün belirli depodaki anlık miktarını tutar.

currentQuantity: O depoda bu ürün için stok satırı yoksa stok miktarını 0 kabul eder.

data.type === 'out': Çıkış işleminde stok yetersizse hata üretir. Başka depodaki stok hiç hesaba katılmaz.

change: Giriş için pozitif, çıkış için negatif miktar üretir.

Stok kaydı varsa UPDATE; yoksa INSERT çalışır.

stock_movements tablosuna her işlem ayrıca eklenir. Bu geçmiş kaydı sonradan değiştirilmez veya silinmez.

COMMIT: Her şey başarılıysa transaction’ı kalıcı kaydeder.

ROLLBACK: Hata varsa yapılan stok değişimini ve hareket kaydını geri alır.

finally: Hata olsa da olmasa da bağlantıyı havuza geri verir.

module.exports: Controller’ın service.createStockMovement(...) çağrısının çalışmasını sağlar.

*/