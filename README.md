# Backend Staj — Starter Proje

Bu proje, grup projeleri icin hazir bir backend iskeletidir. Klasorleme, multitenancy, JWT auth, validation, migration ve liste endpoint pattern'leri calisir halde gelir.

## İçindekiler

- `companies`, `users` ve `example_items` tablolarinin migration'lari
- Company slug bazli **register/login** akisi
- JWT auth middleware (`req.user = { id, companyId, role }`)
- `example_items` adinda ornek modul
- Ortak pagination/sort helper'lari

## Kurulum

```bash
npm install
cp .env.example .env
# .env içindeki DATABASE_URL'i kendi local PostgreSQL bilgilerinizle güncelleyin
```

`.env` icindeki `DATABASE_URL` degerini kendi local PostgreSQL bilgilerinizle guncelleyin. Sonra bos veritabanina migration'lari uygulayin:

```bash
npm run migrate:up
```

Bu komut `companies`, `users` ve `example_items` tablolarini olusturur.

Sunucuyu baslatin:

```bash
npm run dev
```

## Auth modeli

Bu starter'da tenant belirleme icin `companies.slug` kullanilir. Login sirasinda email tek basina yeterli degildir; `companySlug + email + password` birlikte kullanilir.

## Hizli Test

**1. Sirket + admin kaydi**

```bash
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"companyName\":\"Acme AS\",\"companySlug\":\"acme\",\"email\":\"admin@acme.com\",\"password\":\"123456\"}"
```

**2. Login**

```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"companySlug\":\"acme\",\"email\":\"admin@acme.com\",\"password\":\"123456\"}"
```

Donen `token` degerini kopyalayin.

**3. Auth gerektiren ornek endpoint**

```bash
curl -X POST http://localhost:3000/api/example-items ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer <TOKEN>" ^
  -d "{\"name\":\"Ornek kayit\"}"

curl "http://localhost:3000/api/example-items?status=active&sort=name:asc&page=1&limit=10" ^
  -H "Authorization: Bearer <TOKEN>"
```

## Kendi Modülünüzü Eklerken İzleyeceğiniz Adımlar

1. `feature/<modul-adi>` branch'i acin.
2. `npm run migrate:create -- create-customers-table` ile yeni migration dosyasi olusturun.
3. `src/modules/example` klasorunu referans alip kendi modul yapinizi olusturun.
4. Her domain tablosunda `company_id` foreign key oldugundan emin olun.
5. Service katmaninda her sorguya tenant filtresi ekleyin.
6. Yeni route'u `src/app.js` icine baglayin.

## Not

`example_items` modulu referans amaclidir. Paylasilan bir branch'e merge olmus migration dosyasini sonradan duzenlemeyin veya silmeyin; ornek modulu kaldirmak isterseniz bunu yeni bir migration ve normal kod degisikligi ile yapin.
