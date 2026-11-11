# Alanya İklim Değişikliği Atlası v14.2 — Heatwave yükleme düzeltmesi

Bu küçük düzeltme paketi, daha önce yüklenen **v14.1** sürümünün üzerine uygulanır. Canlı sayfada analiz başlatıcısı `window.createHeatwaveBuildingLayer is not a function` hatasıyla duruyordu; çünkü `index.html` bu dosyayı çağırmasına rağmen `assets/heatwave-buildings-v12.js` depoda yoktu.

## Uygulama

1. ZIP’i açın.
2. İçindeki `index.html` dosyasını GitHub Desktop’taki atlas deposunun ana klasörüne kopyalayın ve üzerine yazın.
3. İçindeki `assets/heatwave-buildings-v12.js` dosyasını depodaki `assets` klasörüne kopyalayın.
4. GitHub Desktop’ta bu iki değişikliği commit edip GitHub’a push edin.
5. Yayın güncellendikten sonra sayfayı sert yenileyin (`Ctrl+Shift+R`).

`index.html`, eksik dosyanın tarayıcı önbelleğinde kalmış eski 404 yanıtını kullanmaması için çağrı adresini `v14.2.0` olarak yeniler. Bina katmanı betiği, v12 Heatwave paketindeki özgün dosyadır; ısı riski sonuçları veya veriler değiştirilmemiştir.

Bu, **v14.1 üzerine uygulanan düzeltme katmanıdır**; tek başına tam site değildir.
