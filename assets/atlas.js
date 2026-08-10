const state = {
  selected: "",
  selectedLayer: null,
  geoLayer: null,
  features: new Map(),
  layers: {},
  active: "lst",
  opacity: 0.67,
  series: "both",
};

const map = L.map("map", { zoomControl: false, minZoom: 8 }).setView([36.56, 32.05], 10);
L.control.zoom({ position: "bottomright" }).addTo(map);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

const chartFrame = document.getElementById("chart");
const chartPath = (name) =>
  `charts/${encodeURIComponent(name.replaceAll(" ", "_"))}_heatwave_timeseries.html`;

const legends = {
  lst: `<b>LST risk class</b><i class="gradient lst"></i><div class="legend-scale"><span>Lower · 4</span><span>Higher · 7</span></div>`,
  population: `<b>Vulnerable population</b><i class="gradient population"></i><div class="legend-scale"><span id="pop-low">Low</span><span id="pop-high">High</span></div><small>Persons per 30 m grid cell · zero values transparent</small>`,
  lulc: `<b>Dynamic World land cover · 2026</b><div class="class-legend"><span><i style="--c:#419bdf"></i>Water <em>transparent</em></span><span><i style="--c:#397d49"></i>Trees</span><span><i style="--c:#88b053"></i>Grass</span><span><i style="--c:#7a87c6"></i>Flooded vegetation</span><span><i style="--c:#e49635"></i>Crops</span><span><i style="--c:#dfc35a"></i>Shrub &amp; scrub</span><span><i style="--c:#c4281b"></i>Built area</span><span><i style="--c:#a59b8f"></i>Bare ground</span><span><i style="--c:#b39fe1"></i>Snow &amp; ice</span></div><small>Water is listed but not painted; basemap water remains visible.</small>`,
  none: `<b>Basemap</b><small>No thematic raster is displayed.</small>`,
};

const defaultStyle = {
  color: "#0b3558",
  weight: 1.15,
  fillColor: "#dff4ef",
  fillOpacity: 0.12,
};

const selectedStyle = {
  color: "#00e0c2",
  weight: 3.3,
  fillColor: "#00e0c2",
  fillOpacity: 0.24,
};

function applySeriesFilter() {
  const win = chartFrame.contentWindow;
  const doc = chartFrame.contentDocument;
  if (!win?.Plotly || !doc) return;

  const graph = doc.querySelector(".plotly-graph-div");
  if (!graph?.data) return;

  const visible = graph.data.map((trace) =>
    state.series === "both" ||
    (state.series === "historical" && trace.legendgroup === "Historical") ||
    (state.series === "rcp85" && trace.legendgroup === "RCP8.5")
  );
  win.Plotly.restyle(graph, { visible });
}

function select(name, zoom = true) {
  const nextLayer = state.features.get(name);
  if (!nextLayer || !state.geoLayer) return;

  // Reset every polygon first. This guarantees that a previous selection or
  // hover style can never remain stuck after a new neighbourhood is chosen.
  state.geoLayer.eachLayer((layer) => state.geoLayer.resetStyle(layer));
  nextLayer.setStyle(selectedStyle);
  nextLayer.bringToFront();

  state.selected = name;
  state.selectedLayer = nextLayer;
  document.getElementById("selected").textContent = name;

  const url = chartPath(name);
  chartFrame.src = url;
  document.getElementById("full").href = url;

  document.querySelectorAll(".list button").forEach((button) => {
    const active = button.dataset.name === name;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });

  if (zoom) {
    map.fitBounds(nextLayer.getBounds(), { padding: [54, 54], maxZoom: 13 });
  }
}

function showLayer(key) {
  Object.values(state.layers).forEach((layer) => {
    if (map.hasLayer(layer)) map.removeLayer(layer);
  });

  state.active = key;
  const layer = state.layers[key];
  if (layer) {
    layer.setOpacity(state.opacity);
    layer.addTo(map);
    layer.bringToBack();
  }

  document.getElementById("legend").innerHTML = legends[key];
  if (key === "population" && state.populationMeta) {
    document.getElementById("pop-low").textContent = state.populationMeta.low.toFixed(2);
    document.getElementById("pop-high").textContent = `≥ ${state.populationMeta.high.toFixed(2)}`;
  }
}

function renderList(names) {
  const list = document.getElementById("list");
  list.replaceChildren(
    ...names.map((name) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = name.replace(" Mahallesi", "");
      button.dataset.name = name;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", "false");
      button.addEventListener("click", () => select(name));
      return button;
    })
  );
}

Promise.all([
  fetch("data/neighbourhoods.geojson").then((response) => response.json()),
  fetch("data/risk_lst.json").then((response) => response.json()),
  fetch("data/lulc_2026.json").then((response) => response.json()),
  fetch("data/vulnerable_population.json").then((response) => response.json()),
]).then(([geo, lstMeta, lulcMeta, populationMeta]) => {
  state.populationMeta = populationMeta;
  state.layers.lst = L.imageOverlay("data/risk_lst.png", lstMeta.bounds, { opacity: state.opacity });
  state.layers.lulc = L.imageOverlay("data/lulc_2026.png", lulcMeta.bounds, { opacity: state.opacity });
  state.layers.population = L.imageOverlay("data/vulnerable_population.png", populationMeta.bounds, { opacity: state.opacity });
  showLayer("lst");

  state.geoLayer = L.geoJSON(geo, {
    style: defaultStyle,
    onEachFeature: (feature, layer) => {
      const name = feature.properties.Name;
      state.features.set(name, layer);
      layer.bindTooltip(name, { sticky: true, className: "atlas-tooltip" });
      layer.on("click", () => select(name));
      layer.on("mouseover", () => {
        if (layer !== state.selectedLayer) layer.setStyle({ color: "#fff", weight: 2.5 });
      });
      layer.on("mouseout", () => {
        if (layer !== state.selectedLayer) state.geoLayer.resetStyle(layer);
      });
    },
  }).addTo(map);

  map.fitBounds(state.geoLayer.getBounds(), { padding: [14, 14] });
  const names = geo.features
    .map((feature) => feature.properties.Name)
    .sort((a, b) => a.localeCompare(b, "tr"));
  renderList(names);
  select(geo.features[0].properties.Name, false);
});

document.getElementById("search").addEventListener("input", (event) => {
  const query = event.target.value.toLocaleLowerCase("tr");
  document.querySelectorAll(".list button").forEach((button) => {
    button.hidden = !button.dataset.name.toLocaleLowerCase("tr").includes(query);
  });
});

document.getElementById("thematic-layer").addEventListener("change", (event) => showLayer(event.target.value));
document.getElementById("opacity").addEventListener("input", (event) => {
  state.opacity = Number(event.target.value);
  state.layers[state.active]?.setOpacity(state.opacity);
});
document.getElementById("series-filter").addEventListener("change", (event) => {
  state.series = event.target.value;
  applySeriesFilter();
});
chartFrame.addEventListener("load", applySeriesFilter);
