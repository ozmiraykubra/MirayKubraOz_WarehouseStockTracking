const service = require('./service');
const { buildPagination } = require('../../utils/pagination');

async function create(req, res, next) {
  try {
    const movement = await service.createStockMovement(
      req.user.companyId,
      req.body
    );

    res.status(201).json(movement);
  } catch (error) {
    next(error);
  }
}


/*

async: Veritabanı işlemi zaman aldığı için fonksiyonun bekleyebilmesini sağlar.
req: İstekten gelen bilgiler. Örneğin req.body içindeki product_id, warehouse_id, type ve quantity.
res: İstemciye cevap göndermek için kullanılır.
next: Hata olursa merkezi hata yönetimine iletir.
try: Normal akışta çalışmasını istediğimiz kod bölümü.
service.createStockMovement(...): Asıl stok hareketini oluşturacak servis fonksiyonunu çağırır.
req.user.companyId: Giriş yapan kullanıcının şirket ID’si. Bu bilgi JWT’den gelir; kullanıcının başka şirketin ürün veya deposuyla işlem yapmasını önler.
req.body: Gönderilen JSON verisinin tamamı.
await: Servis fonksiyonu veritabanından sonuç dönene kadar bekler.
201: “Yeni kayıt başarıyla oluşturuldu” HTTP durum kodudur.
json(movement): Oluşturulan hareket kaydını kullanıcıya JSON biçiminde döner.
catch: Ürün bulunamazsa, stok yetersizse veya veritabanı hatası olursa hatayı yakalar.
next(error): Hatanın projedeki merkezi errorHandler middleware’ine gitmesini sağlar.

Bu fonksiyonun görevi:
- req.query: URL’deki filtreleri alır. Örneğin:
  ?product_id=1&type=in
- buildPagination(req.query): Sayfalama bilgilerini üretir.
- req.user.companyId: Sadece giriş yapan kullanıcının şirketine ait hareketler listelenir.
- service.listStockMovements(...): SQL sorgusunu çalıştıracak servis fonksiyonunu çağırır.
- res.json(result): Listeyi ve sayfalama bilgisini Postman’e döner.
- Controller’da SQL yok; route → controller → service kuralına uyuyoruz.

*/

async function list(req, res, next) {
  try {
    const { page, limit, offset } = buildPagination(req.query);

    const result = await service.listStockMovements(
      req.user.companyId,
      {
        product_id: req.query.product_id,
        warehouse_id: req.query.warehouse_id,
        type: req.query.type,
        from_date: req.query.from_date,
        to_date: req.query.to_date,
        page,
        limit,
        offset,
      }
    );

    res.json(result);
  } catch ( error ) {
    next(error);
  } 
}

async function listStocks(req, res, next) {
  try {
    const { page, limit , offset } = buildPagination(req.query);

    const result = await service.listWarehouseStocks(
      req.user.companyId,
      {
        product_id: req.query.product_id,
        warehouse_id: req.query.warehouse_id,
        critical_only: req.query.critical_only,
        page,
        limit,
        offset,
      }
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { 
  create, 
  list,
  listStocks,
};   //Bu, routes.js içindeki controller.create kullanımının çalışmasını sağlar.
