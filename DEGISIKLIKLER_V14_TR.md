# Alanya İklim Değişikliği Atlası v14.1 — Heatwave yükleme düzeltmesi

Bu paket v13 deposuna uygulanacak tam güncelleme paketidir. v14 ortak atlas değişikliklerinin yanı sıra yeni dördüncü Heatwave analizi için gereken v12 katman paketinin tamamını içerir. Dosyaları mevcut depoya, klasör yapısını koruyarak kopyalayın ve aynı adlı dosyaların üzerine yazın.

## Hata ve düzeltme

Yayınlanmış Heatwave sayfası `heatwaves/layers-v12/catalog.js` dosyasına başvuruyordu; ancak dosya yayındaki depoda bulunmuyordu. Isı analizi başlangıçta CLIMAAX risk katmanı tanımını okuyamayınca script duruyor, harita altlığı ve mahalle sınırları görünmesine rağmen analiz bölümü “Analiz yükleniyor…” durumunda kalıyordu. Bu sürüm katalog dosyasını, risk rasterini, üstveriyi, bina kutucuklarını ve özgün kaynak indirmelerini içerir. Katalog gelecekte eksik kalırsa sayfada açıklayıcı bir hata gösterilir.

## Paketteki v14 güncellemeleri

- Yedi tehlike sekmesinde ortak çift dilli **Alanya İklim Değişikliği Atlası / Alanya Climate Change Atlas** kimliği.
- Kıyı ve akarsu taşkını haritaları ile etkileşimli analiz haritalarında varsayılan OpenStreetMap altlığı.
- Heatwave altında dördüncü analiz: Kırılganlık ve binalar. Sağlanan kırılgan nüfus grid’i, bağımsız Overture bina izleri ve CLIMAAX beş sınıflı ısı riski rasteri/lejantı.
- Fırtına görünümlerinde bina ayrıntılarına erişim ve kaynaklarda mekânsal rüzgâr alanı olmadığına ilişkin açık açıklama.

## Doğrulama

Yayındaki katalog adresi kontrol edildi ve GitHub Pages 404 yanıtı verdi; tarayıcı konsolunda Heatwave başlangıç kodunun tanımsız `risk` nesnesine eriştiği görüldü. Düzeltilmiş arşivde katalog, risk rasteri, bina kutucukları ve özgün indirme dosyalarının bulunduğu doğrulandı. JavaScript sözdizimi kontrolleri geçti. Kaynak tehlike sonuçları yeniden hesaplanmadı.
