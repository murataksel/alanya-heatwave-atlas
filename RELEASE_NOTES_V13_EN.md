# Alanya Climate Risk Atlas · v13

This release adds three bilingual sections on top of v12: **Heavy Rain**, **Multi · Infrastructure**, and **Storms**. All seven hazard sections are linked from every main entry point; mobile navigation uses two visible rows.

The existing Heatwave series, five-class CLIMAAX risk layer, 79,312 Overture footprints and Flood/Drought/Wildfire numerical outputs are preserved. Only their entry HTML files change for navigation.

## Heavy Rain

24 native ~12 km climate cells; 3h/24h rainfall for T2–T500, historical 1976–2005 and RCP4.5/RCP8.5 2041–2070. Maps retain ensemble medians, model ranges and source changes. Six T100 screening cases contain 30 m terrain classes and 27,960 mapped footprints. Neighbourhood exposure distinguishes 3,285 residential-tagged, 12,654 use-unknown and 12,021 other-use footprints. Residential inventory is absent in 64 neighbourhoods; these are unavailable rather than zero hazard. Two footprints are unassessed, eight administratively unassigned. Screening is not inundation, water depth, damage or loss. The 3h-only source residential summary and sensitivity scope are explicitly labelled.

## Multi · Infrastructure

289 facilities; 14,975 road segments and 3,014.939 mapped centreline km. Scope explicitly includes GZP airport and its external connection corridor. Sector filtering supports summer 2025 Landsat surface temperature/local heat excess/NDVI/NDBI, 1991–2025 regional climate profiles and DSM terrain/waterway proximity. Baseline 1991–2020 overlaps recent 2015–2025. No future scenario, station bias correction, composite risk, operational failure or monetary-loss model was computed. Surface temperature is not air temperature; spectral indices are not measured shade or impervious fractions.

## Storms

Supplied summaries associated with `T100_pattern_19800327T10` are shown as threshold exposure, with incomplete provenance disclosed. At 32.7 m/s: 1,455 buildings and 378.673 km roads. The spatial gust field, per-building gusts, complete run manifest and fitted-return-level metadata are absent. No spatial wind map is inferred from these totals. Inventory GIS remains context only.

MGM 17310 has 10,851 recorded daily maxima, 1995–2025, 472 missing calendar days and 23 complete years. Incomplete years are highlighted; sensor height, gust averaging duration and daily boundary remain unconfirmed. Height readiness retains 221 unverified OSM declarations, 1,499 levels × assumed 3 m estimates and 26,240 unknown heights. No surveyed heights or WindNinja/OpenFOAM output are supplied. The 6,538 source road geometries differ from the 39,026 segments used in the shared summary.

## Sources and display

Selected original CSV/JSON files and geospatial ZIP entries are retained byte-for-byte with SHA-256 records. Building display coordinates are rounded to seven decimals; road display lines are simplified by 3 m without changing source numerical lengths. Categorical rasters use exact inverse nearest-neighbour mapping. Figures are resized WebP browser renditions. Heavy Rain includes original TR/EN figure pairs. Multi/Storms source figure labels retain their original language, explicitly labelled; interactive charts and interpretations are bilingual. Source identifiers and field codes remain unchanged. No hazard model was re-run.

## Install on v12

Extract the update ZIP. Merge the **contents** of `alanya-heatwave-atlas` into your existing repository root, replacing matching files and keeping all old folders. In GitHub Desktop, review changes, **Commit to main**, then **Push origin**. After GitHub Pages finishes, refresh with **Ctrl+F5**. This is an update overlay, not a standalone full site or an automatic deployment.
