/* Shared controls for the four supplied maps. Numerical data stay in source HTML. */
(() => {
  'use strict';
  const moduleId = window.ATLAS_MODULE;
  const scenarioId = moduleId === 'river' ? 'rp' : moduleId === 'exposure' ? 'metric' : 'scenario';
  const scenario = document.getElementById(scenarioId);
  const qa = document.getElementById('qa');
  if (!scenario || typeof map === 'undefined') return;
  const initialBounds = map.getBounds();
  // Parent/iframe messages use canonical source labels. Display translations
  // must never become the source of a later English rendering.
  const sourceLabels = new WeakMap();
  for (const element of [scenario, qa]) Array.from(element?.options || []).forEach(option => sourceLabels.set(option, option.textContent));
  const label = option => sourceLabels.get(option) ?? option?.textContent ?? '';
  const options = element => Array.from(element?.options || [], option => ({value: option.value, label: label(option)}));

  document.querySelectorAll('.panel, #panel').forEach(panel => {
    if (!panel.querySelector('select')) return;
    const details = document.createElement('details');
    details.className = 'atlas-map-options';
    details.open = window.innerWidth >= 640;
    const summary = document.createElement('summary');
    summary.textContent = 'Map options & legend';
    details.appendChild(summary);
    while (panel.firstChild) details.appendChild(panel.firstChild);
    panel.appendChild(details);
    L.DomEvent.disableClickPropagation(panel);
    L.DomEvent.disableScrollPropagation(panel);
  });
  if (moduleId === 'exposure') {
    const legend = document.createElement('div');
    legend.className = 'atlas-pop-legend';
    legend.innerHTML = '<hr><b>Estimated residents / mapped cell</b>' +
      ['< 1', '1 to < 5', '5 to < 10', '10 to < 25', '25 to < 50', '50 to < 100', '100 or more']
        .map((label, i) => '<div><i style="background:' + ['#fff3bf','#fee391','#fec44f','#fe9929','#ec7014','#cc4c02','#8c2d04'][i] + '"></i>' + label + '</div>').join('');
    document.querySelector('#panel details')?.appendChild(legend);
  }
  if (moduleId === 'discharge') {
    const legend = document.createElement('p');
    legend.innerHTML = '<b>Colour key</b><br><span style="color:#b44333">Red: increase</span> · <span style="color:#267bae">Blue: decrease</span><br>Grey: no finite indicator or no change.';
    document.querySelector('#panel details')?.appendChild(legend);
  }
  if (moduleId === 'exposure' || moduleId === 'discharge') {
    const north = L.control({position: 'bottomleft'});
    north.onAdd = () => {
      const div = L.DomUtil.create('div', 'atlas-north');
      div.innerHTML = 'N<br>↑';
      div.setAttribute('aria-label', 'North');
      return div;
    };
    north.addTo(map);
  }

  function getState() {
    const state = {module: moduleId, scenario: scenario.value,
      label: label(scenario.options[scenario.selectedIndex]), options: options(scenario)};
    if (moduleId === 'coastal') state.datasetId = datasets[Number(scenario.value)]?.id;
    if (moduleId === 'river') state.returnPeriod = rps[Number(scenario.value)];
    if (moduleId === 'exposure') {
      state.qa = qa.value;
      state.qaOptions = options(qa);
      state.returnPeriod = 100;
    }
    return state;
  }
  function emit() {
    if (window.parent !== window && location.origin !== 'null') {
      window.parent.postMessage({type: 'alanya-flood-map-state', state: getState()}, location.origin);
    }
  }
  function choose(element, value) {
    if (!element || !Array.from(element.options).some(option => option.value === String(value))) return false;
    element.value = String(value);
    element.dispatchEvent(new Event('input', {bubbles: true}));
    element.dispatchEvent(new Event('change', {bubbles: true}));
    return true;
  }
  window.atlasBridge = {
    getState,
    setScenario(value) {const changed = choose(scenario, value); emit(); return changed;},
    setQA(value) {const changed = choose(qa, value); emit(); return changed;},
    resetView() {map.fitBounds(initialBounds);},
    invalidateSize() {map.invalidateSize();},
  };
  scenario.addEventListener('change', emit);
  qa?.addEventListener('change', emit);
  window.addEventListener('atlas-language-change', emit);
  const params = new URLSearchParams(location.search);
  if (params.has('scenario')) choose(scenario, params.get('scenario'));
  if (params.has('qa')) choose(qa, params.get('qa'));
  emit();
})();
