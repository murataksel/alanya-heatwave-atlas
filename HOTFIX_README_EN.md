# Alanya Climate Change Atlas v14.3 — Heatwave loading fix

Apply this hotfix on top of the previously uploaded **v14.1 atlas**. The live console reports 404 responses for `heatwave-translations-v12.js` and `heatwave-buildings-v12.js`; the missing building helper then stops Heatwave startup.

## Apply with GitHub Desktop

1. Extract this ZIP.
2. Copy the included `index.html` to the root of the atlas repository, replacing the existing file.
3. Copy both included scripts into the repository’s `assets` folder.
4. Commit the changes in GitHub Desktop and push to GitHub.
5. After Pages updates, hard-refresh the site with `Ctrl+Shift+R`.

The index bumps both script URLs to `14.3.0` to avoid reuse of cached 404 responses. The translation and building scripts are the original files from the v12 Heatwave package. Source risk data are unchanged.

This is a **hotfix overlay for v14.1**, not a full-site archive. Use this v14.3 package in place of the previous v14.2 hotfix.
