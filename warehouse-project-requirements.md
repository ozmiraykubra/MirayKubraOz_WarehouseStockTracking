# Depo ve Stok Takip Sistemi

Bu proje, küçük bir işletmenin depolarındaki ürünleri ve ürün giriş-çıkışlarını takip edebilmesini sağlayan bir backend uygulamasıdır.

Teknik uygulama kuralları için `ortak-proje-standartlari-md.md` ve starter projenin mevcut yapısı esas alınmalıdır.


## Kavram açıklamaları

- **Ürün kategorisi:** Benzer ürünleri bir arada gruplamak için kullanılan sınıflandırmadır. Örneğin “İçecekler” veya “Ofis malzemeleri” birer kategoridir.
- **Depo:** Ürünlerin fiziksel olarak bulunduğu yerdir. Bir şirketin birden fazla deposu olabilir.
- **Depo stoğu:** Bir ürünün belirli bir depoda bulunan güncel miktarıdır. Aynı ürünün farklı depolardaki stok miktarları birbirinden bağımsızdır.
- **Stok hareketi:** Bir ürünü belirli bir depoda artıran veya azaltan her kayıttır.
- **Stok girişi:** Satın alma, iade alma veya sayım fazlası gibi nedenlerle bir depodaki ürün miktarının artmasıdır.
- **Stok çıkışı:** Satış, tüketim veya fire gibi nedenlerle bir depodaki ürün miktarının azalmasıdır.
- **Kritik stok seviyesi:** Ürünün yeniden tedarik edilmesi gerektiğini gösteren, işletmenin önceden belirlediği en düşük güvenli stok miktarıdır.


## Beklenen işlevler

- Depolar oluşturulabilmeli, düzenlenebilmeli ve listelenebilmelidir.
- Ürün kategorileri oluşturulabilmeli, düzenlenebilmeli ve listelenebilmelidir.
- Ürünler kaydedilebilmeli, düzenlenebilmeli ve bir kategoriyle ilişkilendirilebilmelidir.
- Her ürünün ürün kodu, adı, birimi ve kritik stok seviyesi tutulmalıdır.
- Ürünler aktif veya pasif duruma alınabilmelidir. Pasif ürünler geçmiş stok hareketleriyle birlikte görüntülenebilir kalmalı; ancak pasif ürün için yeni stok hareketi oluşturulmamalıdır.
- Bir ürün için, seçilen depoya stok girişi yapılabilmelidir. Girişin miktarı, tarihi ve kısa açıklaması kaydedilmelidir.
- Bir ürün için, seçilen depodan stok çıkışı yapılabilmelidir. Çıkışın miktarı, tarihi ve kısa açıklaması kaydedilmelidir.
- Stok çıkışı sonucunda ürünün o depodaki miktarı eksiye düşmemelidir. Başka depodaki ürün miktarı bu kontrol için kullanılamaz.
- Stok hareketleri geçmiş kaydı bozmamak için düzenlenememeli veya silinememelidir.
- Her ürünün her depodaki güncel stok miktarı görüntülenebilmelidir.
- Kritik stok seviyesine inmiş ürünler depo bazında ayrı olarak listelenebilmelidir.
- Ürünler, kategoriler, depolar ve stok hareketleri aranabilmeli, filtrelenebilmeli ve listelenebilmelidir.
- Bir şirketin depo ve stok verileri başka bir şirket tarafından görüntülenememeli veya değiştirilememelidir.


## Kabul senaryoları

- Bir ürün doğru kategoriyle ilişkilendirilerek oluşturulabilmelidir.
- Aynı ürün, farklı depolarda farklı stok miktarlarına sahip olabilmelidir.
- Yeni bir stok girişi, ürünün yalnızca seçilen depodaki stok miktarını artırmalıdır.
- Yeni bir stok çıkışı, ürünün yalnızca seçilen depodaki stok miktarını azaltmalıdır.
- Bir depoda elde olandan fazla miktarda stok çıkışı yapılmak istendiğinde işlem reddedilmelidir; başka depodaki stok miktarı bu işlemi mümkün kılmamalıdır.
- Pasif durumdaki bir ürün için yeni stok hareketi oluşturulamamalıdır.
- Kritik stok seviyesine inen ürünler depo bazında filtrelenebilmelidir.
- Farklı bir şirketin kullanıcısı, bu şirketin ürünlerine, kategorilerine, depolarına veya stok hareketlerine erişememelidir.
