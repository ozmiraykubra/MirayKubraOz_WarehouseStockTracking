# Depo ve Stok Takip Sistemi - Database Tasarımı

Bu doküman, projedeki migration dosyalarına göre tabloları ve Primary Key (PK) / Foreign Key (FK) ilişkilerini gösterir.

## 1. companies

Şirketlerin tutulduğu ana tablodur.

| Kolon | Tip | Anahtar / Kısıt | Açıklama |
|---|---|---|---|
| id | integer | **PK** | Şirketin benzersiz kimliği |
| name | varchar(255) | NOT NULL | Şirket adı |
| slug | varchar(100) | UNIQUE, NOT NULL | Şirket için benzersiz slug |
| created_at | timestamp | NOT NULL | Oluşturulma tarihi |

---

## 2. users

Kullanıcıların hangi şirkete ait olduğunu tutar.

| Kolon | Tip | Anahtar / Kısıt | Açıklama |
|---|---|---|---|
| id | integer | **PK** | Kullanıcının benzersiz kimliği |
| company_id | integer | **FK → companies.id**, NOT NULL | Kullanıcının bağlı olduğu şirket |
| email | varchar(255) | NOT NULL | Kullanıcı e-postası |
| password_hash | varchar(255) | NOT NULL | Hashlenmiş şifre |
| role | varchar(50) | NOT NULL | Kullanıcı rolü |
| created_at | timestamp | NOT NULL | Oluşturulma tarihi |

**İlişki:** `users.company_id → companies.id`

---

## 3. categories

Ürün kategorilerini tutar.

| Kolon | Tip | Anahtar / Kısıt | Açıklama |
|---|---|---|---|
| id | integer | **PK** | Kategorinin benzersiz kimliği |
| company_id | integer | **FK → companies.id**, NOT NULL | Kategorinin ait olduğu şirket |
| name | varchar(255) | NOT NULL | Kategori adı |
| created_at | timestamp | NOT NULL | Oluşturulma tarihi |
| updated_at | timestamp | NOT NULL | Güncellenme tarihi |

**İlişki:** `categories.company_id → companies.id`

---

## 4. warehouses

Depoları tutar.

| Kolon | Tip | Anahtar / Kısıt | Açıklama |
|---|---|---|---|
| id | integer | **PK** | Deponun benzersiz kimliği |
| company_id | integer | **FK → companies.id**, NOT NULL | Deponun ait olduğu şirket |
| name | varchar(255) | NOT NULL | Depo adı |
| address | text | - | Depo adresi |
| created_at | timestamp | NOT NULL | Oluşturulma tarihi |
| updated_at | timestamp | NOT NULL | Güncellenme tarihi |

**İlişki:** `warehouses.company_id → companies.id`

---

## 5. products

Ürünleri tutar.

| Kolon | Tip | Anahtar / Kısıt | Açıklama |
|---|---|---|---|
| id | integer | **PK** | Ürünün benzersiz kimliği |
| company_id | integer | **FK → companies.id**, NOT NULL | Ürünün ait olduğu şirket |
| category_id | integer | **FK → categories.id**, NOT NULL | Ürünün kategorisi |
| code | varchar(100) | NOT NULL | Ürün kodu |
| name | varchar(255) | NOT NULL | Ürün adı |
| unit | varchar(50) | NOT NULL | Ürün birimi |
| critical_stock | integer | NOT NULL, DEFAULT 0 | Kritik stok seviyesi |
| status | varchar(50) | NOT NULL, DEFAULT 'active' | Ürün durumu |
| created_at | timestamp | NOT NULL | Oluşturulma tarihi |
| updated_at | timestamp | NOT NULL | Güncellenme tarihi |

**İlişkiler:**
- `products.company_id → companies.id`
- `products.category_id → categories.id`

Aynı şirket içinde `code` tekrarlanamaz: `UNIQUE(company_id, code)`

---

## 6. warehouse_stocks

Bir ürünün belirli bir depodaki güncel stok miktarını tutar.

| Kolon | Tip | Anahtar / Kısıt | Açıklama |
|---|---|---|---|
| id | integer | **PK** | Stok kaydının benzersiz kimliği |
| company_id | integer | **FK → companies.id**, NOT NULL | Stok kaydının ait olduğu şirket |
| product_id | integer | **FK → products.id**, NOT NULL | Stoklanan ürün |
| warehouse_id | integer | **FK → warehouses.id**, NOT NULL | Ürünün bulunduğu depo |
| quantity | integer | NOT NULL, DEFAULT 0 | Güncel stok miktarı |
| updated_at | timestamp | NOT NULL | Son güncellenme tarihi |

**İlişkiler:**
- `warehouse_stocks.company_id → companies.id`
- `warehouse_stocks.product_id → products.id`
- `warehouse_stocks.warehouse_id → warehouses.id`

Aynı ürün aynı depoda yalnızca bir stok kaydına sahip olabilir:
`UNIQUE(product_id, warehouse_id)`

---

## 7. stock_movements

Stok giriş ve çıkışlarının geçmişini tutar.

| Kolon | Tip | Anahtar / Kısıt | Açıklama |
|---|---|---|---|
| id | integer | **PK** | Stok hareketinin benzersiz kimliği |
| company_id | integer | **FK → companies.id**, NOT NULL | Hareketin ait olduğu şirket |
| product_id | integer | **FK → products.id**, NOT NULL | Hareketin ürünü |
| warehouse_id | integer | **FK → warehouses.id**, NOT NULL | Hareketin gerçekleştiği depo |
| type | varchar(10) | NOT NULL | `in` veya `out` |
| quantity | integer | NOT NULL | Hareket miktarı |
| description | text | - | Kısa açıklama |
| movement_date | timestamp | NOT NULL | Hareket tarihi |
| created_at | timestamp | NOT NULL | Kaydın oluşturulma tarihi |

**İlişkiler:**
- `stock_movements.company_id → companies.id`
- `stock_movements.product_id → products.id`
- `stock_movements.warehouse_id → warehouses.id`

Stok hareketleri geçmiş kayıtları olduğu için uygulama kurallarına göre düzenlenmemeli veya silinmemelidir.

---

# Primary Key (PK) - Foreign Key (FK) İlişkileri

| Ana tablo | Primary Key | Bağlanan tablo | Foreign Key |
|---|---|---|---|
| companies | `id` | users | `company_id` |
| companies | `id` | categories | `company_id` |
| companies | `id` | warehouses | `company_id` |
| companies | `id` | products | `company_id` |
| categories | `id` | products | `category_id` |
| companies | `id` | warehouse_stocks | `company_id` |
| products | `id` | warehouse_stocks | `product_id` |
| warehouses | `id` | warehouse_stocks | `warehouse_id` |
| companies | `id` | stock_movements | `company_id` |
| products | `id` | stock_movements | `product_id` |
| warehouses | `id` | stock_movements | `warehouse_id` |

## İlişki özeti

```text
companies
   ├── users
   ├── categories
   │      └── products
   │             └── warehouse_stocks
   ├── warehouses
   ├── products
   ├── warehouse_stocks
   └── stock_movements
          ├── products
          └── warehouses
```

## company_id neden Foreign Key?

Örneğin:

```text
companies
+----+----------+
| id | name     |
+----+----------+
| 1  | ABC Ltd. |
| 2  | XYZ Ltd. |
+----+----------+

users
+----+------------+----------------+
| id | company_id | email          |
+----+------------+----------------+
| 1  | 1          | abc@test.com   |
| 2  | 2          | xyz@test.com   |
+----+------------+----------------+
```

Burada `companies.id` şirketin kendi tablosundaki **Primary Key**'dir.

`users.company_id` ise kullanıcının hangi şirkete ait olduğunu gösteren **Foreign Key**'dir.

Yani:

`users.company_id → companies.id`

Aynı mantık `categories`, `warehouses`, `products`, `warehouse_stocks` ve `stock_movements` tablolarındaki `company_id` alanları için de geçerlidir.
