/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1. Ürün Kategorileri Tablosu
  pgm.createTable('categories', {
    id: 'id',
    company_id: { type: 'integer', notNull: true, references: 'companies', onDelete: 'CASCADE' },
    name: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // 2. Depolar Tablosu
  pgm.createTable('warehouses', {
    id: 'id',
    company_id: { type: 'integer', notNull: true, references: 'companies', onDelete: 'CASCADE' },
    name: { type: 'varchar(255)', notNull: true },
    address: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // 3. Ürünler Tablosu
  pgm.createTable('products', {
    id: 'id',
    company_id: { type: 'integer', notNull: true, references: 'companies', onDelete: 'CASCADE' },
    category_id: { type: 'integer', notNull: true, references: 'categories', onDelete: 'RESTRICT' },
    code: { type: 'varchar(100)', notNull: true },
    name: { type: 'varchar(255)', notNull: true },
    unit: { type: 'varchar(50)', notNull: true },
    critical_stock: { type: 'integer', notNull: true, default: 0 },
    status: { type: 'varchar(50)', notNull: true, default: 'active' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('products', 'products_company_code_unique', { unique: ['company_id', 'code'] });

  // 4. Depo Stok Miktarları Tablosu (Her depodaki anlık ürün stoku)
  pgm.createTable('warehouse_stocks', {
    id: 'id',
    company_id: { type: 'integer', notNull: true, references: 'companies', onDelete: 'CASCADE' },
    product_id: { type: 'integer', notNull: true, references: 'products', onDelete: 'CASCADE' },
    warehouse_id: { type: 'integer', notNull: true, references: 'warehouses', onDelete: 'CASCADE' },
    quantity: { type: 'integer', notNull: true, default: 0 },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('warehouse_stocks', 'warehouse_stocks_product_warehouse_unique', { unique: ['product_id', 'warehouse_id'] });

  // 5. Stok Hareketleri Geçmişi Tablosu (Salt okunur / Değiştirilemez)
  pgm.createTable('stock_movements', {
    id: 'id',
    company_id: { type: 'integer', notNull: true, references: 'companies', onDelete: 'CASCADE' },
    product_id: { type: 'integer', notNull: true, references: 'products', onDelete: 'RESTRICT' },
    warehouse_id: { type: 'integer', notNull: true, references: 'warehouses', onDelete: 'RESTRICT' },
    type: { type: 'varchar(10)', notNull: true }, // 'in' veya 'out'
    quantity: { type: 'integer', notNull: true },
    description: { type: 'text' },
    movement_date: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('stock_movements');
  pgm.dropTable('warehouse_stocks');
  pgm.dropTable('products');
  pgm.dropTable('warehouses');
  pgm.dropTable('categories');
};