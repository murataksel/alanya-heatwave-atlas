# Atlas v13 data preparation / Veri hazırlığı

These scripts do not run hazard models. They package supplied executed outputs for the website.
Bu kodlar tehlike modeli çalıştırmaz; sağlanan çıktıları web gösterimi için hazırlar.

Install the pinned dependencies from requirements-atlas-v13.txt in a separate Python environment.
Extract the three user archives into one input directory, retaining their original top-level names:
CLIMAAX_HEAVY_RAIN_ALANYA_v1, CLIMAAX_MULTI_ALANYA_v1 and CLIMAAX_STORMSv3.

```bash
python prepare_atlas_v13.py --inputs /absolute/extracted-inputs --atlas /absolute/atlas-root
python validate_atlas_v13.py --atlas /absolute/atlas-root --baseline /absolute/v12-atlas-root
```

Validation requires an unchanged v12 atlas directory for source preservation comparison.
Doğrulama, koruma karşılaştırması için değiştirilmemiş bir v12 atlas klasörü gerektirir.
The frontend source is in assets/extended-atlas-v13.js and assets/extended-atlas-v13.css.
The scripts preserve selected original tables/GIS; display renditions are documented in source manifests.
