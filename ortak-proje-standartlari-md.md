
### Klasör Yapısı (zorunlu standart)

```
/proje-adi
  /migrations          → node-pg-migrate migration dosyaları
  /src
    /config
      db.js            → pg connection pool
      env.js           → dotenv config + env validasyonu
    /middlewares
      auth.js          → JWT doğrulama + company scope
      validate.js       → express-validator hata handler
      errorHandler.js   → merkezi hata yönetimi
    /modules
      /auth
        routes.js
        controller.js
        service.js
        validators.js
      /<domain-adi>      → her modül için aynı 4 dosya yapısı >>örn: /customers klasörü ve altında kendi route, controller, service ve validator dosyaları
    /utils
      pagination.js      → ortak pagination/sort/filter helper
    app.js               → express app, middleware bağlama
    server.js            → app.listen
  .env.example
  .gitignore
  package.json
```

Katman kuralı: **route → controller → service**. Route dosyasında sadece path + middleware tanımı olur, controller HTTP request/response ile ilgilenir, service DB sorgusu ve business logic içerir. SQL sorgusu asla controller'da yazılmaz.

---

## 1. Kullanılacak Paketler (paket yöneticisi: NPM)

app gereklilikleri: express pg dotenv express-validator jsonwebtoken bcrypt cors
development gereklilikleri: nodemon node-pg-migrate


Aşağıda her paketin ne için kullanılacağı ve temel kullanım detayları var.


### 1.1 `pg` (node-postgres)
Veritabanı bağlantısı için. **Tek bir pool** oluşturulup her yerden import edilecek, her sorguda yeni client açılmayacak.

```js
// src/config/db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
```

Sorgu kullanımı (service katmanında):

```js
const pool = require('../../config/db');

async function getCustomerById(companyId, customerId) {
  const result = await pool.query(
    'SELECT * FROM customers WHERE id = $1 AND company_id = $2',
    [customerId, companyId]
  );
  return result.rows[0];
}
```

**Kurallar:**
- Sorgular her zaman parametreli (`$1, $2, ...`) yazılacak. String concat / template literal ile SQL birleştirmek **yasak** (SQL injection riski).
- `company_id` filtresi olmayan hiçbir SELECT/UPDATE/DELETE sorgusu yazılmayacak.

### 1.2 `dotenv`
Ortam değişkenlerini `.env` dosyasından okumak için.

```js
// src/config/env.js
require('dotenv').config();

const required = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Eksik environment variable: ${key}`);
  }
});
```

Bu dosya `server.js`'in en başında import edilecek. `.env` dosyası **asla** commit edilmeyecek (`.gitignore`'a eklenmeli), onun yerine `.env.example` commit edilecek:

```
# .env.example
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/proje_db
JWT_SECRET=degistirin-bu-degeri
JWT_EXPIRES_IN=1d
```

### 1.3 `express-validator`
Her POST/PUT/PATCH endpoint'inde request body/query/params validasyonu için kullanılacak.

```js
// src/modules/customers/validators.js
const { body } = require('express-validator');

exports.createCustomerRules = [
  body('name').isString().trim().notEmpty().withMessage('İsim zorunlu'),
  body('sector').optional().isString(),
  body('city').optional().isString(),
];
```

Ortak hata handler middleware:

```js
// src/middlewares/validate.js
const { validationResult } = require('express-validator');

module.exports = function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};
```

Route içinde kullanımı:

```js
const { createCustomerRules } = require('./validators');
const handleValidationErrors = require('../../middlewares/validate');

router.post('/', createCustomerRules, handleValidationErrors, controller.create);
```

**Kural:** Validasyon kuralları her zaman ayrı `validators.js` dosyasında tutulur, route dosyasına gömülmez.

### 1.4 `jsonwebtoken`
JWT üretimi ve doğrulaması için.

```js
// login sırasında token üretimi
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: user.id, companyId: user.company_id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);
```

Auth middleware:

```js
// src/middlewares/auth.js
const jwt = require('jsonwebtoken');

module.exports = function authenticate(req, res, next) {
  // bir şekilde gelen istek headerinden token alınmalı
  if (!header) return res.status(401).json({ message: 'Token bulunamadı' });

  const token = header.split(' ')[1];
  try {
    // token valide edilmeli

    // sonra isteğe kullanıcı bilgisi eklenir
    req.user = { id: payload.userId, companyId: payload.companyId, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
  }
};
```

**Kural:** JWT payload'ı içinde mutlaka `companyId` bulunacak. Tüm servis fonksiyonları `req.user.companyId`'yi parametre olarak alacak.

### 1.5 `bcrypt`
Şifre hashleme için.

```js
const bcrypt = require('bcrypt');

const passwordHash = await bcrypt.hash(plainPassword, 10);
const isValid = await bcrypt.compare(plainPassword, user.password_hash);
```

Şifreler asla plain text olarak DB'ye yazılmayacak veya loglanmayacak.


### 1.6 `nodemon` (dev dependency)
Geliştirme sırasında dosya değişiminde server'ı otomatik yeniden başlatmak için.

```json
// package.json
"scripts": {
  "dev": "nodemon src/server.js",
  "start": "node src/server.js"
}
```

### 1.7 `node-pg-migrate`
Veritabanı şema yönetimi (migration) için. Detaylı kullanım bölüm 2'te.

---

## 2. Migration Kullanımı (node-pg-migrate)

### Neden gerekli?
Tabloları elle `psql` üzerinden oluşturursanız:
- Takım arkadaşlarınızın local DB'si sizinkiyle senkron kalmaz
- Kimin ne zaman hangi şema değişikliğini yaptığı kaybolur
- Review edilebilir bir "şema geçmişi" olmaz

Bu yüzden **her tablo oluşturma/değiştirme işlemi migration dosyası ile yapılacak**, elle `CREATE TABLE` yazmak yasak.

### Kurulum ve Config

`package.json`'a script ekleyin(yoksa):

```json
"scripts": {
  "migrate:create": "node-pg-migrate create",
  "migrate:up": "node-pg-migrate up",
  "migrate:down": "node-pg-migrate down"
}
```

`node-pg-migrate`, `.env` dosyasındaki `DATABASE_URL`'i otomatik okur (dotenv'in yüklenmiş olması yeterli — ekstra config dosyası gerekmez, ama komutu çalıştırırken proje kökünde `.env` olmalı).

### Yeni migration oluşturma

Örneğin:
```bash
npm run migrate:create -- create-customers-table
```

Bu komut `/migrations` klasöründe otomatik timestamp'li bir dosya oluşturur: `1721470100000_create-customers-table.js`

### Migration dosyası örneği

```js
exports.up = (pgm) => {
  pgm.createTable('customers', {
    id: 'id',
    company_id: {
      type: 'integer',
      notNull: true,
      references: 'companies',
      onDelete: 'cascade',
    },
    name: { type: 'varchar(255)', notNull: true },
    sector: { type: 'varchar(100)' },
    city: { type: 'varchar(100)' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('customers');
};
```

**Kurallar:**
- Her migration **tek bir sorumluluk** taşır (bir tabloyu ya da birbirine sıkı bağlı 1-2 tabloyu oluşturur). "Her şeyi tek dosyada yap" değil.
- `down` fonksiyonu **her zaman** yazılır, boş bırakılmaz (rollback çalışabilir olmalı).
- **Merge edilmiş bir migration dosyası asla düzenlenmez.** Hata varsa yeni bir migration ile `ALTER TABLE` yapılır. Var olan dosyayı geri gidip değiştirmek, o migration'ı zaten çalıştırmış olan takım arkadaşlarının local DB'sini senkron dışı bırakır.

### Migration çalıştırma

```bash
npm run migrate:up      # bekleyen tüm migration'ları uygular
npm run migrate:down    # son migration'ı geri alır
```

Branch değiştirdiğinizde (özellikle başka birinin yeni migration eklediği bir branch'e geçtiğinizde) `npm run migrate:up` çalıştırmayı unutmayın — local DB'niz güncel schema ile senkron kalsın.

### Workflow sırası

1. Herkes kendi feature branch'ini güncel `main`'den açar.
2. Her kişi kendi modülüne ait tabloyu **kendi branch'inde yeni bir migration dosyası olarak** ekler (örn. `feature/customer-module` → `create-customers-and-contacts` migration'ı).
3. PR'lar sırayla review edilip merge edilir; merge sonrası herkes `migrate:up` çalıştırır.

---

## 3. Multitenancy (Company Katmanı) Kuralları

Tüm sistemler multitenant çalışacak: birden fazla şirket aynı veritabanını paylaşacak ama birbirinin verisini göremeyecek.

**Kurallar:**
- En tepede bir `companies` tablosu olacak. Diğer tüm domain tabloları (`customers`, `projects`, `employees` vb.) `company_id` foreign key'i taşıyacak.
- Kayıt akışı: yeni şirket + ilk admin kullanıcı birlikte oluşturulur (transaction içinde), ya da mevcut şirkete kullanıcı eklenir.
- **Auth middleware'den geçen her request'te `req.user.companyId` set edilir**, servis fonksiyonları bu değeri parametre olarak alır ve her sorguda `WHERE company_id = $x` filtresi zorunludur.
- İlişkili kayıt oluştururken de (örn. bir `task`'ı bir `project`'e bağlarken), o `project`'in gerçekten `req.user.companyId`'ye ait olduğu kontrol edilir — sadece foreign key'in var olması yetmez, tenant'a ait olması da doğrulanmalı.
- Bu kontrolü her yerde tekrar tekrar yazmamak için, service katmanındaki her fonksiyon `companyId`'yi ilk parametre olarak almayı standart haline getirsin:

```js
async function getProjectById(companyId, projectId) { ... }
async function createTask(companyId, projectId, data) { ... }
```

---

## 4. Ortak Liste Endpoint Standardı (Filter / Sort / Pagination)

Tüm listeleme endpoint'leri aynı query parametre formatını kullanacak:

```
GET /api/customers?sector=Teknoloji&sort=name:asc&page=1&limit=20
```

### Response formatı

```json
{
  "data": [ ... ],
  "meta": {
    "total": 57,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### Ortak helper örneği

```js
// src/utils/pagination.js
function buildPagination(query) {
  // queryden gelen değerlere göre page, ofset, limit değerlerini ayıklayan bir method olabilir
}

function buildSort(query, allowedColumns, defaultSort = 'id:asc') {
  // izin verilen kolonlar üzerinde query'den gelen değerleri baz alarak sort configi ayıklayan bit method olabilir
}

module.exports = { buildPagination, buildSort };
```

**Kurallar:**
- Sort kolonu her zaman bir **whitelist** ile kontrol edilir (kullanıcıdan gelen `sort` değeri doğrudan SQL'e gömülmez, SQL injection'a açık kapı bırakılmaz).
- Filter parametreleri de validasyon katmanından geçer (örn. `status` bir enum ise, sadece izin verilen değerler kabul edilir).
- `total`/`totalPages` hesaplaması için ayrı bir `COUNT(*)` sorgusu (aynı filtrelerle, `LIMIT/OFFSET` olmadan) atılır.

---

## 5. Hata Yönetimi

Merkezi bir error handler middleware olacak, her controller kendi try/catch'ini tekrar yazmak yerine `next(err)` ile hatayı buraya devredecek.

```js
// src/middlewares/errorHandler.js
module.exports = function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Sunucu hatası' });
};
```

Controller örneği:

```js
exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await service.getCustomerById(req.user.companyId, req.params.id);
    if (!customer) return res.status(404).json({ message: 'Müşteri bulunamadı' });
    res.json(customer);
  } catch (err) {
    next(err);
  }
};
```

---

## 6. Git Kullanımı

- `main` branch korumalı, doğrudan push yasak.
- Her modül/kişi kendi feature branch'inde çalışır: `feature/<modul-adi>` (örn. `feature/deal-module`, `feature/auth`).
- Her iş bitiminde PR açılır, review + onay olmadan merge edilmez.
- Commit mesajları anlamlı yazılır: `feat: add pagination to deals endpoint`, `fix: company scope missing in task update`.
- Merge conflict'leri (özellikle `routes.js`, migration dosyaları gibi ortak dosyalarda) gerçek senaryoda burada karşılaşacaksınız — aşama 7'de öğrendiğiniz conflict resolution'ı burada pratik edeceksiniz.

---

## 7. Postman ile Test

Her modül için ayrı bir Postman collection/klasörü oluşturulacak, bitirilen her endpoint (happy path + en az bir hata senaryosu, örn. yetkisiz erişim ya da validasyon hatası) test edilip collection'a eklenecek. PR açarken collection linki/export dosyası da paylaşılacak.

---

## Özet Checklist (PR açmadan önce kontrol edin)

- [ ] Tüm sorgular parametreli mi, `company_id` filtresi var mı?
- [ ] POST/PUT/PATCH route'larında express-validator kuralları var mı?
- [ ] Liste endpoint'i filter/sort/pagination destekliyor mu, sort whitelist kontrolü var mı?
- [ ] Hatalar merkezi error handler'a düşüyor mu?
- [ ] `.env` commit edilmemiş, `.env.example` güncel mi?
- [ ] Migration `up`/`down` içeriyor mu, merge olmuş migration'a dokunulmamış mı?
- [ ] Postman'de test edilmiş mi?
