# Alanya Climate Risk Atlas — v9

The P2R Alanya atlas combines the existing 102-neighbourhood heatwave interface with four independent flood-analysis viewers. Start at `index.html`; choose **Floods** in the upper navigation. The existing heatwave charts, polygons and raster data are retained.

## Flood analyses

| Viewer | Spatial unit | Available selections |
| --- | --- | --- |
| Coastal flooding | Original coastal source-grid cells, 90 m | 2018 baseline and 2050 RCP8.5; T2, T5, T10, T25, T50, T100 and T250; T100 depth change and 0.10 m threshold transitions |
| River flooding | Native JRC source cells | Historical climate only; T10, T20, T30, T40, T50, T75, T100, T200 and T500 |
| Population exposure | Historical river cells intersecting the OSM-derived Alanya study polygon | T100 interactive map; projected resident population for 2025; exposed residents, displacement-threshold proxy and three QA cases |
| River discharge | Nine full E-HYPE model subcatchments | RCP4.5/RCP8.5; 2011–2040, 2041–2070, 2071–2100; Q10/Q50 source-indicator changes; three interactive daily-flow charts for 1991–2005 |

The shared scenario menu stays synchronised with the original map controls. Selections are reflected in the URL and in the adjacent summary cards. Each viewer includes a source/scope note, downloadable tables and four full-resolution figures. Figures are encoded losslessly as WebP. Map legends, opacity controls and numerical cell/catchment popups remain available. Mobile layouts include an expandable sources-and-downloads panel.

## Interpretation

These are supplied model outputs, not locally validated official hazard maps. The web integration does not recalculate hazards, population exposure or discharge indicators. Different viewers use different spatial scopes; their areas and values must not be added as if they shared one study boundary.

- Coastal 2050 layers are RCP8.5. River-inundation layers have historical climate only.
- Raw river depth includes permanent-water and suspicious-depth flag overlaps. Mask semantics and local file release identity remain unverified in the source run. QA exclusions are sensitivity cases, not validation.
- Population is a 2025 projection; seasonal visitors are not included. The displacement proxy uses depth greater than 1 m and is not observed displacement. The interactive population map is T100; its downloadable table covers T10–T500.
- No monetary losses were computed. The source OSM building/facility request failed, so an empty/incomplete inventory must not be read as absence of assets or exposure.
- River-discharge scenarios describe model indicators, not flood depths or flood extents. Full model subcatchment discharges must not be summed; no local gauge validation was performed.
- Uncoloured areas can mean a value below the display threshold or missing data.

## Run locally

Open a terminal in this folder and run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` for heatwaves or `http://localhost:8000/floods/` for floods. Keep the directory tree intact. Opening HTML by double-clicking does not support the required same-origin data requests reliably.

Leaflet and Plotly are local files. Only basemap tiles require an internet connection; source data do not depend on a notebook, Python backend or CDN at viewing time. The supplied fallback behaviour is retained when tiles are unavailable. The discharge basemap is optional and initially off.

## Existing GitHub Pages deployment

Repository: https://github.com/murataksel/alanya-heatwave-atlas

Publish the **contents** of this folder at the repository root, retaining `charts/`, `assets/`, `data/`, `plotly.min.js` and the new `floods/` directory. The heatwave URL remains unchanged. The flood viewer is `https://murataksel.github.io/alanya-heatwave-atlas/floods/`.

`.nojekyll` is retained. All application asset paths are relative and work under the repository subpath. No WMS/WFS/GeoServer service is required for these self-contained map outputs.

## Provenance and verification

The input analyses were completed on 15 October 2026. `floods/downloads/source-manifest.json` records the supplied archive hashes, selected source files, their hashes and the web transformations. Raw caches, national shapefiles, NetCDF stacks and duplicate intermediate runs are not copied to the public web assets.

Validation covered all relative HTML asset links and catalog references, unchanged numerical payloads in the four maps, byte-identical source-table copies, exact source-image pixels, JavaScript syntax, and 45 scenario/QA combinations through the original source-map scripts and the parent-page controller in a DOM/Leaflet test double. Daily-chart switching, deep links and message-origin checks were also exercised. No actual browser layout or network-tile rendering check was available in this execution environment.

## Citation and archive

Retain the source-data attribution and licence requirements for each workflow. OpenStreetMap attribution is present on the maps. `CITATION.cff` is retained from v8; its DOI placeholder is not a published DOI. Complete/review citation metadata before creating a formal DOI release. A DOI archive and the live interactive GitHub Pages URL serve different purposes.
