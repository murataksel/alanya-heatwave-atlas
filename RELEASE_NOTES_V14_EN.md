# Alanya Climate Change Atlas v14.1 — Heatwave loading repair

This is a complete overlay for the v13 repository. It includes the v14 shared atlas updates and the full v12 Heatwave layer runtime required by the new fourth Heatwave analysis. Copy all contents into the existing repository, preserving folder structure and replacing same-name files.

## Repair

The published Heatwave page referenced `heatwaves/layers-v12/catalog.js`, but that catalog was missing from the deployed repository. The Heatwave script then stopped at startup when it tried to read the CLIMAAX risk layer definition, leaving the analysis panel at “Loading analysis…” while the basemap and neighbourhood outlines were still visible. This release supplies the complete layer catalog, risk overlay, metadata and building tiles, plus the source downloads. A clear in-page error is shown if the catalog is missing in a future deployment.

## Included v14 updates

- Shared bilingual **Alanya Climate Change Atlas** identity across seven hazard sections.
- OpenStreetMap default basemaps for the Coastal and River flood maps and interactive analytical maps.
- Fourth Heatwave analysis: Vulnerability & buildings, with the supplied vulnerable-population grid, independent Overture building footprints, and the CLIMAAX five-class heat-risk raster and legend.
- Windstorm building detail access and explicit disclosure that the source package contains no spatial gust field.

## Verification

The published catalog URL was checked and returned GitHub Pages 404; the browser console identified the resulting undefined `risk` access in the Heatwave startup script. The repaired archive was checked for the referenced catalog, risk raster, building tiles and original download files. JavaScript syntax checks pass. Source hazard results were not recalculated.
