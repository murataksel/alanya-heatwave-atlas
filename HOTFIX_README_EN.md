# Alanya Climate Change Atlas v14.2 — Heatwave loading fix

This small hotfix applies on top of the previously uploaded **v14.1** release. The live page stopped during startup with `window.createHeatwaveBuildingLayer is not a function`: the page requested `assets/heatwave-buildings-v12.js`, but that file was absent from the repository.

## Apply the hotfix

1. Extract this ZIP.
2. Copy `index.html` to the root of the atlas repository in GitHub Desktop and replace the existing file.
3. Copy `assets/heatwave-buildings-v12.js` into the repository’s `assets` folder.
4. Commit these two changes in GitHub Desktop and push them to GitHub.
5. After the published page updates, hard-refresh it (`Ctrl+Shift+R`).

The index uses a new `v14.2.0` URL for the script so the browser does not reuse a cached 404. The building-layer script is the original file from the v12 Heatwave package; heat-risk results and source data are unchanged.

This is a **hotfix overlay for v14.1**, not a standalone full-site package.
