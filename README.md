# Alanya Neighbourhood Heatwave Atlas

This static web atlas links 102 Alanya neighbourhood polygons to neighbourhood-specific interactive HWI, HWF and HWTL time-series graphics. The map layer menu provides LST risk classes (4–7), 2026 Dynamic World land cover, and total vulnerable population. Only one thematic raster is displayed at a time.

In the land-cover overlay, Dynamic World class 0 (Water) remains in the legend but is rendered transparent so the blue water on the OpenStreetMap basemap remains visible. Zero-valued cells in the vulnerable-population overlay are also transparent.

## Run locally

Do not open `index.html` directly because browsers block local GeoJSON requests. Start a small web server in this folder, for example `python -m http.server 8000`, then open `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a public GitHub repository, for example `alanya-heatwave-atlas`.
2. Upload the **contents** of this folder to the repository root and commit them.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch **main** and folder **/(root)**, then save.
6. GitHub will display the public atlas URL. Add that URL to the Figshare description.

## Archive and obtain a DOI with Figshare

1. Create a Figshare item of type **Dataset** or **Software**. Dataset is preferable when the indicator data are the primary research output.
2. Upload the release ZIP, a methodology PDF, and—where possible—the underlying CSV/XLSX data used to create the charts.
3. Complete title, authors, affiliations, ORCID identifiers, keywords, funding, spatial coverage, temporal coverage, methodology, and reuse licence.
4. Add the GitHub Pages atlas URL and GitHub repository URL to the description.
5. Reserve a DOI, insert it into `CITATION.cff`, create a new ZIP, replace the Figshare file, and then publish the record.
6. Cite the Figshare DOI in the report; use the interactive atlas URL for the QR code.

## Recommended citation architecture

- **Figshare DOI:** authoritative, citable research object and versioned archive.
- **GitHub Pages:** live interactive interface.
- **GitHub repository:** transparent source and issue history.
- **Zenodo alternative:** GitHub release archiving with DOI; use either Zenodo or Figshare as the primary DOI to avoid citation fragmentation.

## Required attribution checks before public release

Confirm the licence and citation requirements for the neighbourhood boundaries, heatwave indicators, LST raster, basemap and methodology. OpenStreetMap attribution is already displayed on the map. Replace every placeholder in `CITATION.cff` before publication.
