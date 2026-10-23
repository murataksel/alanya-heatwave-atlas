# Alanya Climate Risk Atlas — v10

Four climate-hazard entry points for P2R Alanya: **Heatwaves**, **Floods**, **Drought** and **Wildfires**. The user-approved v9 heatwave and flood analyses are retained. Navigation, release metadata and documentation are updated; existing scientific payloads are unchanged.

This is an interactive presentation of supplied analyses, not a new climate-model run, locally validated official hazard service, or live warning system. Its English interface retains periods, units, spatial support, coverage and interpretation at the point of use.

## Added in v10

| Analysis | Spatial support | Interactive content |
| --- | --- | --- |
| Drought water and climate | 23 clipped native climate cells; supplied 1,577.46 km² boundary | Three crops; yield reduction, irrigation requirement, precipitation, ET₀, climatic balance and soil AWC; monthly irrigation chart |
| Drought production | 44 clipped production source cells per crop | Known allocated production and production density; separate production-grid and hazard coverage measures |
| Drought economic screening | 168 production–hazard intersections across crops | Conditional potential loss and density; supplied 0.8/1.0/1.2 price assumptions; production-weighted reduction |
| Fire weather | Six native weather-cell intersections; working 1,498.61 km² boundary | 1981–2010 baseline; SSP2-4.5/SSP5-8.5; four future periods; three selected CMIP6 models or available-model median; annual weather PE and season length |
| Fire-weather exposure | Native weather cells with supplied line/facility geometries | Scenario population above PE thresholds; source infrastructure intersections; baseline and future views |
| Fire evidence and infrastructure | Source vector geometries and satellite records | Layer toggles for electricity, fibre, major roads, facilities, selected institutional points, WUI and alternative boundary; MODIS detected-area chart |
| Exploratory wildfire ML | Native MODIS grid, approximately 463 m | ECLIPS and nine-predictor CHELSA experiments; 12 historical/future configurations and 92 raster views, including susceptibility, ordinal hazard, four risk dimensions, climate novelty and score change |

Map selections are retained in shareable URL fragments. All new modules include source tables, searchable/paginated data views, original geospatial downloads, lossless source figures and methodology notes. There are 14 drought and 71 wildfire figures, with captions preserved from the supplied wildfire archive. Leaflet and Plotly are bundled locally. New maps start with local analytical layers and a coordinate reference; an optional OpenStreetMap street basemap requires internet access and is subject to the provider’s availability. The source overlay remains usable without it.

## Scientific interpretation of the new modules

- **Drought remains inherited screening.** The only displayed hazard scenario is MPI-M-MPI-ESM-LR / SMHI-RCA4 RCP8.5, 2046–2050. The source audit identifies unresolved soil-water, rainfed-state, ET aggregation, solar-distance and calendar issues. Raw daily climate needed to correct and recompute these was not supplied. The interface displays the audit and does not silently repair or rebrand the results.
- Climate drought statistics use district-land-area weighting, not planted-crop-area weighting. Crop economic statistics use production weighting. AWC is mm/m. Annual precipitation minus ET₀ is a climatic balance. Irrigation depths in mm are not withdrawal volumes.
- Production is allocated uniformly within modified source MapSPAM cells; calibration, source year and zero/nodata policy are not independently documented. Known allocated production is not an official district total. Prices in USD/t have no documented year; conditional potential losses are not observed damage or validated expected losses.
- **Fire weather and RF susceptibility are separate branches.** Annual meteorological PE means the fitted probability that maximum daily FWI exceeds 60. It is not ignition, burned-area, casualty, asset-failure or outage probability. Season length uses a fixed baseline-derived threshold.
- The CMIP6 response is bounded to 0…5°C warming and −40…+60% precipitation change. Two SSP5-8.5 2081–2100 cases remain missing outside that domain. Only one model contributes there; no ensemble spread is inferred. Three-model min–max bands elsewhere are not confidence intervals.
- **RF maps are research examples unsuitable for decision use.** ECLIPS has 11 positive native training cells and later-period AUROC ≈0.191, i.e. failed discrimination. The nine-predictor CHELSA sensitivity excludes SWE and has no positive held-out labels; its temporal AUROC is undefined. Raster risk and changes inherit these limitations. Balanced RF scores are not calibrated annual or cumulative fire probabilities.
- Infrastructure is partial, institutional point datum is unspecified, population rasters are scenarios rather than current official residents, and MODIS detection area is not a forestry-area total or incident count. Boundaries differ between modules; results must not be summed across them.

## Flood analyses

| Viewer | Spatial unit | Available selections |
| --- | --- | --- |
| Coastal flooding | Original coastal source-grid cells, 90 m | 2018 baseline and 2050 RCP8.5; T2, T5, T10, T25, T50, T100 and T250; T100 depth change and 0.10 m threshold transitions |
| River flooding | Native JRC source cells | Historical climate only; T10, T20, T30, T40, T50, T75, T100, T200 and T500 |
| Population exposure | Historical river cells intersecting the OSM-derived Alanya study polygon | T100 interactive map; projected resident population for 2025; exposed residents, displacement-threshold proxy and three QA cases |
| River discharge | Nine full E-HYPE model subcatchments | RCP4.5/RCP8.5; 2011–2040, 2041–2070, 2071–2100; Q10/Q50 source-indicator changes; three interactive daily-flow charts for 1991–2005 |

The shared scenario menu stays synchronised with the original map controls. Selections are reflected in the URL and in the adjacent summary cards. Each viewer includes a source/scope note, downloadable tables and four full-resolution figures. Figures are encoded losslessly as WebP. Map legends, opacity controls and numerical cell/catchment popups remain available. Mobile layouts include an expandable sources-and-downloads panel.

## Flood interpretation

These are supplied model outputs, not locally validated official hazard maps. The web integration does not recalculate hazards, population exposure or discharge indicators. Different viewers use different spatial scopes; their areas and values must not be added as if they shared one study boundary.

- Coastal 2050 layers are RCP8.5. River-inundation layers have historical climate only.
- Raw river depth includes permanent-water and suspicious-depth flag overlaps. Mask semantics and local file release identity remain unverified in the source run. QA exclusions are sensitivity cases, not validation.
- Population is a 2025 projection; seasonal visitors are not included. The displacement proxy uses depth greater than 1 m and is not observed displacement. The interactive population map is T100; its downloadable table covers T10–T500.
- No monetary losses were computed. The source OSM building/facility request failed, so an empty/incomplete inventory must not be read as absence of assets or exposure.
- River-discharge scenarios describe model indicators, not flood depths or flood extents. Full model subcatchment discharges must not be summed; no local gauge validation was performed.
- Uncoloured areas can mean a value below the display threshold or missing data.


## Run locally or use GitHub Pages

Keep the directory tree intact. For a full local preview, run this command from the folder containing `index.html`:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/`. New drought/wildfire catalogs also load without a server, but the retained v9 heatwave/flood requests need HTTP for reliable viewing. No Python backend, GeoServer or WMS/WFS deployment is required for hosting. The static files work under the existing GitHub Pages repository subpath.

For GitHub Desktop, see `DEGISIKLIKLER_V10_TR.md`. Copy the **contents** of `alanya-heatwave-atlas/` to the existing repository root. For an existing v9 installation, the update-only ZIP contains only new or modified files. Do not delete `charts/`, `floods/`, `assets/`, `data/`, `plotly.min.js` or repository metadata. Both packages retain `.nojekyll`.

## Reproducibility and validation

`drought/downloads/source-manifest.json` and `wildfires/downloads/source-manifest.json` record source archive/file SHA-256 hashes, sizes and web transformations. CSV and metadata downloads are byte-for-byte copies. The original GeoTIFF, GeoPackage and SVG outputs are retained in each `geospatial-source.zip`.

GeoPackage geometries are reprojected to EPSG:4326 without simplification. Raster map images are reprojected to EPSG:3857 using nearest-neighbour sampling; native MODIS-grid arrays are queried independently on click. This does not add spatial information. Scientific PNG figures are encoded as lossless WebP with decoded RGBA pixel equality verified. Model/scenario periods, class 0 and unknown/nodata are kept distinct.

`VALIDATION_V10.json` records preservation, numeric consistency, geometry, source-link and image checks. Browser QA exercised heatwave/flood navigation, drought crop/indicator/price changes, source audit/data/figures, weather model/period changes, missing response-domain cases, exposure, infrastructure layers, both ML branches and native raster inspection. Passing software and presentation checks does not establish scientific validation of the supplied models.

`tools/build_hazard_assets.py` regenerates the two new data catalogs and web assets from extracted output folders. Its Python dependencies are documented in `tools/requirements-build.txt`; the web viewer itself requires none of these at runtime. The source analytical notebooks and raw climate inputs are not all present in the uploaded outputs, so a complete upstream scientific rerun is outside this release.

## Citation and data rights

`CITATION.cff` describes the atlas software and links to the existing repository. No DOI has been assigned for this v10 package; placeholder DOI strings have been removed. Cite the atlas release, the individual workflow, dataset and source analytical outputs separately. The inherited atlas licence does not override third-party dataset rights. Retain source attribution and applicable dataset terms when redistributing geospatial downloads.
