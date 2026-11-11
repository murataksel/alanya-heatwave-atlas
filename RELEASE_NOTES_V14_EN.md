# Alanya Climate Change Atlas v14 — shared map and evidence update

This is a compact overlay for the v13 site package. Copy the included files into the v13 repository, preserving the directory structure, and allow them to replace files with the same names.

## What changed

- Renamed the shared bilingual identity to **Alanya Climate Change Atlas** across the seven hazard sections.
- Enabled OpenStreetMap street tiles by default on the Coastal and River flood interactive maps; users can switch the basemap off. Existing flood layers, scales, and caveats remain intact.
- Added a fourth Heatwave analysis, **Vulnerability & buildings**, combining the supplied vulnerable-population grid, independently selectable CLIMAAX five-class heat-risk raster, and Overture building footprints. The CLIMAAX source legend is preserved. No building-level vulnerability score or population-to-building assignment is inferred.
- Made the supplied building inventory available in Windstorms views and enabled the detail layer. The page clearly distinguishes station temporal records and threshold summaries from a spatial gust field; no spatial wind field was supplied.
- Enabled online OSM backgrounds by default on the interactive analytical map engines and standardized shared navigation and bilingual atlas identity.

## Scope and verification

Source analytical outputs were retained; no hazard model was rerun. OpenStreetMap tiles require an internet connection and are subject to OSM attribution and usage policies. The update was syntax-checked and inspected in-browser across all seven hazard pages, both flood map views, and the Heatwave vulnerability view.
