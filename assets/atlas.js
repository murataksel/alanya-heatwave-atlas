const state={selected:"",features:new Map(),layers:{},active:"lst",opacity:.67,series:"both"};
const map=L.map("map",{zoomControl:false,minZoom:8}).setView([36.56,32.05],10);
L.control.zoom({position:"bottomright"}).addTo(map);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:"© OpenStreetMap contributors"}).addTo(map);
const chartPath=name=>`charts/${encodeURIComponent(name.replaceAll(" ","_"))}_heatwave_timeseries.html`;
const legends={
  lst:`<b>LST risk class</b><i class="gradient lst"></i><div class="legend-scale"><span>Lower · 4</span><span>Higher · 7</span></div>`,
  population:`<b>Vulnerable population</b><i class="gradient population"></i><div class="legend-scale"><span id="pop-low">Low</span><span id="pop-high">High</span></div><small>Persons per 30 m grid cell · zero values transparent</small>`,
  lulc:`<b>Dynamic World land cover · 2026</b><div class="class-legend"><span><i style="--c:#419bdf"></i>Water <em>transparent</em></span><span><i style="--c:#397d49"></i>Trees</span><span><i style="--c:#88b053"></i>Grass</span><span><i style="--c:#7a87c6"></i>Flooded vegetation</span><span><i style="--c:#e49635"></i>Crops</span><span><i style="--c:#dfc35a"></i>Shrub &amp; scrub</span><span><i style="--c:#c4281b"></i>Built area</span><span><i style="--c:#a59b8f"></i>Bare ground</span><span><i style="--c:#b39fe1"></i>Snow &amp; ice</span></div><small>Water is listed but not painted; basemap water remains visible.</small>`,
  none:`<b>Basemap</b><small>No thematic raster is displayed.</small>`
};
function style(name){return name===state.selected?{color:"#00e0c2",weight:3.3,fillColor:"#00e0c2",fillOpacity:.24}:{color:"#0b3558",weight:1.15,fillColor:"#dff4ef",fillOpacity:.12}}
function select(name,zoom=true){state.selected=name;document.getElementById("selected").textContent=name;const url=chartPath(name);document.getElementById("chart").src=url;document.getElementById("full").href=url;document.querySelectorAll(".list button").forEach(b=>b.classList.toggle("active",b.dataset.name===name));state.features.forEach((layer,n)=>layer.setStyle(style(n)));const layer=state.features.get(name);if(zoom&&layer)map.fitBounds(layer.getBounds(),{padding:[54,54],maxZoom:13})}
function applySeriesFilter(){const frame=document.getElementById("chart");const win=frame.contentWindow;const doc=frame.contentDocument;if(!win||!doc||!win.Plotly)return;const graph=doc.querySelector(".plotly-graph-div");if(!graph||!graph.data)return;const visible=graph.data.map(trace=>state.series==="both"||(state.series==="historical"&&trace.legendgroup==="Historical")||(state.series==="rcp85"&&trace.legendgroup==="RCP8.5"));win.Plotly.restyle(graph,{visible});}
function showLayer(key){Object.values(state.layers).forEach(layer=>{if(map.hasLayer(layer))map.removeLayer(layer)});state.active=key;const layer=state.layers[key];if(layer){layer.setOpacity(state.opacity);layer.addTo(map);layer.bringToBack()}document.getElementById("legend").innerHTML=legends[key];if(key==="population"&&state.populationMeta){document.getElementById("pop-low").textContent=state.populationMeta.low.toFixed(2);document.getElementById("pop-high").textContent=`≥ ${state.populationMeta.high.toFixed(2)}`}}
Promise.all([fetch("data/neighbourhoods.geojson").then(r=>r.json()),fetch("data/risk_lst.json").then(r=>r.json()),fetch("data/lulc_2026.json").then(r=>r.json()),fetch("data/vulnerable_population.json").then(r=>r.json())]).then(([geo,lstMeta,lulcMeta,populationMeta])=>{
  state.populationMeta=populationMeta;
  state.layers.lst=L.imageOverlay("data/risk_lst.png",lstMeta.bounds,{opacity:state.opacity});
  state.layers.lulc=L.imageOverlay("data/lulc_2026.png",lulcMeta.bounds,{opacity:state.opacity});
  state.layers.population=L.imageOverlay("data/vulnerable_population.png",populationMeta.bounds,{opacity:state.opacity});
  showLayer("lst");
  const group=L.geoJSON(geo,{style:f=>style(f.properties.Name),onEachFeature:(f,layer)=>{const name=f.properties.Name;state.features.set(name,layer);layer.bindTooltip(name,{sticky:true,className:"atlas-tooltip"});layer.on("click",()=>select(name));layer.on("mouseover",()=>layer.setStyle({weight:2.5,color:"#fff"}));layer.on("mouseout",()=>layer.setStyle(style(name)))}}).addTo(map);
  map.fitBounds(group.getBounds(),{padding:[14,14]});renderList(geo.features.map(f=>f.properties.Name).sort((a,b)=>a.localeCompare(b,"tr")));select(geo.features[0].properties.Name,false);
});
function renderList(names){const list=document.getElementById("list");list.replaceChildren(...names.map(name=>{const b=document.createElement("button");b.textContent=name.replace(" Mahallesi","");b.dataset.name=name;b.onclick=()=>select(name);return b}))}
document.getElementById("search").addEventListener("input",e=>{const q=e.target.value.toLocaleLowerCase("tr");document.querySelectorAll(".list button").forEach(b=>b.hidden=!b.dataset.name.toLocaleLowerCase("tr").includes(q))});
document.getElementById("thematic-layer").addEventListener("change",e=>showLayer(e.target.value));
document.getElementById("opacity").addEventListener("input",e=>{state.opacity=+e.target.value;state.layers[state.active]?.setOpacity(state.opacity)});
document.getElementById("series-filter").addEventListener("change",e=>{state.series=e.target.value;applySeriesFilter()});
document.getElementById("chart").addEventListener("load",applySeriesFilter);
