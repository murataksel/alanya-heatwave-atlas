(() => {
  'use strict';
  const $ = id => document.getElementById(id), frame = $('map-frame');
  const fmt = (n, d = 0) => n !== null && n !== undefined && Number.isFinite(Number(n)) ? new Intl.NumberFormat('en-GB', {minimumFractionDigits:d, maximumFractionDigits:d}).format(Number(n)) : '—';
  let catalog, active, ready = false, timer;
  const memory = new Map();
  function el(tag, cls, text) {const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e;}
  function status(text, error = false) {$('atlas-status').textContent = text; $('atlas-status').classList.toggle('error-message', error);}
  function hash() {const [module, query] = location.hash.slice(1).split('?'), p = new URLSearchParams(query || ''); return {module:module || 'coastal', scenario:p.get('scenario'), qa:p.get('qa')};}
  let pending = hash();
  function fill(select, entries) {select.replaceChildren(...entries.map(e => {const o = el('option', '', e.label); o.value = e.value; return o;}));}
  function link(item) {const a = el('a', '', item.label + ' ↓'); a.href = item.href; a.download = ''; return a;}
  function metadata() {
    $('analysis-title').textContent = active.title; $('analysis-kicker').textContent = 'FLOODS / ANALYSIS ' + active.number;
    $('analysis-description').textContent = active.description; $('analysis-tag').textContent = active.tag;
    $('source-text').textContent = active.source; $('scope-text').textContent = active.scope;
    $('reading-notes').replaceChildren(...active.notes.map(n => el('li', '', n))); $('downloads').replaceChildren(...active.downloads.map(link));
    const mobile = $('mobile-evidence'), list = el('ul'); list.append(...active.notes.map(n => el('li', '', n)));
    mobile.replaceChildren(el('summary', '', 'Sources, interpretation & downloads'), el('p', '', active.source), el('p', '', active.scope), list, ...active.downloads.map(link));
    $('module-list').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.module === active.id)));
    document.title = 'Alanya Climate Risk Atlas | ' + active.title;
  }
  function card(label, value, note) {const n = el('div', 'summary-card'); n.append(el('span','stat-label',label), el('span','stat-value',value), el('span','stat-note',note)); return n;}
  function summary(s) {
    const c = [], rows = active.summary;
    if (!s) {
      c.push(card('Spatial unit',active.id === 'discharge' ? 'Catchments' : 'Source cells','Independent of neighbourhood selection'), card('Coverage',active.tag,'As supplied in the analysis outputs'), card('Evidence','Modelled','Read the source and interpretation notes'));
    } else if (active.id === 'coastal') {
      const m = /^depth_(\d+)_(\d+)$/.exec(s.datasetId || '');
      if (m) {
        const r = rows.find(r => r.year === +m[1] && r.return_period_year === +m[2]);
        c.push(card('Mapped area · depth ≥ 0.10 m',r ? fmt(r.wet_area_ge_threshold_km2,2)+' km²' : '—','Coastal screening window'), card('Maximum mapped depth',r ? fmt(r.depth_max_m,2)+' m' : '—',m[1]+(m[1] === '2050' ? ' RCP8.5 projection' : ' baseline')), card('Annual exceedance probability',fmt(100/+m[2],2)+'%','T = '+m[2]+' years'));
      } else c.push(card('Comparison','2018 → 2050','2050 RCP8.5 and 2018 baseline'), card('Return period','100 years','Same return period in both years'), card(s.datasetId === 'transition100' ? 'Transition threshold' : 'Mapped quantity',s.datasetId === 'transition100' ? '0.10 m' : 'Δ depth (m)','See the source legend for all classes'));
    } else if (active.id === 'river') {
      const r = rows.find(r => r.return_period_year === s.returnPeriod && r.threshold_m === 0.1);
      c.push(card('Raw mapped area · depth ≥ 0.10 m',r ? fmt(r.raw_wet_area_km2,2)+' km²' : '—','Includes source QA flag overlaps'), card('Original wet cells',r ? fmt(r.wet_cells) : '—','Alanya and upstream screening window'), card('Annual exceedance probability',fmt(100/s.returnPeriod,2)+'%','Historical climate · T = '+s.returnPeriod+' years'));
    } else if (active.id === 'exposure') {
      const metric = s.scenario === 'displaced' ? 'displacement_proxy' : 'exposed', policy = {raw:'raw',water:'outside_permanent_water_flags',both:'outside_both_flags'}[s.qa];
      const r = rows.find(r => r.return_period_year === 100 && r.metric === metric && r.qa_policy === policy);
      c.push(card(metric === 'exposed' ? 'Estimated exposed residents' : 'Residents above displacement threshold',r ? '≈ '+fmt(r.people_estimate) : '—',s.qaOptions.find(o => o.value === s.qa)?.label || ''), card('River event / resident population','T100 / 2025','Historical hazard / projected population'), card('Depth criterion',metric === 'exposed' ? '> 0 m' : '> 1 m','Estimated residents; tourism not included'));
    } else {
      const [scenario, period, indicator] = s.scenario.split(' | '), selected = rows.filter(r => r.scenario === scenario && r.time_period === period && r.return_period_year === +(indicator || '').slice(1));
      const med = selected.map(r => r.median).filter(n => typeof n === 'number' && Number.isFinite(n)), counts = selected.map(r => r.n_available).filter(n => typeof n === 'number' && Number.isFinite(n));
      c.push(card('Range of subcatchment medians',med.length ? fmt(Math.min(...med),1)+' to '+fmt(Math.max(...med),1)+'%' : '—','Source-indicator change, not ensemble spread'), card('Model subcatchments',fmt(selected.length),scenario?.toUpperCase().replace('RCP45','RCP4.5').replace('RCP85','RCP8.5')+' · '+period), card('Available models per catchment',counts.length ? (Math.min(...counts) === Math.max(...counts) ? fmt(counts[0]) : fmt(Math.min(...counts))+'–'+fmt(Math.max(...counts))) : '—',indicator+' indicator · No local gauge validation'));
    }
    $('summary-cards').replaceChildren(...c);
  }
  function figures() {
    $('figure-grid').replaceChildren(...active.figures.map(f => {
      const box = el('figure','figure-card'), a = el('a'), img = el('img'), cap = el('figcaption');
      a.href = f.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; img.src = f.href; img.alt = f.title; img.loading = 'lazy';
      a.append(img); cap.append(el('strong','',f.title),el('span','',f.caption)); box.append(a,cap); return box;
    }));
  }
  function chart() {const c = active.charts?.find(c => c.id === $('daily-chart').value); if (c) {$('daily-frame').src = c.href; $('daily-frame').title = c.title; $('open-chart').href = c.href;}}
  function pane(name) {
    if (name === 'charts' && !active?.charts?.length) name = 'map';
    document.querySelectorAll('[data-pane]').forEach(b => {const on = b.dataset.pane === name; b.setAttribute('aria-selected',String(on)); b.tabIndex = on ? 0 : -1; $('pane-'+b.dataset.pane).hidden = !on;});
    if (name === 'map' && ready) requestAnimationFrame(() => frame.contentWindow.atlasBridge?.invalidateSize());
    if (name === 'charts' && !$('daily-frame').getAttribute('src')) chart();
  }
  function update(s) {
    if (s.module !== active.id) return; memory.set(active.id,s);
    fill($('map-scenario'),s.options); $('map-scenario').value = s.scenario; $('map-scenario').disabled = false; $('qa-control').hidden = active.id !== 'exposure';
    if (s.qaOptions) {fill($('map-qa'),s.qaOptions); $('map-qa').value = s.qa;}
    $('scenario-label').textContent = {river:'Return period',exposure:'Population measure (T100)',discharge:'Climate scenario · period · flow indicator',coastal:'Coastal scenario / layer'}[active.id];
    const p = new URLSearchParams({scenario:s.scenario}); if (s.qa) p.set('qa',s.qa);
    history.replaceState(null,'','#'+active.id+'?'+p.toString()); $('open-map').href = active.map+'?'+p.toString(); summary(s);
  }
  function switchModule(id) {
    active = catalog.modules.find(m => m.id === id) || catalog.modules[0]; ready = false; clearTimeout(timer); metadata(); figures(); summary();
    $('tab-charts').hidden = !active.charts?.length; $('daily-frame').removeAttribute('src');
    if (active.charts?.length) fill($('daily-chart'),active.charts.map(c => ({value:c.id,label:c.title})));
    $('map-scenario').disabled = true; fill($('map-scenario'),[{value:'',label:'Loading map layers…'}]); $('qa-control').hidden = true;
    $('reset-view').disabled = true; $('map-loading').hidden = false; frame.title = 'Alanya | '+active.title; $('open-map').href = active.map;
    status(''); pane('map'); frame.src = active.map+'?embedded=1';
    timer = setTimeout(() => {$('map-loading').hidden = true; status('The map is taking longer to load. Use “Open map” to open it separately.',true);},20000);
  }
  frame.addEventListener('load',() => {
    if (!active) return;
    try {
      const b = frame.contentWindow.atlasBridge;
      if (!b || b.getState().module !== active.id) {clearTimeout(timer); $('map-loading').hidden = true; status('The map could not be initialised. Open it separately or reload the page through an HTTP server.',true); return;}
      const saved = pending?.module === active.id ? pending : memory.get(active.id);
      if (saved?.scenario !== null && saved?.scenario !== undefined) b.setScenario(saved.scenario); if (saved?.qa) b.setQA(saved.qa);
      pending = null; ready = true; clearTimeout(timer); $('map-loading').hidden = true; $('reset-view').disabled = false; update(b.getState());
      status('Click a source cell or catchment for its value. Interpretation notes and downloads accompany each analysis.');
    } catch {clearTimeout(timer); $('map-loading').hidden = true; status('Serve the complete atlas folder through HTTP to load the maps and their local libraries.',true);}
  });
  window.addEventListener('message',e => {if (ready && e.origin === location.origin && e.source === frame.contentWindow && e.data?.type === 'alanya-flood-map-state') update(e.data.state);});
  $('map-scenario').addEventListener('change',e => {if (ready) {frame.contentWindow.atlasBridge.setScenario(e.target.value); update(frame.contentWindow.atlasBridge.getState());}});
  $('map-qa').addEventListener('change',e => {if (ready) {frame.contentWindow.atlasBridge.setQA(e.target.value); update(frame.contentWindow.atlasBridge.getState());}});
  $('reset-view').addEventListener('click',() => frame.contentWindow.atlasBridge?.resetView());
  $('fullscreen').addEventListener('click',async () => {
    if (!$('frame-shell').requestFullscreen) {window.open($('open-map').href,'_blank','noopener,noreferrer'); return;}
    try {await $('frame-shell').requestFullscreen();} catch {status('Use “Open map” to view the selected map in a separate tab.');}
  });
  document.addEventListener('fullscreenchange',() => frame.contentWindow.atlasBridge?.invalidateSize());
  $('daily-chart').addEventListener('change',chart);
  document.querySelectorAll('[data-pane]').forEach(b => {
    b.addEventListener('click',() => pane(b.dataset.pane));
    b.addEventListener('keydown',e => {
      const tabs = Array.from(document.querySelectorAll('[data-pane]')).filter(t => !t.hidden); let i = tabs.indexOf(b);
      if (e.key === 'ArrowRight') i = (i+1)%tabs.length; else if (e.key === 'ArrowLeft') i = (i+tabs.length-1)%tabs.length; else if (e.key === 'Home') i = 0; else if (e.key === 'End') i = tabs.length-1; else return;
      e.preventDefault(); pane(tabs[i].dataset.pane); tabs[i].focus();
    });
  });
  window.addEventListener('hashchange',() => {
    if (!catalog) return; pending = hash();
    if (pending.module === active?.id && ready) {if (pending.scenario !== null) frame.contentWindow.atlasBridge.setScenario(pending.scenario); if (pending.qa) frame.contentWindow.atlasBridge.setQA(pending.qa); pending = null; update(frame.contentWindow.atlasBridge.getState());}
    else switchModule(pending.module);
  });
  fetch('data/catalog.json').then(r => {if (!r.ok) throw new Error('Catalog HTTP '+r.status); return r.json();}).then(data => {
    catalog = data;
    $('module-list').replaceChildren(...data.modules.map(m => {
      const b = el('button','module-button'), labels = el('span'); b.type = 'button'; b.dataset.module = m.id; b.setAttribute('aria-pressed','false');
      labels.append(el('strong','',m.title),el('small','',m.subtitle)); b.append(el('span','module-number',m.number),labels);
      b.addEventListener('click',() => {pending = null; switchModule(m.id);}); return b;
    })); switchModule(pending.module);
  }).catch(() => {$('analysis-title').textContent = 'The flood catalogue could not be loaded'; $('map-loading').hidden = true; status('Keep the folder structure intact and open the site through HTTP (for example: python -m http.server 8000), or use the hosted atlas.',true);});
})();
