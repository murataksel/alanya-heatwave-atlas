# Alanya İklim Risk Atlası — v11 FINAL

23 Ekim 2026 · Türkçe / English

## Dört tehlike için iki dilli atlas

Sıcak Hava Dalgaları, Taşkınlar, Kuraklık ve Orman Yangınları ortak menü ve İngilizce/Türkçe seçici kullanır. Dil tercihi bölüm geçişlerinde ve gömülü harita/grafiklerde korunur.

Sıcak hava dalgası bölümü diğer tehlikelerle aynı çalışma düzenindedir. 102 mahalle geometrisi, 33.660 yıllık sıcak hava dalgası kaynak değeri ve mevcut tematik raster pikselleri korunmuştur.

Menüler, yöntem notları, açıklama kutuları, harita sorguları, grafik etiketleri ve görsel açıklamaları seçilen dili izler. 101 kuraklık, yangın ve taşkın grafiği için Türkçe SVG karşılıkları vardır. Yeniden üretilebilirlik için özgün dışa aktarımlar, model kimlikleri ve ham CSV alan adları korunur.

Dar ekranda eski sabit menü yüksekliği kaldırılmıştır. Dört tehlike bağlantısı ve dil seçimi görünür kalır. Taşkın haritaları sağlanan coğrafi altlıkla açılır; çevrim içi sokak altlığı kullanıcı tarafından etkinleştirilebilir.

## Tam final paketini yükleme

Bu final sürümünde dört giriş sayfasını ve ortak dil dosyalarını birlikte güncellemek için tam ZIP önerilir. Yalnızca güncelleme ZIP’i mevcut v10 kurulumu içindir. Tek paket kullanın; ikisi birden gerekli değildir.

GitHub Desktop’ta mevcut alanya-heatwave-atlas deposunu seçin. Repository → Show in Explorer / Finder ile gerçek çalışma klasörünü açın. Dosyaları değiştirmeden önce bir yedek alın.

ZIP’i başka bir yerde çıkarın. İçindeki alanya-heatwave-atlas klasörünü açıp içeriğini mevcut depo klasörüne kopyalayın. Aynı adlı dosyaları değiştirin, klasörleri birleştirin. Deponun içinde ikinci bir alanya-heatwave-atlas klasörü oluşturmayın ve depo üst verilerini silmeyin.

Depo kökünde index.html, guide.html, assets, charts, data, floods, drought, wildfires ve heatwaves bulunmalıdır. GitHub Desktop’ta Changes listesini inceleyin, Final bilingual atlas v11 gibi bir özet yazın; ardından Commit to main ve Push origin adımlarını uygulayın.

GitHub Pages yayını tamamlandığında Windows’ta Ctrl+F5, macOS’ta Cmd+Shift+R ile yenileyin. Her tehlike sayfasında v11 FINAL, dört tehlike bağlantısı ve EN/TR görünmelidir. Taşkınlar hâlâ iki bağlantı gösteriyorsa eski floods/index.html sunuluyor veya yanlış klasör güncellenmiş demektir.

## Yerel görüntüleme ve hızlı kontrol

Tam yerel önizleme için index.html bulunan klasörde python -m http.server 8000 çalıştırın ve http://localhost:8000/ adresini açın. Klasör yapısını koruyun. Görüntüleme sırasında not defteri veya coğrafi sunucu gerekmez.

Taşkınlar sayfasından dört tehlike arasında geçiş yapın. EN/TR’yi değiştirin, bir harita hücresini sorgulayın, grafik açın ve sıcak hava dalgasında mahalle seçin. Dil değişimi seçili senaryoyu ve mahalleyi korumalıdır. Sokak altlıkları isteğe bağlıdır ve internet gerektirir.

## Bilimsel kapsam ve izlenebilirlik

Bu final sürümü iklim veya etki modeli sonuçlarını değil, sunumu ve dili değiştirir. Kuraklık, devralınan yöntem denetiminin sınırlamalarını; yangın RF deneyleri başarısız veya mevcut olmayan doğrulama durumunu korur. FWI meteorolojik aşımı, tutuşma, hasar, can kaybı veya kesinti olasılığı değildir.

Kuraklık/yangına ait 85 Türkçe görselde bilimsel çizim yolları ve gömülü rasterler değiştirilmez; etiketler çevrilir. 16 Türkçe taşkın grafiği korunan kaynak hücre ve CSV tablolarından yeniden çizilir. Özgün İngilizce WebP grafikler korunur. Türetilen görseller sunum varlıklarıdır; yeni model çalışması değildir.

VALIDATION_V11.json sayısal korunum ve işlev kontrollerini kaydeder. TRANSLATED_FIGURES_V11.json çevrilmiş bilimsel görselleri listeler. Kaynak kayıtları ve değiştirilmemiş indirmeler ilgili tehlike klasörlerindedir. Yazılım kontrolleri bilimsel model doğrulaması anlamına gelmez.

