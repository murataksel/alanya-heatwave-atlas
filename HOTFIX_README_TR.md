# Alanya İklim Değişikliği Atlası v14.3 — Heatwave yükleme düzeltmesi

Bu hotfix, daha önce yüklenen **v14.1 atlasının üzerine** uygulanır. Canlı sayfanın konsolunda iki dosya için 404 ve bina katmanı başlatıcısında hata görülüyor: `heatwave-translations-v12.js` ve `heatwave-buildings-v12.js` depoda bulunmuyor. Bu nedenle analiz ekranı başlatılamıyor.

## GitHub Desktop ile uygulama

1. Bu ZIP’i açın.
2. ZIP içindeki `index.html` dosyasını atlas deposunun ana klasörüne kopyalayıp üzerine yazın.
3. ZIP içindeki iki dosyayı depo içindeki `assets` klasörüne kopyalayın.
4. GitHub Desktop’ta değişiklikleri commit edip GitHub’a push edin.
5. Yayın güncellendikten sonra siteyi `Ctrl+Shift+R` ile sert yenileyin.

`index.html` her iki betiğin çağrı sürümünü `14.3.0` yapar; böylece eski 404 yanıtı önbellekten kullanılmaz. Katman ve çeviri betikleri özgün v12 Heatwave paketinden alınmıştır. Kaynak risk verileri değiştirilmemiştir.

Bu paket **v14.1 üzerine uygulanacak düzeltme katmanıdır**, tam site arşivi değildir. Önceki v14.2 yaması yerine bu v14.3 paketini kullanın.
