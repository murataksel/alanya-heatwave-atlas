/* Alanya Climate Risk Atlas v10. Presentation of supplied results only. */
(() => {
'use strict';
const A=window.ATLAS_DATA, D=A.hazard==='drought', $=id=>document.getElementById(id);
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(v,n=1)=>v===null||v===undefined||!Number.isFinite(Number(v))?'No data':Number(v).toLocaleString('en-GB',{maximumFractionDigits:n,minimumFractionDigits:n});
const withUnit=(v,unit,n=1)=>num(v)?fmt(v,n)+unit:'No data';
const nice=s=>s.replace(/^\d+_/,'').replaceAll('_',' ').replace(/\bml\b/gi,'ML').replace(/\bfwi\b/gi,'FWI').replace(/\bchelsa\b/gi,'CHELSA');
const num=v=>v!==null&&v!==undefined&&Number.isFinite(Number(v));
const median=arr=>{const a=arr.filter(num).map(Number).sort((a,b)=>a-b);return a.length?(a[Math.floor((a.length-1)/2)]+a[Math.ceil((a.length-1)/2)])/2:null;};
const table=k=>A.tables[k]||[];
const CROP=['Banana','Citrus','Avocado'], COLORS=['#cf8933','#238b85','#745e9b'];
const periods=['2021-2040','2041-2060','2061-2080','2081-2100'];
const models=['IPSL-CM6A-LR','MPI-ESM1-2-LR','MRI-ESM2-0'];
const modules=D?{
 water:{label:'Crop water & climate',sub:'23 native climate cells',title:'Agricultural water stress',kicker:'DROUGHT · CLIMATE SCREENING',status:'Inherited · audit required',description:'Explore the supplied crop-yield reductions, irrigation requirements and climatic water balance at their original model-cell scale.',source:'Legacy agricultural-drought outputs · MPI-M-MPI-ESM-LR / SMHI-RCA4 · RCP8.5, 2046–2050.',scope:'Supplied district: 1,577.46 km². 23 clipped native climate cells; no neighbourhood allocation.',warning:'<b>Preliminary inherited results.</b> The source audit identifies unresolved soil-water, rainfed-state, ET aggregation, solar-distance and calendar issues. Values are retained for traceability and need corrected recomputation before decision use.',tables:['Alanya_hazard_area_weighted_summary','monthly_inherited_irrigation_mm','Alanya_clipped_hazard_cells','Alanya_weighting_comparison'],figs:/yield_reduction|irrigation|precipitation|water_balance|ET0|AWC|study_domain/},
 production:{label:'Production exposure',sub:'Banana · Citrus · Avocado',title:'Where production is represented',kicker:'DROUGHT · EXPOSED PRODUCTION',status:'Partial spatial coverage',description:'Inspect crop-production source cells and the district fractions used in the supplied allocation. Missing source pixels remain unknown.',source:'User-supplied, locally modified MapSPAM rasters. The archive indicates a TURKSTAT update; calibration and source year are not independently documented.',scope:'44 intersecting production cells per crop, clipped to the supplied drought boundary. Uniform production within each source cell is assumed.',warning:'<b>Coverage matters.</b> These are known allocated production estimates, not official district totals. Production-grid valid area and hazard coverage of known production are different measures.',tables:['Alanya_crop_risk_summary','Alanya_weighting_comparison','Alanya_production_hazard_intersections'],figs:/production|study_domain/},
 economic:{label:'Conditional loss screening',sub:'Coverage & price sensitivity',title:'Agricultural economic screening',kicker:'DROUGHT · CONDITIONAL ECONOMIC EXPOSURE',status:'Conditional · source prices',description:'Explore production–hazard intersections and the supplied price sensitivity. Results inherit the unresolved drought-method issues.',source:'Crop-specific joins from the supplied corrected output tables; assumed prices of 1,000 / 500 / 3,500 USD/t for banana / citrus / avocado.',scope:'Known allocated production only. Prices have no documented reference year. Spatial loss density uses intersection area, not planted-crop area.',warning:'<b>Potential loss under source assumptions.</b> This is not observed damage or a validated forecast. Coverage is incomplete, price year is undocumented, and legacy hazard issues remain. The source audit corrected a historical banana/citrus join error by crop name.',tables:['Alanya_crop_risk_summary','Alanya_price_sensitivity','Alanya_production_hazard_intersections','method_and_data_audit'],figs:/revenue|risk_summary|production_density/}
}: {
 weather:{label:'Fire weather',sub:'FWI · CMIP6 response',title:'A changing fire-weather climate',kicker:'WILDFIRES · METEOROLOGICAL DANGER',status:'Conditional weather response',description:'Inspect six native weather cells and the temperature–precipitation response of annual FWI exceedance and fire-season length.',source:'Public FWI response series, 1981–2010 · three selected CMIP6 models · SSP2-4.5 / SSP5-8.5. This is separate from the RF models.',scope:'Working wildfire district: 1,498.61 km². Six native weather-cell intersections. Baseline district-area-mean FWI has its own extremes.',warning:'<b>Weather exceedance, not fire occurrence.</b> PE is the fitted annual probability that maximum daily FWI exceeds 60. Temperature/precipitation perturbations omit explicit future changes in wind, humidity and vegetation. Two late-century SSP5-8.5 model cases are outside the response domain and remain missing.',tables:['response_historical_gumbel','response_cmip6_projections','response_projection_model_spread','response_surface_table','response_polynomial_diagnostics'],figs:/30_response|31_response|32_response|33_response|34_response|35_response|43_response/},
 exposure:{label:'Population & assets',sub:'Weather-cell intersections',title:'Exposure to fire-weather conditions',kicker:'WILDFIRES · SCENARIO EXPOSURE',status:'Exposure only',description:'View supplied infrastructure in native weather cells and the population living in cells above annual meteorological-danger thresholds.',source:'SSP2 / SSP5 population-count rasters and supplied electricity, fibre, major-road and energy-facility geometries, intersected with native FWI cells.',scope:'Population years 2030 / 2050 / 2070 / 2090 match four climate periods. Counts are integrated by source-pixel fractions; scenario population is not a current census.',warning:'<b>Exposure is not damage.</b> People shown live in weather cells above a PE threshold; they are not estimates of people burned, evacuated or injured. Line lengths describe supplied geometry. Asset fragility, replacement values, network connectivity and service-population data were not supplied.',tables:['response_affected_population_summary','response_infrastructure_weather_summary','response_energy_facility_weather_exposure','response_population_counterfactual_summary','response_ssp_population_totals'],figs:/36_response|37_response|38_response|44_response/},
 evidence:{label:'Evidence & infrastructure',sub:'Inventory · observations · scope',title:'Local evidence and mapped assets',kicker:'WILDFIRES · OBSERVATIONS & INVENTORY',status:'Source coverage retained',description:'Explore the supplied infrastructure inventory, selected institutional resources and the EFFIS wildland–urban-interface indicator.',source:'Supplied GIS layers; selected institutional coordinates; MODIS detected burned area, 2001–2024; EFFIS WUI source indicator.',scope:'Working wildfire district: 1,498.61 km². Supplied alternative district: 1,470.34 km², retained only as context. Neither is asserted to resolve the boundary discrepancy.',warning:'<b>Inventory and observations have different scopes.</b> Infrastructure is partial and its operating status is unverified. Institutional point coordinates have an unspecified datum. MODIS detected area is neither an incident count nor an official forestry-area total; September 2023 and July 2024 are missing.',tables:['gis_district_inventory','gis_boundary_comparison','gis_boundary_sensitivity_inventory','ml_modis_district_annual_detected_area','forestry_unit_history_summary','local_resource_coordinate_checks'],figs:/institutional|fire_counts|local_resources|rasterized_historical|observation_coverage|gis_|worldcover|interface|proximity|effis/},
 experimental:{label:'Exploratory ML models',sub:'ECLIPS & CHELSA · validation limits',title:'Inspect the model experiments',kicker:'WILDFIRES · RESEARCH METHOD EXAMPLES',status:'Validation failed / unavailable',description:'Inspect source susceptibility, ordinal hazard and vulnerability-based risk maps without interpreting RF scores as calibrated fire probabilities.',source:'Random Forest method examples with fixed CORINE 2000. ECLIPS climate branch and explicit nine-predictor CHELSA sensitivity are separate experiments.',scope:'Native MODIS grid ≈463 m; aligning CHELSA climate data to this grid does not add climate information. Source cell values are retained for inspection.',warning:'<b>Research examples; unsuitable for decision use.</b> ECLIPS has only 11 positive training cells and failed later-period discrimination (AUROC 0.191). CHELSA excludes SWE and has no positive held-out labels, so temporal AUROC is undefined. Future climate novelty is substantial. RF scores are not annual or cumulative fire probabilities.',tables:['ml_model_validation','chelsa_model_validation','ml_future_scenario_summary','chelsa_future_summary','ml_hazard_class_area_all_scenarios','chelsa_hazard_class_areas','ml_risk_class_areas','road_risk_uncertainty_length_summary'],figs:/hazard_|susceptibility|chelsa_|ml_change|change_predictors|feature_importance|risk|terrain|fuel_type/}
};
const state={module:D?'water':'weather',view:'explorer',crop:'Banana',indicator:'yield',price:'1',scenario:'historical',period:'2041-2060',model:'median',weatherMetric:'pe_percent',evidence:'infrastructure',family:'ECLIPS',configuration:'HIST_199110',mlMetric:'hazard',table:'',page:0};
let currentRaster=null, rasterLayer=null, rasterToken=0, legend=null, overlayControl=null, currentSpec=null;
const rasterCache=new Map(), sourceLayers=[];
const map=L.map('evidence-map',{preferCanvas:true,zoomControl:true,scrollWheelZoom:false,zoomSnap:.25,zoomDelta:.5}).setView([36.54,32.17],10);
const basemap=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'});
basemap.on('tileerror',()=>{$('map-network-status').textContent='Basemap unavailable · analytical layers remain visible';});
basemap.on('tileload',()=>{$('map-network-status').textContent='';});
L.control.scale({imperial:false,position:'bottomright'}).addTo(map);
const baseBoundary=D?A.geo.Alanya_boundary:A.geo['Working district'];
const boundary=L.geoJSON(baseBoundary,{interactive:false,style:{color:'#284f59',weight:1.7,fill:false}}).addTo(map);
const extent=boundary.getBounds();
// A local coordinate reference remains usable without external map tiles.
const grid=L.layerGroup().addTo(map),bounds=extent.pad(.12);
for(let lat=Math.floor(bounds.getSouth()*10)/10;lat<=bounds.getNorth();lat+=.1){
 L.polyline([[lat,bounds.getWest()],[lat,bounds.getEast()]],{interactive:false,color:'#afc2b6',weight:.6,opacity:.6,dashArray:'2 5'}).addTo(grid);
 if(lat>extent.getSouth()+.025&&lat<extent.getNorth()-.025)L.marker([lat,extent.getWest()+.015],{interactive:false,icon:L.divIcon({className:'coordinate-label',html:fmt(lat,1)+'°N',iconSize:[38,12],iconAnchor:[-2,5]})}).addTo(grid);
}
for(let lon=Math.ceil((bounds.getWest()+.09)*5)/5;lon<=bounds.getEast();lon+=.2){
 L.polyline([[bounds.getSouth(),lon],[bounds.getNorth(),lon]],{interactive:false,color:'#afc2b6',weight:.6,opacity:.6,dashArray:'2 5'}).addTo(grid);
 L.marker([extent.getNorth()-.005,lon],{interactive:false,icon:L.divIcon({className:'coordinate-label',html:fmt(lon,1)+'°E',iconSize:[38,12],iconAnchor:[18,-1]})}).addTo(grid);
}
grid.setZIndex?.(0);boundary.bringToFront();
const fit=()=>map.fitBounds(extent,{padding:[22,22]});fit();
map.on('click',e=>{if(currentRaster)inspectRaster(e.latlng);});
const opacity=()=>Number($('layer-opacity').value)/100;
function field(label,id,options,value,fn){
 const wrap=document.createElement('label');wrap.textContent=label;
 const select=document.createElement('select');select.id=id;select.setAttribute('aria-label',label);
 options.forEach(o=>{const [v,t]=Array.isArray(o)?o:[o,o];const op=document.createElement('option');op.value=v;op.textContent=t;select.append(op);});
 select.value=value;select.addEventListener('change',()=>fn(select.value));wrap.append(select);$('explorer-controls').append(wrap);
}
function controls(){
 $('explorer-controls').replaceChildren();
 if(D){
  field('Crop','crop-select',CROP,state.crop,v=>{state.crop=v;update();});
  const opts=state.module==='water'?[['yield','Yield reduction (%)'],['irrigation','Irrigation requirement (mm/year)'],['precip','Annual precipitation (mm/year)'],['ET0','Reference ET₀ (mm/year)'],['balance','Climatic water balance (mm/year)'],['AWC','Soil available water capacity (mm/m)']]:state.module==='production'?[['production','Allocated production (t)'],['density','Production density (t/km²)']]:[['loss_density','Potential loss density (kUSD/km²)'],['loss','Potential loss (USD)'],['yield','Yield reduction (%)']];
  if(!opts.some(o=>o[0]===state.indicator))state.indicator=opts[0][0];
  field('Mapped indicator','indicator-select',opts,state.indicator,v=>{state.indicator=v;update();});
  if(state.module==='economic')field('Source-price assumption','price-select',[['0.8','80% of source price'],['1','100% · source price'],['1.2','120% of source price']],state.price,v=>{state.price=v;update();});
 } else if(['weather','exposure'].includes(state.module)){
  field('Climate pathway','pathway-select',[['historical','Historical · 1981–2010'],['ssp245','SSP2-4.5'],['ssp585','SSP5-8.5']],state.scenario,v=>{state.scenario=v;update();});
  if(state.scenario!=='historical'){
   field('Climate period','period-select',periods,state.period,v=>{state.period=v;update();});
   field('Climate model','model-select',[['median','Median of available models'],...models],state.model,v=>{state.model=v;update();});
  }
  field('Mapped indicator','weather-indicator',[['pe_percent','Annual PE: maximum FWI >60 (%)'],['fsl_mean_days','Fire-season length (days/year)']],state.weatherMetric,v=>{state.weatherMetric=v;update();});
 } else if(state.module==='evidence'){
  field('Evidence layer','evidence-select',[['infrastructure','Supplied infrastructure'],['resources','Selected institutional resources'],['wui','EFFIS WUI source indicator']],state.evidence,v=>{state.evidence=v;update();});
 } else {
  field('Model experiment','family-select',[['ECLIPS','ECLIPS · failed temporal discrimination'],['CHELSA','CHELSA · 9 predictors, unvalidated']],state.family,v=>{state.family=v;state.configuration=v==='ECLIPS'?'HIST_199110':'HIST_1991_2020';update();});
  const configs=[...new Set(A.rasters.filter(r=>r.family===state.family).map(r=>r.configuration))];
  const confLabel=c=>c.startsWith('HIST')?'Historical · '+(state.family==='ECLIPS'?'1991–2010':'1991–2020'):c.replace('RCP45','RCP4.5').replace('RCP85','RCP8.5').replace('_CLMcom_CCLM_',' · CCLM · ').replace('_CSC_REMO2009_',' · REMO2009 · ').replace('202140','2021–2040').replace('204160','2041–2060').replace('2021_2040','2021–2040').replace('2041_2060','2041–2060').replace('2061_2080','2061–2080');
  field('Scenario & climate period','ml-configuration',configs.map(c=>[c,confLabel(c)]),state.configuration,v=>{state.configuration=v;update();});
  const opts=[['hazard','Ordinal hazard (classes 0–6)'],['susceptibility','Relative RF score (0–1)'],['risk_population','Population risk (classes 0–4)'],['risk_economic','Economic risk (classes 0–4)'],['risk_ecological','Ecological risk (classes 0–4)'],['risk_ecological_economic','Ecological–economic risk (0–4)']];
  if(!state.configuration.startsWith('HIST'))opts.push(['climate_novelty','Outside training climate (0/1)'],['change','RF score change from historical']);
  if(!opts.some(o=>o[0]===state.mlMetric))state.mlMetric='hazard';
  field('Mapped result','ml-indicator',opts,state.mlMetric,v=>{state.mlMetric=v;update();});
 }
}
function cards(items){$('summary-cards').innerHTML=items.map(([label,value,note])=>`<article class="evidence-card"><span class="metric-label">${E(label)}</span><strong>${E(value)}</strong><small>${E(note)}</small></article>`).join('');}
const cropRow=()=>table('Alanya_crop_risk_summary').find(r=>r.crop===state.crop);
const droughtSummary=(indicator,crop='all')=>table('Alanya_hazard_area_weighted_summary').find(r=>r.indicator===indicator&&r.crop===crop);
function droughtCards(){
 const r=cropRow(),ir=droughtSummary('irr',state.crop);
 if(state.module==='water'){
  const w=table('Alanya_weighting_comparison').find(r=>r.crop===state.crop);
  cards([['Inherited yield reduction',fmt(w.district_land_area_weighted_loss_pct)+'%','District-land-area weighted · '+state.crop],['Inherited irrigation requirement',fmt(ir?.mean,0)+' mm/year','District-land-area weighted · not a water-supply volume'],['Modelled hazard coverage',fmt(w.hazard_coverage_district_area_pct)+'%','Of district land area · unknown cells retained']]);
 }else if(state.module==='production')cards([['Known allocated production',fmt(r.known_allocated_production_t,0)+' t','Source-grid allocation · '+state.crop],['Valid production-grid area',fmt(r.production_cell_valid_area_pct)+'%','Of crop production-cell area inside the district'],['Hazard coverage of production',fmt(r.hazard_coverage_of_known_production_pct)+'%','Of known allocated production · differs from land coverage']]);
 else cards([['Conditional potential loss',fmt(r.potential_loss_known_USD*Number(state.price)/1e6,2)+' million USD','Known production only · source-price year undocumented'],['Production-weighted reduction',fmt(r.production_weighted_loss_pct)+'%','Valid production–hazard intersections · '+state.crop],['Assumed crop price',fmt(r.price_USD_t*Number(state.price),0)+' USD/t','Sensitivity assumption · no market-price update']]);
}
function weatherRows(cell){
 if(state.scenario==='historical')return table('response_historical_gumbel').filter(r=>String(r.cell)===String(cell));
 return table('response_cmip6_projections').filter(r=>String(r.cell)===String(cell)&&r.scenario===state.scenario&&r.period===state.period&&(state.model==='median'||r.model===state.model));
}
function weatherValue(cell,key){return median(weatherRows(cell).map(r=>r[key]));}
function futurePopulationRows(){return table('response_affected_population_summary').filter(r=>r.scenario===state.scenario&&r.period===state.period&&(state.model==='median'||r.model===state.model));}
function fireCards(){
 if(state.module==='weather'){
  const rows=weatherRows('district_area_mean'),n=rows.filter(r=>num(r.pe_percent)).length;
  cards([['Annual weather exceedance',withUnit(weatherValue('district_area_mean','pe_percent'),'%'),'P(max daily FWI >60) · district-area-mean series'],['Fire-season length',withUnit(weatherValue('district_area_mean','fsl_mean_days'),' days'),'Baseline fixed cutoff · district-area-mean series'],['Climate support',state.scenario==='historical'?'30 years':n+' / '+(state.model==='median'?3:1)+' models',state.scenario==='historical'?'1981–2010 · six native weather cells':n===0?'Outside response domain · source values remain missing':n<3&&state.model==='median'?'Incomplete ensemble · model spread not assessable':'Bounded response · 0…5°C; −40…+60% precipitation']]);
 }else if(state.module==='exposure'){
  if(state.scenario==='historical')cards([['Electricity lines', '104.29 km','Supplied geometry · partial infrastructure inventory'],['Fibre routes','69.08 km','Supplied geometry · current operation unverified'],['Major roads','154.62 km','Supplied geometry · no network-service model']]);
  else{const rr=futurePopulationRows(),n=rr.filter(r=>num(r.people_in_cells_annual_pe_gt_20)).length;cards([['Scenario population',fmt(median(rr.map(r=>r.total_scenario_people)),0),rr[0]?rr[0].population_scenario+' · population year '+rr[0].population_year:'No matching data'],['People in PE >20% cells',fmt(median(rr.map(r=>r.people_in_cells_annual_pe_gt_20)),0),'Weather-cell exposure · '+n+' contributing model(s)'],['People in PE >50% cells',fmt(median(rr.map(r=>r.people_in_cells_annual_pe_gt_50)),0),'Threshold is annual meteorological PE, not ignition risk']]);}
 }else if(state.module==='evidence')cards([['Supplied linear assets','327.99 km','Electricity + fibre + major roads · source geometry'],['Energy-facility geometries','4','Capacity units / operating status are not fully documented'],['Selected institutional points','16','Source-listed resources · datum unspecified; not exhaustive']]);
 else{
  const e=state.family==='ECLIPS',r=(e?table('ml_future_scenario_summary'):table('chelsa_future_summary')).find(r=>r.configuration===state.configuration);
  cards([['Positive native training cells',e?'11':'118',e?'Balanced sample: 22 cells · severe training limitation':'9 predictors · SWE excluded after spatial QA'],['Temporal validation',e?'AUROC 0.191':'Undefined',e?'Later-period discrimination failed':'No positive held-out labels in 2021–2024'],['Future climate novelty',r?fmt(100*(r.cells_outside_training_climate_fraction??r.outside_training_climate_fraction))+'%':'Historical',r?'Cells outside training climate · extrapolation warning':e?'Climate reference 1991–2010 · fire training 2001–2010':'Climate reference 1991–2020 · fire training 2001–2020']]);
 }
}
function clearMap(){
 ++rasterToken;currentRaster=null;currentSpec=null;
 sourceLayers.splice(0).forEach(l=>map.removeLayer(l));
 if(rasterLayer){map.removeLayer(rasterLayer);rasterLayer=null;}
 if(legend){legend.remove();legend=null;}if(overlayControl){overlayControl.remove();overlayControl=null;}
 map.closePopup();$('selected-feature').innerHTML='<b>Inspect the source values</b><p>Click a mapped cell, line or point. Grey areas are explicitly classified or unknown as stated in the legend.</p>';
}
function blend(palette,v,min,max){
 if(!num(v))return '#aeb8b3';let f=Math.max(0,Math.min(1,(v-min)/(max-min)))*(palette.length-1),i=Math.floor(f),w=f-i;
 const a=palette[i],b=palette[Math.min(i+1,palette.length-1)],rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
 return '#'+rgb(a).map((x,j)=>Math.round(x*(1-w)+rgb(b)[j]*w).toString(16).padStart(2,'0')).join('');
}
function showLegend(spec){
 if(legend)legend.remove();legend=L.control({position:'bottomleft'});legend.onAdd=()=>{
  const el=L.DomUtil.create('div','atlas-map-legend');L.DomEvent.disableClickPropagation(el);L.DomEvent.disableScrollPropagation(el);
  let body=spec.categories?spec.categories.map(([c,t])=>`<div class="legend-category"><i style="background:${c}"></i>${E(t)}</div>`).join(''):`<div class="legend-ramp" style="background:linear-gradient(90deg,${spec.palette.join(',')})"></div><div class="legend-ticks"><span>${fmt(spec.min,spec.decimals??0)}</span><span>${fmt(spec.max,spec.decimals??0)} ${E(spec.unit||'')}</span></div>`;
  el.innerHTML=`<strong>${E(spec.title)}</strong>${body}<span class="legend-source">${E(spec.note||'Grey: no data · source scale retained')}</span>`;return el;
 };legend.addTo(map);
}
function inspect(title,rows,position){
 const html=`<b>${E(title)}</b><dl>${rows.map(([k,v])=>`<dt>${E(k)}</dt><dd>${E(v)}</dd>`).join('')}</dl>`;
 $('selected-feature').innerHTML=html;
 if(position)L.popup({maxWidth:285}).setLatLng(position).setContent(`<b>${E(title)}</b>${rows.slice(0,4).map(([k,v])=>`${E(k)}: ${E(v)}`).join('<br>')}`).openOn(map);
}
function geoLayer(g,color='#358a87',extra={}){
 const layer=L.geoJSON(g,{style:f=>({color,weight:1.7,fillOpacity:.1,...(extra.style?extra.style(f):{})}),pointToLayer:(f,ll)=>L.circleMarker(ll,{radius:5,weight:1.5,color:'#fff',fillColor:color,fillOpacity:.95}),onEachFeature:(f,l)=>{
  l.on('click',e=>{L.DomEvent.stopPropagation(e);const p=f.properties;inspect(p.name||p.label||p.asset_id||p.resource_type||'Source feature',Object.entries(p).filter(([k,v])=>v!==null&&k!=='fid').slice(0,12).map(([k,v])=>[nice(k),typeof v==='number'?fmt(v,2):v]),e.latlng);});
 }});sourceLayers.push(layer);return layer;
}
function droughtMap(){
 const crop=state.crop,pal=['#fff1b8','#f5be68','#e78649','#bd4b3d','#7c2647'];let g,field,title,unit,min,max,dec=0;
 if(state.module==='water'){
  g=A.geo.climate_hazard_cells;
  [field,title,unit,min,max]=({yield:['loss_'+crop,'Yield reduction','%',0,50],irrigation:['irr_'+crop,'Irrigation requirement','mm/year',0,1800],precip:['precip','Annual precipitation','mm/year',800,2000],ET0:['ET0','Reference ET₀','mm/year',1200,1800],balance:['P_minus_ET0','Climatic water balance','mm/year',-650,650],AWC:['AWC','Soil available water','mm/m',100,360]})[state.indicator];
 }else if(state.module==='production'){
  g=A.geo['production_'+crop];field=state.indicator==='density'?'production_density_t_km2':'production_district_t';title=state.indicator==='density'?'Production density':'Allocated production';unit=state.indicator==='density'?'t/km²':'t';
  min=0;max=Math.max(...CROP.flatMap(c=>A.geo['production_'+c].features.map(f=>f.properties[field]||0)));
 }else{
  g={type:'FeatureCollection',features:A.geo.production_hazard_intersections.features.filter(f=>f.properties.crop===crop)};
  field=state.indicator==='loss_density'?'loss_density_kUSD_km2':state.indicator==='loss'?'loss_USD':'yield_loss_pct';title=state.indicator==='loss_density'?'Potential loss density':state.indicator==='loss'?'Potential loss':'Yield reduction';unit=state.indicator==='loss_density'?'kUSD/km²':state.indicator==='loss'?'USD':'%';min=0;max=state.indicator==='yield'?50:Math.max(...A.geo.production_hazard_intersections.features.map(f=>f.properties[field]||0))*Number(state.price);
 }
 let palette=state.indicator==='balance'?['#ad3e39','#e4a76b','#f6f0d4','#8ec9ba','#1d7883']:state.indicator==='precip'?['#f4f0d5','#bfd8c7','#71b7ac','#2f8d94','#17546e']:pal;
 const value=p=>num(p[field])?p[field]*(state.module==='economic'&&state.indicator!=='yield'?Number(state.price):1):null;
 const layer=L.geoJSON(g,{style:f=>({color:'#6c7770',weight:.65,fillColor:blend(palette,value(f.properties),min,max),fillOpacity:opacity(),dashArray:num(value(f.properties))?null:'3 3'}),onEachFeature:(f,l)=>{
  const p=f.properties,id=p.cell_id??p.source_id;
  l.bindTooltip(`${E(crop)} · ${E(title)}: ${fmt(value(p))} ${E(unit)}`,{sticky:true});
  l.on('click',e=>{L.DomEvent.stopPropagation(e);const rows=[[title,fmt(value(p),2)+' '+unit],['Crop',crop],['Source cell',id],['Clipped area',fmt(p.area_km2??p.district_area_m2/1e6,3)+' km²']];
   if(state.module==='water')rows.push(['Period / pathway','2046–2050 · RCP8.5'],['Weighting','District land area'],['Method status','Inherited · unresolved audit issues']);
   else if(state.module==='production')rows.push(['Known allocated production',fmt(p.production_district_t,2)+' t'],['Source pixel valid',p.valid?'Yes':'Unknown'],['Within-cell assumption','Uniform production']);
   else rows.push(['Allocated production',fmt(p.production_t,2)+' t'],['Assumed price',fmt(p.price_USD_t*Number(state.price),0)+' USD/t'],['Yield reduction',fmt(p.yield_loss_pct,2)+'%'],['Potential loss',fmt(p.loss_USD*Number(state.price),0)+' USD'],['Price reference year','Undocumented']);
   inspect('Source '+(state.module==='economic'?'intersection':state.module==='water'?'climate cell':'production cell')+' '+id,rows,e.latlng);
  });
 }}).addTo(map);sourceLayers.push(layer);currentSpec={title,unit,min,max,palette,decimals:dec,note:'Grey / dashed: unknown · no smoothing'};showLegend(currentSpec);boundary.bringToFront();
 $('map-caption').textContent=state.module==='water'?'Native climate-cell intersections are retained. Crop yield and irrigation are inherited model outputs with unresolved audit findings.':'Source geometries are clipped, not redistributed to neighbourhoods. The colour scale is fixed across crops within each indicator and price assumption.';
}
function weatherGeo(){return {type:'FeatureCollection',features:A.geo['Native weather cells'].features.map(f=>({...f,properties:{...f.properties,mapped:weatherValue(f.properties.native_index,state.weatherMetric),models:weatherRows(f.properties.native_index).filter(r=>num(r[state.weatherMetric])).length}}))};}
function weatherMap(){
 const metric=state.weatherMetric,pe=metric==='pe_percent',pal=pe?['#fff0b1','#f9c077','#ed8c5b','#c4504a','#852947']:['#e3f0dc','#a8d0ba','#67b0a5','#2d858e','#16596e'];
 const min=0,max=pe?100:140,title=pe?'Annual PE: max FWI >60':'Fire-season length',unit=pe?'%':'days/year';
 const g=weatherGeo(),layer=L.geoJSON(g,{style:f=>({color:'#5d746e',weight:1,fillColor:blend(pal,f.properties.mapped,min,max),fillOpacity:opacity(),dashArray:num(f.properties.mapped)?null:'4 3'}),onEachFeature:(f,l)=>{
  const p=f.properties;l.bindTooltip(`Weather cell ${p.native_index} · ${fmt(p.mapped)} ${unit}`,{sticky:true});l.on('click',e=>{L.DomEvent.stopPropagation(e);inspect('Native weather cell '+p.native_index,[[title,fmt(p.mapped,2)+' '+unit],['Annual PE (FWI >60)',fmt(weatherValue(p.native_index,'pe_percent'),2)+'%'],['Fire-season length',fmt(weatherValue(p.native_index,'fsl_mean_days'),2)+' days/year'],['Climate period',state.scenario==='historical'?'1981–2010':state.period],['Model support',state.scenario==='historical'?'30 historical years':p.models+' available model(s)'],['Interpretation','Meteorological danger only']],e.latlng);});
 }}).addTo(map);sourceLayers.push(layer);
 if(state.module==='exposure'){
  const attachWeather=g=>({type:'FeatureCollection',features:g.features.map(f=>({...f,properties:{...f.properties,annual_weather_PE_percent:weatherValue(f.properties.cell,'pe_percent'),fire_season_days:weatherValue(f.properties.cell,'fsl_mean_days'),climate_period:state.scenario==='historical'?'1981–2010':state.period,interpretation:'Weather-cell exposure only; no asset-failure model'}}))});
  const lines=geoLayer(attachWeather(A.geo['Weather-cell line segments']),'#234f5a',{style:f=>({color:blend(['#345876','#567e89','#cf513a'],weatherValue(f.properties.cell,'pe_percent'),0,100),weight:f.properties.layer==='elektrik'?3.8:2.3,fill:false})}).addTo(map);
  const points=geoLayer(attachWeather(A.geo['Weather-cell energy facilities']),'#253a58').addTo(map);
  overlayControl=L.control.layers(null,{'Supplied lines':lines,'Energy facilities':points},{collapsed:true,position:'topright'}).addTo(map);
 }
 showLegend({title,unit,min,max,palette:pal,note:'Grey: unavailable / outside response domain'});boundary.bringToFront();
 $('map-caption').textContent='Six source weather cells, clipped to the working district. PE is an annual meteorological exceedance probability. A district-area-mean series cannot be reconstructed by averaging cell extreme probabilities.';
 $('exposure-note').hidden=state.module!=='exposure';
 if(state.module==='exposure')$('exposure-note').innerHTML=state.scenario==='historical'?'<b>Baseline interpretation.</b> The map uses 1981–2010 weather. Choose an SSP pathway to inspect future scenario population. The 2020 population rasters are scenario inputs; they are not official contemporary resident counts.':'<b>Population and climate remain separate assumptions.</b> SSP2 population is paired with SSP2-4.5 and SSP5 with SSP5-8.5. Population years 2030, 2050, 2070 and 2090 represent the four climate periods. The source tables also include a fixed-2020-population counterfactual. In late-century SSP5-8.5 only one climate model remains in the response domain.';
}
function evidenceMap(){
 const overlays={},styles={'Electricity lines':'#dc7436','Fibre routes':'#785e9a','Supplied major roads':'#335c72','Rivers':'#499eb5','Energy facilities':'#ad3939','Settlements':'#558267','District centres':'#233e4e','Supplied alternative district boundary':'#876e4d','Selected institutional resources':'#218578','EFFIS WUI source indicator':'#a4497c'};
 Object.entries(styles).forEach(([name,col])=>{
  const l=geoLayer(A.geo[name],col,{style:f=>name==='Supplied alternative district boundary'?{fill:false,dashArray:'6 5',weight:1.5}:name==='EFFIS WUI source indicator'?{fillColor:blend(['#f1eedc','#d3afc4','#9f447b'],f.properties.wui_indicator,0,.2),fillOpacity:opacity(),color:'#866b78',weight:.2}:{fillOpacity:.15}});overlays[name]=l;
  const enabled=state.evidence==='infrastructure'?['Electricity lines','Fibre routes','Energy facilities','Supplied major roads'].includes(name):state.evidence==='resources'?name==='Selected institutional resources':name==='EFFIS WUI source indicator';
  if(enabled)l.addTo(map);
 });
 overlayControl=L.control.layers(null,overlays,{position:'topright',collapsed:true}).addTo(map);
 showLegend(state.evidence==='wui'?{title:'EFFIS WUI source indicator',palette:['#f1eedc','#d3afc4','#9f447b'],min:0,max:.2,decimals:2,note:'Native indicator · not fire probability'}:{title:'Evidence layers',categories:state.evidence==='infrastructure'?[['#dc7436','Electricity lines'],['#785e9a','Fibre routes'],['#335c72','Major roads'],['#ad3939','Energy facilities']]:[['#218578','Selected institutional points']],note:'Use Layers to show additional sources'});
 $('map-caption').textContent=state.evidence==='resources'?'Selected institutional coordinates are retained, including points outside the working district. Their source datum is unspecified; verify positions before operational use.':'Declared ED50/WGS84 infrastructure layers were transformed upstream. Missing or ambiguous source CRS layers were excluded from quantitative metrics. The alternative district boundary is context only.';
}
function getRaster(r){
 if(rasterCache.has(r.id))return Promise.resolve(rasterCache.get(r.id));
 return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=r.native;script.onload=()=>{const d=window.ATLAS_RASTER_PENDING;if(!d||d.id!==r.id){reject(Error('Native raster identity mismatch'));return;}rasterCache.set(r.id,d);script.remove();resolve(d);};script.onerror=()=>{script.remove();reject(Error('Cannot load native raster values'));};document.head.append(script);});
}
async function mlMap(){
 const metric=state.mlMetric==='change'?(state.family==='ECLIPS'?'susceptibility_change':'score_change'):state.mlMetric;
 const r=A.rasters.find(r=>r.family===state.family&&r.configuration===state.configuration&&r.metric===metric);if(!r)throw Error('Requested source raster is unavailable');
 const token=rasterToken;rasterLayer=L.imageOverlay(r.image,r.bounds,{opacity:opacity(),interactive:false}).addTo(map);boundary.bringToFront();
 let categories;
 if(r.kind==='hazard')categories=r.palette.map((c,i)=>[c,['0 · Non-burnable (CLC)','1 · Very low','2 · Low','3 · Medium','4 · High','5 · Very high','6 · Extreme'][i]]);
 if(r.kind==='risk')categories=r.palette.map((c,i)=>[c,['0 · Non-burnable / not modelled','1 · Low','2 · Moderate-low','3 · Moderate-high','4 · High'][i]]);
 if(r.kind==='novelty')categories=r.palette.map((c,i)=>[c,i?'1 · Outside training climate':'0 · Within training climate']);
 showLegend({title:r.title,categories,palette:r.palette,min:r.min,max:r.max,decimals:1,note:'Transparent: no data · exploratory model'});
 $('map-caption').textContent='Nearest-neighbour display of the supplied native MODIS-grid raster (≈463 m). Click to inspect the original cell value. RF validation limitations apply to all hazard, risk and change layers. Ordinal classes have no physical loss unit.';
 $('selected-feature').innerHTML='<b>Loading native cell values…</b><p>The displayed image retains the source classification. Native values will be available for point inspection.</p>';
 const data=await getRaster(r);if(token!==rasterToken)return;currentRaster={...r,data};$('selected-feature').innerHTML='<b>Inspect the native raster</b><p>Click within a coloured cell. Queries use the original raster grid, independently of the rendered map image.</p>';
}
function inspectRaster(ll){
 const r=currentRaster,d=r.data,R=d.radius,lat=ll.lat*Math.PI/180,lon=ll.lng*Math.PI/180;
 const x=R*lon*Math.cos(lat),y=R*lat,[a,b,c,dd,e,f]=d.transform,det=a*e-b*dd,col=Math.floor((e*(x-c)-b*(y-f))/det),row=Math.floor((-dd*(x-c)+a*(y-f))/det);
 const valid=col>=0&&row>=0&&col<d.width&&row<d.height,val=valid?d.values[row*d.width+col]:null;
 inspect(r.title,[['Native value',num(val)?fmt(val,r.kind==='hazard'||r.kind==='risk'||r.kind==='novelty'?0:4):'No source data'],['Grid cell',valid?'row '+row+' · col '+col:'Outside raster'],['Model branch',r.family],['Configuration',r.configuration],['Validation',r.family==='ECLIPS'?'Later-period discrimination failed':'Unvalidated · no positive held-out labels'],['Interpretation','Research example only']],ll);
}
function chart(title,traces,layout,caption){
 $('chart-title').textContent=title;$('chart-caption').textContent=caption;
 Plotly.react('analysis-chart',traces,{margin:{t:12,r:12,b:43,l:48},paper_bgcolor:'transparent',plot_bgcolor:'transparent',font:{family:'Arial, sans-serif',size:10,color:'#3b5866'},showlegend:false,xaxis:{linecolor:'#c8d4ce',gridcolor:'#e7ebe5',automargin:true},yaxis:{gridcolor:'#e7ebe5',zerolinecolor:'#bac9c1',automargin:true},...layout},{responsive:true,displaylogo:false,modeBarButtonsToRemove:['select2d','lasso2d'],toImageButtonOptions:{format:'png',filename:'Alanya_'+A.hazard+'_'+state.module,scale:2}});
}
function droughtChart(){
 if(state.module==='water'){
  const names=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  chart('Inherited irrigation seasonality',CROP.map((c,i)=>({x:names,y:table('monthly_inherited_irrigation_mm').filter(r=>r.crop===c).sort((a,b)=>a.month-b.month).map(r=>r.net_irrigation_mm),name:c,mode:'lines+markers',type:'scatter',line:{color:COLORS[i],width:c===state.crop?3:1.3},marker:{size:c===state.crop?5:3},opacity:c===state.crop?1:.45,hovertemplate:c+' · %{x}<br>%{y:.1f} mm<extra></extra>'})),{showlegend:true,legend:{orientation:'h',y:1.15,x:0,font:{size:9}},yaxis:{title:{text:'mm/month',font:{size:10}},gridcolor:'#e7ebe5',rangemode:'tozero'}},'District-land-area weighted, not planted-crop-area weighted. Inherited irrigation calculations share the unresolved legacy method issues.');
 }else if(state.module==='production'){
  const r=cropRow();chart('Known production and hazard coverage',[{type:'bar',x:['Known allocated','With valid hazard'],y:[r.known_allocated_production_t,r.production_with_valid_hazard_t],marker:{color:['#b4c9c0','#278a82']},hovertemplate:'%{x}<br>%{y:,.1f} t<extra></extra>'}],{yaxis:{title:{text:'tonnes',font:{size:10}},gridcolor:'#e7ebe5',rangemode:'tozero'}},'Known production is allocated using district/source-cell area fractions. Unrepresented source pixels remain unknown.');
 }else{
  const rows=table('Alanya_price_sensitivity').filter(r=>r.crop===state.crop);chart('Source-price sensitivity',[{type:'bar',x:rows.map(r=>fmt(r.price_multiplier_assumption*100,0)+'%'),y:rows.map(r=>r.potential_loss_known_USD/1e6),marker:{color:rows.map(r=>Number(r.price_multiplier_assumption)===Number(state.price)?'#b97436':'#d9c7a4')},hovertemplate:'Source-price assumption %{x}<br>%{y:.2f} million USD<extra></extra>'}],{yaxis:{title:{text:'Conditional potential loss · million USD',font:{size:9}},gridcolor:'#e7ebe5',rangemode:'tozero'}},'Only source-price multipliers 0.8, 1.0 and 1.2 are shown. Prices are in USD/t with an undocumented reference year. This is sensitivity screening, not validated expected damage.');
 }
}
function fireChart(){
 if(state.module==='weather'){
  const metric=state.weatherMetric,pe=metric==='pe_percent';
  const rr=table('response_projection_model_spread'),traces=['ssp245','ssp585'].map((s,i)=>({type:'scatter',mode:'lines+markers',name:s==='ssp245'?'SSP2-4.5':'SSP5-8.5',x:periods,y:periods.map(p=>rr.find(r=>r.scenario===s&&r.period===p)?.[metric+'_median']),error_y:{type:'data',symmetric:false,array:periods.map(p=>{const r=rr.find(r=>r.scenario===s&&r.period===p);return r.models_available>1?r[metric+'_max']-r[metric+'_median']:null;}),arrayminus:periods.map(p=>{const r=rr.find(r=>r.scenario===s&&r.period===p);return r.models_available>1?r[metric+'_median']-r[metric+'_min']:null;}),color:i?'#b14f3b':'#258e88',thickness:1,width:3},line:{color:i?'#b14f3b':'#258e88',width:2},marker:{size:6,symbol:periods.map(p=>rr.find(r=>r.scenario===s&&r.period===p).models_available<3?'diamond-open':'circle')},customdata:periods.map(p=>rr.find(r=>r.scenario===s&&r.period===p).models_available),hovertemplate:'%{x}<br>%{y:.2f} '+(pe?'%':'days')+'<br>%{customdata} available models<extra>%{fullData.name}</extra>'}));
  chart(pe?'Annual weather exceedance · model spread':'Season length · model spread',traces,{showlegend:true,legend:{orientation:'h',y:1.15,font:{size:9}},xaxis:{tickangle:-22,automargin:true},yaxis:{title:{text:pe?'Annual PE (%)':'days/year',font:{size:10}},gridcolor:'#e7ebe5'}},'District-area-mean series. Points are medians; bars are min–max across available selected models, not confidence intervals. The open diamond has one model, so no spread is shown.');
 }else if(state.module==='exposure'){
  if(state.scenario==='historical'){
   const rr=table('response_infrastructure_weather_summary').filter(r=>r.scenario==='historical');chart('Supplied lines in higher-PE cells',[{type:'bar',orientation:'h',y:rr.map(r=>({elektrik:'Electricity',fiberhat:'Fibre',TR_MJ_road_WGS84:'Major roads'}[r.layer]||r.layer)),x:rr.map(r=>r.length_in_cells_annual_pe_gt20_km),marker:{color:'#b46a42'},hovertemplate:'%{y}<br>%{x:.2f} km in PE >20% cells<extra></extra>'}],{xaxis:{title:{text:'km in annual PE >20% cells',font:{size:9}},gridcolor:'#e7ebe5'},yaxis:{automargin:true}},'Source line lengths exposed to meteorological conditions, not failure probabilities. Choose an SSP pathway for future scenario population.');
  }else{
   const rr=futurePopulationRows();chart('Population above weather-PE thresholds',[{type:'bar',x:['All scenario people','In PE >20% cells','In PE >50% cells'],y:['total_scenario_people','people_in_cells_annual_pe_gt_20','people_in_cells_annual_pe_gt_50'].map(k=>median(rr.map(r=>r[k]))),marker:{color:['#c5d4c9','#db9a65','#ac4b3b']},hovertemplate:'%{x}<br>%{y:,.0f} people<extra></extra>'}],{xaxis:{tickangle:-18,automargin:true},yaxis:{title:{text:'Scenario people',font:{size:10}},gridcolor:'#e7ebe5'}},'Medians across the selected available climate models. These are people living within weather cells, not casualties or an incident footprint.');
  }
 }else if(state.module==='evidence'){
  const rr=table('ml_modis_district_annual_detected_area');chart('Satellite-detected burned area',[{type:'bar',x:rr.map(r=>r.year),y:rr.map(r=>r.detected_unique_burned_area_ha),marker:{color:rr.map(r=>r.available_months<12?'#c5a878':'#ad5a3d')},customdata:rr.map(r=>r.available_months),hovertemplate:'%{x}<br>%{y:.1f} ha detected<br>%{customdata}/12 months available<extra></extra>'}],{xaxis:{dtick:5},yaxis:{title:{text:'Detected area (ha)',font:{size:10}},gridcolor:'#e7ebe5',rangemode:'tozero'}},'MODIS unique detected area, district pixel fractions. Detection zeros are not proof of no fires. Missing months: September 2023 and July 2024. Institutional forestry totals use a different scope.');
 }else{
  let rr,title='Source ordinal hazard areas';const risk=state.mlMetric.startsWith('risk_');
  if(risk&&state.family==='ECLIPS'){rr=table('ml_risk_class_areas').filter(r=>r.configuration===state.configuration&&r.dimension===state.mlMetric.slice(5));title='Source ordinal risk areas';}
  else rr=table(state.family==='ECLIPS'?'ml_hazard_class_area_all_scenarios':'chelsa_hazard_class_areas').filter(r=>r.configuration===(state.family==='CHELSA'?'CHELSA_':'')+state.configuration);
  const key=risk&&state.family==='ECLIPS'?'risk_class':'hazard_class';
  chart(title,[{type:'bar',x:rr.map(r=>r[key]===255?'Unknown':String(r[key])),y:rr.map(r=>r.area_ha/100),marker:{color:rr.map(r=>r[key]===0||r[key]===255?'#c7d1cb':'#be714b')},text:rr.map(r=>r.label||'Class '+r[key]),hovertemplate:'%{text}<br>%{y:.2f} km²<extra></extra>'}],{xaxis:{type:'category',title:{text:'Source class (0 = non-burnable / not modelled)',font:{size:9}}},yaxis:{title:{text:'Area (km²)',font:{size:10}},gridcolor:'#e7ebe5'}},risk&&state.family==='CHELSA'?'Source CHELSA hazard areas are shown for context; risk classes are displayed on the map. All results are unvalidated method examples.':'Areas are copied from the source class-area table. Ordinal hazard/risk classes have no annual-probability or monetary-loss interpretation; local validation limitations apply.');
 }
}
function methodCard(title,html,full=false){return `<article class="method-card${full?' full-width':''}"><h3>${E(title)}</h3>${html}</article>`;}
function methods(){
 let html='';
 if(D){
  html+=methodCard('One inherited scenario',`<p>The supplied hazard is the legacy TR611 MPI-M-MPI-ESM-LR / SMHI-RCA4 RCP8.5 run for <b>2046–2050</b>. The atlas does not recalculate evapotranspiration, soil water or yield response. Raw daily climate inputs needed for a corrected recomputation are absent.</p><p>A TRC12 RCP2.6 2021–2025 file is not a spatially or temporally comparable Alanya baseline. No baseline-to-future change is presented here.</p>`);
  html+=methodCard('Weighting, units and missing values','<p>Climate summaries are weighted by <b>district land area</b>, not planted crop area. Economic summaries use <b>production weighting</b> over valid production–hazard intersections. Soil AWC is mm/m; rooting-zone total available water requires root depth in metres.</p><p>Annual precipitation minus ET₀ is a climatic balance, not a direct measure of soil moisture. Unknown production/hazard pixels remain missing. Irrigation requirements in mm are not water-withdrawal volumes.</p>');
  html+=methodCard('Production and economic assumptions','<p>Modified source MapSPAM rasters are allocated by the fraction of each source cell inside the supplied boundary, assuming uniform production within a source cell. Crop-specific planted area, irrigation infrastructure, water-supply reliability and a verified zero/nodata policy are absent.</p><p>Potential loss = allocated production (t) × assumed price (USD/t) × yield reduction (%)/100. Source prices are banana 1,000, citrus 500 and avocado 3,500 USD/t; their year is undocumented. No currency conversion, market update, probability weighting or official district-total claim is made.</p>');
  html+=methodCard('Required scientific next steps','<p>Recompute the drought analysis from daily climate and documented soil/crop parameters after resolving the source audit. Validate water balance and crop response against local evidence; document planted area, production calibration, irrigation reliability and price year. Retain matched model, scenario, period and boundary support for comparisons.</p><p>The archived crop-name join fix prevents the old banana/citrus swap, but does not resolve the inherited hazard-algorithm issues.</p>');
  html+=methodCard('Source method and data audit',`<div class="table-scroll"><table class="audit-table"><thead><tr><th>Check</th><th>Source status</th><th>Finding</th></tr></thead><tbody>${table('method_and_data_audit').map(r=>`<tr><td><code>${E(r.check)}</code></td><td class="audit-status ${E(r.status)}">${E(r.status)}</td><td>${E(r.finding)}</td></tr>`).join('')}</tbody></table></div><p><a href="downloads/method_and_data_audit.csv" download>Download the unchanged source audit CSV ↓</a></p>`,true);
 }else{
  html+=methodCard('FWI response and statistical meaning','<p>The source uses 30 annual maxima from <b>1981–2010</b>, at six native weather cells and the district-area-mean FWI series. Annual PE is the Gumbel survival probability P(max daily FWI &gt;60). The fire-season cutoff is half the baseline fitted 20-year FWI return level and stays fixed under perturbation.</p><p>The 200-resample bootstrap intervals describe short-sample fitting uncertainty. A Gumbel fit, source-code tests and local incident validation are distinct forms of evidence. The FWI branch does not inherit the failed RF diagnostic, and it is not an ignition model.</p>');
  html+=methodCard('Climate projections and response domain','<p>Three selected CMIP6 models (IPSL-CM6A-LR, MPI-ESM1-2-LR, MRI-ESM2-0; r1i1p1f1) provide matched 1981–2010 temperature/precipitation anomalies. SSP2-4.5 and SSP5-8.5 use four 20-year periods. Native model/district weights and model calendars are retained upstream.</p><p>Bounded bilinear response interpolation is limited to <b>0…5°C</b> warming and <b>−40…+60%</b> precipitation. Two late-century SSP5-8.5 cases exceed +5°C and remain missing. The remaining single model cannot define ensemble spread. Min–max across three selected models is not a confidence interval.</p>');
  html+=methodCard('RF validation must remain visible','<p><b>ECLIPS:</b> 11 positive native training cells (2001–2010), balanced sample 22, later-period AUROC <b>0.191</b>. Discrimination failed; all associated susceptibility, hazard, risk, infrastructure overlays and changes are exploratory method examples.</p><p><b>CHELSA:</b> an explicit nine-predictor sensitivity excludes SWE because the full ten-predictor intersection has zero positive training support. With no positive held-out MODIS labels in 2021–2024, temporal AUROC is undefined. Training has 118 native positive cells; this is not successful validation.</p><p>Balanced RF scores are not calibrated annual/cumulative fire probabilities. Future RCP4.5/8.5 sensitivity runs are separate from the CMIP6 SSP response branch. Historical quantile cuts and CORINE 2000 are fixed. Native ≈1 km CHELSA inputs do not gain information by alignment to the ≈463 m MODIS grid. Some legacy climate units are incomplete, so native values must not be reinterpreted as annual precipitation totals.</p>');
  html+=methodCard('Exposure, scope and unresolved inputs','<p>The working wildfire boundary is <b>1,498.61 km²</b>; the alternative supplied boundary is 1,470.34 km², with intersection-over-union 0.780. These differ from the drought module’s 1,577.46 km² polygon. Results cannot be aggregated across scopes.</p><p>SSP population rasters are count scenarios, including 2020 inputs. People living in high-PE weather cells are not casualties or burned-area residents. Supplied line and facility geometries do not establish asset fragility, connectivity, outages, current operation or monetary damage.</p><p>Authenticated EWDS 1981–2025 / seasonal CDS FWI branches were not downloaded upstream; the completed public response branch is labelled 1981–2010. Full five-variable ecological Pareto lacks valid protected-area/irreplaceability coverage; three-variable screening is a separate partial product.</p>');
  html+=methodCard('Source report and primary method references','<p><a href="source-report.html" target="_blank" rel="noopener">Read the supplied final analytical report ↗</a></p><p><a href="https://handbook.climaax.eu/notebooks/workflows/fire.html" target="_blank" rel="noopener">CLIMAAX CRA Handbook · FIRE workflows ↗</a></p><p><a href="https://handbook.climaax.eu/notebooks/workflows/FIRE/03_response_model_FWI/workflow_description.html" target="_blank" rel="noopener">CLIMAAX · FWI response model and population exposure ↗</a></p><p><a href="https://natural-resources.canada.ca/forests-forestry/wildland-fires/canada-fire-weather-index-system" target="_blank" rel="noopener">Natural Resources Canada · FWI system ↗</a></p><p>External method references explain the framework; project-specific values and limitations are taken from the supplied output archive. Source notebooks and input templates referenced in that report are not all present in the uploaded outputs.</p>',true);
 }
 html+=methodCard('Atlas transformations and reproducibility','<p>This release changes presentation, not the scientific model outputs. GeoPackage features are reprojected to WGS84 without simplification. Raster images use nearest-neighbour reprojection for Leaflet; point inspection reads the original MODIS sinusoidal grid. Categorical classes and nodata remain distinct. Scientific PNG figures are converted to pixel-identical lossless WebP.</p><p>Original CSV/JSON files are copied unchanged. Original GeoTIFF, GeoPackage and SVG outputs are available in the geospatial download. The source manifest records file sizes and SHA-256 hashes for the supplied outputs. All calculations shown by the interface are transparent unit conversions, source-price sensitivity or labelled available-model medians; no climate or impact model is re-run.</p><p><a href="downloads/source-manifest.json" download>Source manifest ↓</a> · <a href="downloads/geospatial-source.zip" download>Original geospatial outputs ↓</a></p>',true);
 $('method-content').innerHTML=html.replace(/<\/?b>/g,'');
}
function figures(){
 const query=$('figure-search').value.toLocaleLowerCase('tr'),all=$('all-figures').checked,m=modules[state.module];
 const ff=A.figures.filter(f=>(all||m.figs.test(f.id))&&(!query||(f.title+' '+f.caption+' '+(window.ATLAS_I18N?.t(f.title)||'')+' '+(window.ATLAS_I18N?.t(f.caption)||'')).toLocaleLowerCase('tr').includes(query)));
 $('figure-count').textContent=ff.length+' / '+A.figures.length+' figures';
 $('source-figures').innerHTML=ff.length?ff.map(f=>`<figure class="source-figure"><a href="${E(f.src)}" target="_blank" rel="noopener"><img loading="lazy" src="${E(f.src)}" alt="${E(f.title||nice(f.id))}"></a><figcaption><strong>${E(f.title||nice(f.id))}</strong>${E(f.caption)}<br><a href="${E(f.src)}" target="_blank" rel="noopener">Open full-resolution source figure ↗</a></figcaption></figure>`).join(''):'<p class="empty-state">No figures match this search.</p>';
}
function tableOptions(){
 const first=modules[state.module].tables,keys=[...first,...Object.keys(A.tables).filter(k=>!first.includes(k)).sort()];
 $('table-select').innerHTML=keys.map(k=>`<option value="${E(k)}">${first.includes(k)?'● ':''}${E(nice(k))}</option>`).join('');state.table=first[0];$('table-select').value=state.table;state.page=0;$('table-filter').value='';renderTable();
 $('related-downloads').innerHTML='<a href="downloads/source-manifest.json" download>File hashes &amp; provenance ↓</a><a href="downloads/geospatial-source.zip" download>Original GeoTIFF / GeoPackage / SVG ↓</a><a href="downloads/web-map-vectors.zip" download>Web map vectors · GeoJSON ↓</a>'+(D?'<a href="downloads/method_and_data_audit.csv" download>Source method audit ↓</a><a href="downloads/run_config.json" download>Run configuration ↓</a>':'<a href="downloads/ML_MODEL_METADATA.json" download>ECLIPS metadata ↓</a><a href="downloads/CHELSA_MODEL_METADATA.json" download>CHELSA metadata ↓</a><a href="downloads/RUN_STATUS.json" download>Upstream workflow status ↓</a>');
}
function renderTable(){
 const rows=table(state.table),keys=rows.length?Object.keys(rows[0]):[],q=$('table-filter').value.toLocaleLowerCase('tr');
 const filtered=q?rows.filter(r=>Object.values(r).some(v=>(String(v??'')+' '+(window.ATLAS_I18N?.t(String(v??''))||'')).toLocaleLowerCase('tr').includes(q))):rows,totalPages=Math.max(1,Math.ceil(filtered.length/25));state.page=Math.min(state.page,totalPages-1);
 const start=state.page*25;
 $('source-table').innerHTML='<thead><tr>'+keys.map(k=>`<th scope="col" title="${E(k)}">${E(nice(k))}</th>`).join('')+'</tr></thead><tbody>'+filtered.slice(start,start+25).map(r=>'<tr>'+keys.map(k=>`<td title="${E(r[k])}">${r[k]===null?'—':E(typeof r[k]==='number'?fmt(r[k],Number.isInteger(r[k])?0:4):r[k])}</td>`).join('')+'</tr>').join('')+'</tbody>';
 $('table-page').textContent=filtered.length?`${start+1}–${Math.min(start+25,filtered.length)} of ${filtered.length} rows`:'No matching rows';$('table-prev').disabled=state.page===0;$('table-next').disabled=state.page>=totalPages-1;
 $('table-download').href='downloads/'+state.table+'.csv';$('table-description').textContent='Unchanged source CSV · '+rows.length+' rows · displayed numbers are rounded to four decimal places; downloads retain full precision. Column names and units follow the source.';
}
function syncURL(){
 const p=new URLSearchParams({module:state.module,view:state.view});
 if(state.view==='figures'&&$('all-figures').checked)p.set('allFigures','1');
 if(D){p.set('crop',state.crop);p.set('indicator',state.indicator);if(state.module==='economic')p.set('price',state.price);}
 else if(['weather','exposure'].includes(state.module)){p.set('scenario',state.scenario);p.set('metric',state.weatherMetric);if(state.scenario!=='historical'){p.set('period',state.period);p.set('model',state.model);}}
 else if(state.module==='experimental'){p.set('family',state.family);p.set('configuration',state.configuration);p.set('metric',state.mlMetric);}
 else p.set('evidence',state.evidence);
 try{history.replaceState(null,'','#'+p);}catch(e){/* file preview can restrict history */}
}
function view(name){
 state.view=name;document.querySelectorAll('.evidence-tabs [role=tab]').forEach(b=>{const active=b.dataset.view===name;b.setAttribute('aria-selected',active);b.tabIndex=active?0:-1;});
 ['explorer','figures','data','methods'].forEach(v=>$('pane-'+v).hidden=v!==name);syncURL();
 if(name==='explorer')requestAnimationFrame(()=>{map.invalidateSize();Plotly.Plots.resize('analysis-chart');});
}
let rendering=0;
async function update(){
 const token=++rendering,m=modules[state.module];$('app-status').textContent='Updating source layers…';
 controls();D?droughtCards():fireCards();clearMap();$('exposure-note').hidden=true;
 try{if(D){droughtMap();droughtChart();}else{fireChart();if(['weather','exposure'].includes(state.module))weatherMap();else if(state.module==='evidence')evidenceMap();else await mlMap();}
  if(token!==rendering)return;
  $('app-status').textContent='Source outputs retained · '+(D?'RCP8.5 · 2046–2050':state.module==='experimental'?state.family+' · '+state.configuration:state.module==='evidence'?'Source inventory and observations':state.scenario==='historical'?'FWI baseline · 1981–2010':state.scenario.toUpperCase()+' · '+state.period+' · '+(state.model==='median'?'available-model median':state.model));
 }catch(err){console.error(err);$('app-status').textContent='A source layer could not be loaded. Source tables and downloads remain available.';}
 syncURL();
}
function module(id){
 state.module=id;const m=modules[id];document.querySelectorAll('#analysis-list button').forEach(b=>{b.classList.toggle('active',b.dataset.module===id);b.setAttribute('aria-pressed',b.dataset.module===id);});
 $('analysis-kicker').textContent=m.kicker;$('analysis-title').textContent=m.title;$('analysis-description').textContent=m.description;$('source-summary').textContent=m.source;$('scope-summary').textContent=m.scope;$('analysis-status').textContent=m.status;$('analysis-status').classList.toggle('critical',id==='experimental');$('interpretation').innerHTML=m.warning;$('interpretation').classList.toggle('critical',id==='experimental');
 methods();figures();tableOptions();update();
}
$('analysis-list').innerHTML=Object.entries(modules).map(([id,m],i)=>`<button type="button" data-module="${id}" aria-pressed="false"><span class="analysis-number">0${i+1}</span><span class="analysis-label">${E(m.label)}<small>${E(m.sub)}</small></span></button>`).join('');
document.querySelectorAll('#analysis-list button').forEach(b=>b.addEventListener('click',()=>module(b.dataset.module)));
document.querySelectorAll('.evidence-tabs button').forEach(b=>{b.addEventListener('click',()=>view(b.dataset.view));b.addEventListener('keydown',e=>{const tabs=[...document.querySelectorAll('.evidence-tabs button')];let i=tabs.indexOf(b);if(e.key==='ArrowRight')i=(i+1)%tabs.length;else if(e.key==='ArrowLeft')i=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')i=0;else if(e.key==='End')i=tabs.length-1;else return;e.preventDefault();tabs[i].focus();view(tabs[i].dataset.view);});});
$('reset-map').addEventListener('click',fit);
$('expand-map').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('map-stage').requestFullscreen();}catch(e){$('app-status').textContent='Full-screen is unavailable in this browser. Use browser zoom or expand the window.';}});
document.addEventListener('fullscreenchange',()=>{setTimeout(()=>map.invalidateSize(),100);$('expand-map').textContent=document.fullscreenElement?'Close full screen ↙':'Expand ↗';});
$('basemap-toggle').addEventListener('change',e=>{if(e.target.checked)basemap.addTo(map);else{map.removeLayer(basemap);$('map-network-status').textContent='Analytical layers only';}});
$('layer-opacity').addEventListener('input',()=>{if(rasterLayer)rasterLayer.setOpacity(opacity());sourceLayers.forEach(l=>{if(l.setStyle)l.setStyle({fillOpacity:opacity()});});});
$('figure-search').addEventListener('input',figures);$('all-figures').addEventListener('change',()=>{figures();syncURL();});
$('table-select').addEventListener('change',e=>{state.table=e.target.value;state.page=0;$('table-filter').value='';renderTable();});$('table-filter').addEventListener('input',()=>{state.page=0;renderTable();});$('table-prev').addEventListener('click',()=>{state.page--;renderTable();});$('table-next').addEventListener('click',()=>{state.page++;renderTable();});
const hash=new URLSearchParams(location.hash.slice(1));if(modules[hash.get('module')])state.module=hash.get('module');if(['explorer','figures','data','methods'].includes(hash.get('view')))state.view=hash.get('view');
if(D){if(CROP.includes(hash.get('crop')))state.crop=hash.get('crop');if(hash.get('indicator'))state.indicator=hash.get('indicator');if(['0.8','1','1.2'].includes(hash.get('price')))state.price=hash.get('price');}
else{
 if(['historical','ssp245','ssp585'].includes(hash.get('scenario')))state.scenario=hash.get('scenario');
 if(periods.includes(hash.get('period')))state.period=hash.get('period');if(['median',...models].includes(hash.get('model')))state.model=hash.get('model');
 if(['pe_percent','fsl_mean_days'].includes(hash.get('metric')))state.weatherMetric=hash.get('metric');
 if(['infrastructure','resources','wui'].includes(hash.get('evidence')))state.evidence=hash.get('evidence');
 if(['ECLIPS','CHELSA'].includes(hash.get('family')))state.family=hash.get('family');
 const conf=hash.get('configuration');state.configuration=conf&&A.rasters.some(r=>r.family===state.family&&r.configuration===conf)?conf:state.family==='ECLIPS'?'HIST_199110':'HIST_1991_2020';
 if(hash.get('metric'))state.mlMetric=hash.get('metric');
}
if(hash.get('allFigures')==='1')$('all-figures').checked=true;
module(state.module);view(state.view);
window.addEventListener('resize',()=>map.invalidateSize());
})();
