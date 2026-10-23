# Alanya İklim Risk Atlası — v10

23 Ekim 2026 · Heatwaves + Floods + Drought + Wildfires

## Bu sürümde neler var?

Mevcut sıcak hava dalgası ve taşkın verileri, haritaları ve zaman serileri korunmuştur. Ortak menüye kuraklık ve orman yangınları eklenmiştir. Yeni bölümler İngilizce akademik sunum dilini izler.

Kuraklık bölümünde muz, narenciye ve avokado için 23 özgün iklim hücresi; verim azalması, sulama ihtiyacı, yağış, referans evapotranspirasyon, iklimsel su dengesi ve toprak su tutma kapasitesi görüntülenir. Üretim hücreleri ve ekonomik tarama ayrı ekranlardadır. Kaynak fiyatların %80, %100 ve %120 varsayımları seçilebilir.

Yangın bölümünde meteorolojik yangın tehlikesi (FWI), CMIP6 senaryoları, nüfus/altyapı maruziyeti, yerel kanıtlar ve deneysel makine öğrenmesi haritaları ayrı ekranlarda sunulur. Üç iklim modeli, iki SSP yolu ve dört dönem kullanılabilir. ECLIPS ve CHELSA deneyleri toplam 92 raster görünümü içerir. Kaynak hücreye tıklayarak özgün değer sorgulanabilir.

14 kuraklık ve 71 yangın kaynak grafiği, 92 değişmeden korunmuş CSV dosyası, özgün GeoTIFF/GeoPackage/SVG indirme paketleri, yöntem notları ve kaynak dosya özetleri eklenmiştir. Mahalle bazında desteklenmeyen yeni bir hesaplama yapılmamıştır.

## GitHub Desktop ile v9 üzerine yükleme

1. Mevcut deponuzun bir yedeğini alın. GitHub Desktop’ta `alanya-heatwave-atlas` deposunu seçin; **Repository → Show in Explorer / Finder** ile klasörünü açın.
2. `Alanya_Climate_Risk_Atlas_v10_UPDATE_ONLY.zip` dosyasını ayrı bir yere çıkarın. İçindeki `alanya-heatwave-atlas` klasörünü açın.
3. Bu klasörün **içindekileri** mevcut depo klasörünün içine kopyalayın. Aynı adlı dosyalar için **Değiştir / Replace**, klasörler için **Birleştir / Merge** seçin. Ana depo klasörünü silmeyin; yeni bir iç içe `alanya-heatwave-atlas` klasörü oluşturmayın. Mevcut `charts`, `data`, `assets` ve `floods` klasörlerinin tamamını silmeyin.
4. GitHub Desktop’ın **Changes** sekmesinde yeni `drought` ve `wildfires` klasörleri ile menü/belge güncellemelerini görmelisiniz. Özet alanına `Add drought and wildfire atlas modules (v10)` yazıp **Commit to main** seçin.
5. **Push origin** düğmesine basın. GitHub Pages yayını tamamlandığında siteyi sert yenileyin (Windows: Ctrl+F5, macOS: Cmd+Shift+R). Üst menüde dört bölüm görünmelidir.

Güncelleme paketi yalnızca yeni/değişen dosyaları içerir; tek başına boş bir depoda çalışması beklenmez. Sıfırdan kurulum veya tüm dosyaları tekrar almak için tam sürüm ZIP’ini kullanın. İki paketi birden yüklemek gerekmez.

**Commit düğmesi pasifse:** özet alanının dolu olduğuna, Changes listesinde işaretli değişiklik bulunduğuna ve dosyaları GitHub Desktop’ta seçili deponun içine kopyaladığınıza bakın. **Push origin görünmüyorsa:** önce yerel commit’in oluştuğunu kontrol edin.

## Akademik yorum için önemli sınırlar

- Kuraklık çıktıları önceki RCP8.5 2046–2050 çalışmasından devralınmıştır. Kaynak denetiminde toprak su hesabı, yağmura bağlı üretim durumu, ET toplama, güneş uzaklığı katsayısı ve takvim indeksleme sorunları kaydedilmiştir. Günlük ham iklim verileri bulunmadığı için bunlar bu web sürümünde yeniden hesaplanmamıştır. Sonuçlar doğrulanmış tahmin olarak sunulmaz.
- Ekonomik değerler yalnızca bilinen üretime ve yılı belgelenmemiş kaynak fiyatlara bağlı potansiyel kayıp taramasıdır; gerçekleşmiş zarar veya resmi ilçe toplamı değildir.
- Yangın FWI olasılığı, bir yılda maksimum günlük FWI’nin 60’ı aşmasının meteorolojik olasılığıdır. Yangın çıkma, ölüm, hasar veya şebeke kesintisi olasılığı değildir.
- ECLIPS yangın modelinin zamansal ayırt etme başarısı başarısızdır (AUROC≈0,191; 11 pozitif eğitim hücresi). CHELSA’nın dokuz değişkenli alternatifinde test döneminde pozitif yangın etiketi yoktur; zamansal AUROC tanımsızdır. İlgili haritalar karar amaçlı kullanıma uygun olmayan araştırma örnekleri olarak açıkça işaretlenmiştir.
- Kuraklık çalışma sınırı 1.577,46 km², yangın çalışma sınırı 1.498,61 km²’dir. Veri kapsamları ve zaman dönemleri eşit değildir; tehlikeler arası alan/kayıplar toplanmamalıdır.

## Görüntüleme ve doğrulama

Yeni haritalar, internet tabanlı altlık kapalıyken yerel veri katmanları ve koordinat referansıyla açılır. İstenirse çevrim içi OpenStreetMap altlığı açılabilir. Altlık hizmeti erişilemezse analiz katmanları kullanılabilir. Yerel tam site kontrolü için README’deki HTTP sunucusu yöntemini kullanın.

Kaynak CSV ve metadata dosyaları değiştirilmeden kopyalanmış, grafiklerin lossless WebP kopyalarında RGBA piksel eşitliği kontrol edilmiştir. Önceki sürümün veri/grafik/harita dosyaları karşılaştırılmıştır. Yeni arayüz gerçek tarayıcıda kontrol edilmiştir. Ayrıntılı kayıt `VALIDATION_V10.json` dosyasındadır; yazılım kontrolünün başarılı olması bilimsel model doğrulaması anlamına gelmez.
