// Query parametrelerinden page/limit/offset hesaplar.
// Kullanım: const { page, limit, offset } = buildPagination(req.query);
function buildPagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// Sort parametresini "kolon:yön" formatından güvenli SQL parçasına çevirir.
// allowedColumns ile whitelist kontrolü yapılır (SQL injection'a karşı zorunlu).
// Kullanım: const orderBy = buildSort(req.query, ['name', 'created_at'], 'created_at:desc');
function buildSort(query, allowedColumns, defaultSort) {
  const raw = query.sort || defaultSort;
  const [column, direction] = raw.split(':');

  if (!allowedColumns.includes(column)) {
    const err = new Error(`Geçersiz sort kolonu: '${column}'. İzin verilenler: ${allowedColumns.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const dir = (direction || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `${column} ${dir}`;
}

// Toplam kayıt sayısından meta objesi oluşturur (response'a eklenir).
function buildMeta(total, page, limit) {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
}

module.exports = { buildPagination, buildSort, buildMeta };
