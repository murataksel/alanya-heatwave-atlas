# Alanya Climate Risk Atlas — v11 FINAL

23 October 2026 · English / Türkçe

## A four-hazard atlas, in two languages

Heatwaves, Floods, Drought and Wildfires now share one navigation bar and an English/Turkish selector. Your language preference is retained when moving between modules and in embedded maps and charts.

The heatwave section has the same workspace layout as the other hazards. The 102 neighbourhood geometries, 33,660 annual heatwave source values and existing thematic raster pixels are preserved.

Menus, method notes, legends, map queries, chart labels and source-figure captions follow the selected language. Turkish SVG counterparts are provided for 101 drought, wildfire and flood figures. Original source exports, model identifiers and raw CSV field names remain unchanged for reproducibility.

## Install the full final package

For this final release, the full ZIP is recommended so all four entry pages and the new shared language assets are updated together. The update-only ZIP is for an existing v10 installation. Use one package; both are not required.

In GitHub Desktop select the existing alanya-heatwave-atlas repository. Use Repository → Show in Explorer / Finder to open its actual working folder. Keep a backup before replacing files.

Extract the ZIP elsewhere. Open the alanya-heatwave-atlas folder inside it, then copy its contents into the existing repository folder. Replace matching files and merge folders. Do not place a second alanya-heatwave-atlas folder inside the repository or delete repository metadata.

The repository root must contain index.html, guide.html, assets, charts, data, floods, drought, wildfires and heatwaves. In GitHub Desktop review Changes, enter a summary such as Final bilingual atlas v11, then Commit to main and Push origin.

After GitHub Pages completes its deployment, refresh the site with Ctrl+F5 on Windows or Cmd+Shift+R on macOS. Every hazard page should show v11 FINAL, four hazard links and EN/TR controls. If Floods still shows only two links, the old floods/index.html is still being served or the wrong folder was updated.

## Local viewing and quick checks

For a full local preview, run python -m http.server 8000 in the folder containing index.html, then open http://localhost:8000/. Preserve the directory tree. No notebook or geospatial server is required at viewing time.

Switch between all four hazards from Floods. Change EN/TR, inspect a map cell, open a figure, and select a heatwave neighbourhood. Language changes must retain the selected scenario and neighbourhood. Source street basemaps are optional and require internet access.

## Scientific scope and traceability

This final release changes presentation and language, not climate or impact model results. Drought retains its inherited method-audit limitations; wildfire RF experiments retain their failed or unavailable validation status. FWI weather exceedance is not an ignition, damage, casualty or outage probability.

The 85 drought/wildfire Turkish source-figure counterparts keep the scientific paths and embedded raster images unchanged; labels are translated. The 16 Turkish flood figures are redrawn from the retained source cells and CSV tables. Original English WebP figures are retained. Figure derivatives are presentation assets, not new model runs.

VALIDATION_V11.json records numerical preservation and functional checks. TRANSLATED_FIGURES_V11.json records the localized scientific figures. Source manifests and unchanged downloads remain under each hazard. Software checks do not establish scientific model validation.


The earlier release notes remain available for the source-analysis inventory. Use the bilingual guide.html for the final interface and installation instructions.
