# Alanya İklim Risk Atlası · v13

Bu sürüm, v12 Heatwave katman güncellemesinin üzerine üç ayrı çift dilli bölüm ekler: **Şiddetli Yağış**, **Multi · Altyapı**, **Fırtınalar**. Yedi ana bölümün tamamından diğerlerine erişilir. Mobilde sekmeler iki satırda görünür.

## Korunan içerik

- Heatwave'in özgün zaman serileri, beş sınıflı CLIMAAX lejantı, 30 m risk rasteri ve 79.312 Overture bina izi korunur.
- Flood, Drought ve Wildfire sayısal sonuçları, haritaları ve özgün kaynakları değiştirilmez.
- Önceki dört bölümde yalnız giriş HTML dosyaları yeni gezinme bağlantıları için güncellenir. Analiz kodları ve sayısal dosyaları değişmez.

## Yeni bölümler

### Şiddetli Yağış

- 24 özgün yaklaşık 12 km iklim hücresinde 3 / 24 saat yağış; T2–T500, referans 1976–2005 ve RCP4.5 / RCP8.5 2041–2070.
- Model topluluğu medyanı, üç modelin aralığı ve referansa göre değişim; özgün hücreye tıklayarak inceleme ve tekerrür eğrileri.
- Yalnız T100 için altı durumun 30 m arazi tabanlı dört sınıflı tarama yüzeyi ve 27.960 bina izi. Binalar 15. yakınlaştırma düzeyinden itibaren görünür alana göre yüklenir.
- 102 analiz mahallesinde kullanım grubuna göre sayılar/oranlar. 3.285 konut etiketli iz, 12.654 kullanımı belirsiz iz ve 12.021 diğer kullanım ayrıdır. Konut kaydı olmayan 64 mahalle gri/veri yok olarak gösterilir.
- Tarama, su basma sınırı/derinliği veya hasar değildir. 30 m ayrıntı araziye aittir; iklim çözünürlüğünü artırmaz. İki bina arazi örneği değerlendirilemez; sekiz bina mahalleye atanamamıştır. Atanamayanlar kaynak tablolarında ve ilçe toplamlarında korunur.

### Multi · Altyapı

- 289 tesis, 14.975 yol parçası, 3.014,939 km kayıtlı yol ekseni; GZP havalimanı ve açıkça belirtilen harici bağlantı koridoru.
- Tesis türü seçimi, isteğe bağlı yollar; 2025 yazı Landsat yüzey sıcaklığı, yerel ısı fazlası, NDVI/NDBI, iklim geçmişi ve DSM arazi/akarsu yakınlığı.
- Meteorolojik profiller 1991–2025 dönemindedir; 1991–2020 ile 2015–2025 dönemleri örtüşür. Gelecek senaryosu veya istasyon bias düzeltmesi yoktur.
- Yüzey sıcaklığı hava sıcaklığı değildir. NDVI gölge yüzdesi, TPI su derinliği değildir. İşletme arızası, bileşik risk veya parasal kayıp türetilmez.

### Fırtınalar

- `T100_pattern_19800327T10` ile ilişkilendirilen paylaşılan senaryo özetleri; eşiklere göre bina/yol maruziyeti. 32,7 m/s eşiğinde 1.455 bina ve 378,673 km yol.
- Mekânsal rüzgâr rasteri, bina başına hız, tam hesaplama kaydı ve tekerrür uyarlaması üstverisi yoktur. Harita envanter bağlamını gösterir; bu toplamlardan mekânsal hız alanı üretilmez.
- MGM 17310: 1995–2025, 10.851 kayıtlı günlük maksimum; 472 eksik takvim günü ve 23 tam yıl. Eksik yıllar sarı gösterilir. Sensör yüksekliği, hamle ortalama süresi ve gün sınırı doğrulanmamıştır.
- 27.960 bina yüksekliği hazırlık denetimi: 221 doğrulanmamış OSM beyanı, 1.499 kat × 3 m tahmini, 26.240 bilinmeyen. Eksikler doldurulmaz. WindNinja/OpenFOAM sonucu veya ölçülmüş yükseklik yoktur.
- Kaynak GIS'teki 6.538 yol geometrisi ile paylaşılan senaryodaki 39.026 analiz parçası farklı parçalara ayırma temelleridir.

## Dil ve kaynaklar

Arayüz, göstergeler, grafikler, açıklamalar, yöntem ve eksik değer durumları Türkçe/İngilizcedir. Özgün kimlikler ve kaynak alan kodları korunur. Şiddetli Yağış kaynak görsellerinin TR/EN eşleri kullanılır. Multi/Fırtına özgün görsel etiketleri kaynak dilindedir; bu durum görsel açıklamasında belirtilir, etkileşimli grafikler çift dillidir.

Seçilen özgün CSV/JSON dosyaları ve coğrafi arşiv girdileri bayt düzeyinde korunmuştur. Her bölümün indirme alanında SHA-256 kayıtları vardır. Web gösteriminde bina koordinatları yedi ondalığa yuvarlanır; yol çizgileri topoloji korunarak 3 m sadeleştirilir. Kaynak sayısal uzunluklar değiştirilmez. Rasterler kesin ters eşleme/en yakın komşu ile gösterilir. Görseller tarayıcı için boyutlandırılmış WebP kopyalardır.

## Kurulum

1. v12 kurulu mevcut deponuzda çalışın.
2. Güncelleme ZIP'ini açın. `alanya-heatwave-atlas` klasörünün **içeriğini** mevcut depo köküne kopyalayın; aynı dosyaları değiştirin, klasörleri birleştirin. Eski klasörleri silmeyin.
3. GitHub Desktop: değişiklikleri inceleyin, **Commit to main → Push origin**.
4. GitHub Pages yayını tamamlanınca **Ctrl+F5** ile yenileyin.

Bu paket v12 üzerine güncellemedir; boş bir depo için tam site paketi değildir. Yayınlama işlemi bu paketle otomatik yapılmaz. Kaynak modeller yeniden çalıştırılmamıştır.
