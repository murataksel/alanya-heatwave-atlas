# v9 — Taşkın bölümünün eklenmesi

Başlangıç dosyası `index.html` dosyasıdır. Üst menüden **Heatwaves** ve **Floods** bölümleri arasında geçiş yapılır. Önceki 102 mahalleye ait sıcak hava dalgası verileri ve grafik dosyaları korunmuştur.

**Floods** bölümünde dört seçenek bulunur:

1. **Coastal flooding:** 2018 ve 2050 RCP8.5 kıyı taşkın derinlikleri; 2–250 yıl tekerrür dönemleri; T100 derinlik değişimi ve 0,10 m eşik geçişleri.
2. **River flooding:** tarihsel JRC akarsu taşkın derinlikleri; 10–500 yıl tekerrür dönemleri.
3. **Population exposure:** tarihsel T100 akarsu taşkını ile 2025 yerleşik nüfus projeksiyonunun çakıştırılması. Etkilenen nüfus, derinlik > 1 m göstergesi ve QA duyarlılık seçenekleri ayrı sunulur.
4. **River discharge:** dokuz E-HYPE model alt havzası için RCP4.5/RCP8.5, üç gelecek dönem ve Q10/Q50 debi değişim göstergeleri; üç alt havzaya ait etkileşimli günlük debi grafikleri.

Mahalle seçimi taşkınlara uygulanmamıştır. Haritalarda özgün hücreler/alt havzalar kullanılır. Haritanın üstündeki senaryo seçimi harita içindeki kontrollerle birlikte çalışır; özet kutuları aynı seçimi izler. Seçim sayfa adresine yansıtılır. Her analiz için dört şekil, CSV indirme bağlantıları ve kaynak/kapsam açıklamaları vardır. Küçük ekranlarda bu açıklamalar **Sources, interpretation & downloads** altında açılır.

## Sonuçların kapsamı

Parasal hasar hesabı bulunmuyor. Bina/tesis verilerinin indirilmesi kaynak çalışmada tamamlanmadığı için bu eksiklik belirtilmiştir. Nüfus hesabı turistleri içermez; 2025 nüfusu bir projeksiyondur. > 1 m derinlik göstergesi gerçekleşmiş tahliye veya yerinden edilme sayısı değildir. Debi projeksiyonları yeni su basma haritaları olarak sunulmaz. Farklı analizlerin çalışma alanları farklıdır; alan/nüfus/debi değerleri modüller arasında toplanmaz.

## Yerel açılış

Bu klasörde terminal açın, `python -m http.server 8000` komutunu çalıştırın. Tarayıcıda `http://localhost:8000` adresini açın. Dosyaları çift tıklayarak açmak yerine HTTP kullanın. İnternet yalnızca harita altlığının çevrimiçi kareleri için gereklidir; Leaflet, Plotly ve sayısal veriler pakettedir.

## Kontroller

Dört haritanın sayısal yükleri kaynak dosyalarla karşılaştırılmıştır; kaynak CSV dosyaları aynı baytlarla kopyalanmıştır. On altı şeklin pikselleri kayıpsız korunmuştur. Bağlantılar ve JavaScript sözdizimi denetlenmiş; senaryo/QA seçiminin 45 kombinasyonu, günlük grafik seçimi ve doğrudan bağlantılar DOM/Leaflet test ortamında çalıştırılmıştır. Gerçek tarayıcıda görsel yerleşim ve altlık yükleme kontrolü bu ortamda yapılamamıştır.
