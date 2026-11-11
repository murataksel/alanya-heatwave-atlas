/* Viewport loading for the supplied Overture footprints. No risk or height is inferred. */
(() => {
'use strict';
window.createHeatwaveBuildingLayer=function(map,metadata,statusElement,selectionElement){
 const t=s=>window.ATLAS_I18N?.t(s)||s,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 statusElement.setAttribute('data-no-translate','');
 const number=n=>Number(n).toLocaleString(window.ATLAS_I18N?.locale||'en-GB');
 map.createPane('heatwaveBuildings');map.getPane('heatwaveBuildings').style.zIndex=450;
 const renderer=L.canvas({pane:'heatwaveBuildings',padding:.2}),cache=new Map();
 let enabled=false,generation=0,abort=null,timer=null,lastFeatures=[],currentFeature=null,currentLayer=null;
 const intersect=(a,b)=>a[0]<=b[2]&&a[2]>=b[0]&&a[1]<=b[3]&&a[3]>=b[1];
 function bbox(f){if(f.bbox)return f.bbox;const b=[Infinity,Infinity,-Infinity,-Infinity];function visit(c){if(typeof c[0]==='number'){b[0]=Math.min(b[0],c[0]);b[1]=Math.min(b[1],c[1]);b[2]=Math.max(b[2],c[0]);b[3]=Math.max(b[3],c[1]);}else c.forEach(visit);}visit(f.geometry.coordinates);f.bbox=b;return b;}
 function record(f){const p=f.properties,missing=t('Not supplied'),sources=p.sources||[];return '<div data-no-translate data-building-id="'+esc(p.id)+'"><b>'+esc(p.name||t('Building footprint'))+'</b><dl class="building-record"><dt>'+esc(t('Source ID'))+'</dt><dd>'+esc(p.id)+'</dd><dt>'+esc(t('Height (source)'))+'</dt><dd>'+esc(p.height_m==null?missing:number(p.height_m)+' m')+'</dd><dt>'+esc(t('Floors (source)'))+'</dt><dd>'+esc(p.num_floors==null?missing:number(p.num_floors))+'</dd><dt>'+esc(t('Data source'))+'</dt><dd>'+esc([...new Set(sources.map(s=>s.dataset).filter(Boolean))].join(' · ')||missing)+'</dd><dt>'+esc(t('Source update'))+'</dt><dd>'+esc([...new Set(sources.map(s=>s.update_time?.slice(0,10)).filter(Boolean))].join(' · ')||missing)+'</dd><dt>'+esc(t('Source licence'))+'</dt><dd>'+esc([...new Set(sources.map(s=>s.license).filter(Boolean))].join(' · ')||missing)+'</dd></dl><p class="micro-copy">'+esc(t('Reference geometry only; no building-level risk estimate.'))+'</p>'+(p.geometry_valid?'':'<p>'+esc(t('The source geometry is flagged as invalid; its footprint was not repaired.'))+'</p>');}
 const group=L.geoJSON(null,{pane:'heatwaveBuildings',renderer,style:{color:'#153f57',weight:1,fillColor:'#e5edf1',fillOpacity:.18,bubblingMouseEvents:false},onEachFeature:(f,l)=>{l.bindTooltip(()=>esc(f.properties.name||t('Building footprint')),{sticky:true});l.bindPopup(()=>record(f),{maxWidth:310});l.on('click',e=>{if(e.originalEvent)L.DomEvent.stopPropagation(e.originalEvent);currentFeature=f;currentLayer=l;selectionElement.innerHTML=record(f);window.ATLAS_I18N?.apply(selectionElement);});}});
 function status(message){statusElement.textContent=t(message);}
 async function refresh(){
  const id=++generation;if(abort)abort.abort();abort=new AbortController();const signal=abort.signal;
  if(!enabled){lastFeatures=[];group.clearLayers();status('Building layer off');return;}
  if(location.protocol==='file:'){status('Open the web version to load building footprints.');return;}
  if(map.getZoom()<metadata.min_display_zoom){lastFeatures=[];group.clearLayers();status('Zoom in to level 15 or closer to inspect buildings.');return;}
  const b=map.getBounds(),view=[b.getWest(),b.getSouth(),b.getEast(),b.getNorth()];
  const tiles=metadata.tiles.filter(c=>intersect(c.bbox,view));
  if(tiles.length>64){group.clearLayers();status('Zoom in further to load the building detail.');return;}
  status('Loading building footprints…');
  try{
   const collections=new Array(tiles.length);let next=0;
   async function worker(){while(next<tiles.length){if(id!==generation)return;const i=next++,tile=tiles[i];let fc=cache.get(tile.path);if(!fc){const response=await fetch(tile.path,{signal});if(!response.ok)throw Error('Building tile '+response.status);fc=await response.json();if(fc.type!=='FeatureCollection')throw Error('Invalid building tile');fc.features.forEach(bbox);cache.set(tile.path,fc);}else{cache.delete(tile.path);cache.set(tile.path,fc);}collections[i]=fc;}}
   await Promise.all(Array.from({length:Math.min(4,tiles.length)},worker));if(id!==generation)return;
   const seen=new Set(),features=[];for(const fc of collections)for(const f of fc.features)if(!seen.has(f.id)&&intersect(f.bbox,view)){seen.add(f.id);features.push(f);}
   while(cache.size>24)cache.delete(cache.keys().next().value);
   if(features.length>20000){group.clearLayers();status('Zoom in further to load the building detail.');return;}
   lastFeatures=features;const wanted=new Set(features.map(f=>f.id)),present=new Set();group.eachLayer(l=>{if(wanted.has(l.feature.id))present.add(l.feature.id);else group.removeLayer(l);});group.addData({type:'FeatureCollection',features:features.filter(f=>!present.has(f.id))});statusElement.textContent=t('Building footprints in view')+': '+number(features.length);
  }catch(error){if(id!==generation||error.name==='AbortError')return;lastFeatures=[];group.clearLayers();status('Building detail could not load. Toggle the layer to retry.');}
 }
 function schedule(){clearTimeout(timer);timer=setTimeout(refresh,120);}
 map.on('moveend zoomend',schedule);
 const attribution='© <a href="https://overturemaps.org/" target="_blank" rel="noopener">Overture Maps</a> / underlying contributors · <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noopener">ODbL</a>';
 function setEnabled(value){const next=!!value;if(next===enabled){refresh();return;}enabled=next;if(enabled){if(!map.hasLayer(group))group.addTo(map);map.attributionControl.addAttribution(attribution);}else{if(map.hasLayer(group))map.removeLayer(group);map.attributionControl.removeAttribution(attribution);}refresh();}
 window.addEventListener('atlas-language-change',()=>{if(currentFeature&&selectionElement.querySelector('[data-building-id]'))selectionElement.innerHTML=record(currentFeature);if(currentLayer?.isPopupOpen())currentLayer.setPopupContent(record(currentFeature));if(enabled&&map.getZoom()>=metadata.min_display_zoom&&lastFeatures.length)statusElement.textContent=t('Building footprints in view')+': '+number(lastFeatures.length);else schedule();});
 return {setEnabled,refresh,get enabled(){return enabled;}};
};
})();
