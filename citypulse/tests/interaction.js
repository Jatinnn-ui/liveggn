const output = document.getElementById('results');
const frame = document.getElementById('app');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const log = (name, pass, detail = '') => {
 const message = `${pass ? 'PASS' : 'FAIL'} · ${name}${detail ? ' · ' + detail : ''}`;
 output.textContent += '\n' + message;
 console[pass ? 'log' : 'error'](message);
 if (!pass) throw new Error(message);
};
async function waitFor(predicate, timeout = 45000) {
 const start = Date.now();
 while (!predicate()) {
  if (Date.now() - start > timeout) throw new Error('Timed out waiting for application state.');
  await sleep(150);
 }
}
async function run() {
 const w = frame.contentWindow;
 await waitFor(() => w.CityPulse?.engine.mapReady);
 const app = w.CityPulse, d = w.document, engine = app.engine;
 const pref = w.localStorage.getItem('citypulse-preferences');
 const plans = w.localStorage.getItem('citypulse-plans');
 output.textContent = 'Testing real application controls…';
 try {
  await sleep(3200);
  log('MapLibre loaded geographic map', !!engine.map.getLayer('city-buildings'));
  log('Three.js instancing initialized', !!engine.trafficLayer?.mesh?.isInstancedMesh);
  log('Curated geographic search', app.search('Cyber Hub').length >= 2);
  const search = d.getElementById('search-input');
  search.value = 'Sikanderpur';
  search.dispatchEvent(new w.Event('input', {bubbles: true}));
  log('Autocomplete renders matching station', d.getElementById('search-results').textContent.includes('Sikanderpur'));
  d.querySelector('[data-search-index="0"]').click();
  log('Selecting search updates inspector', d.getElementById('inspector-content').textContent.includes('Yellow Line'));
  for (const name of ['aqi', 'transit', 'crowd', 'events', 'construction', 'restaurants']) {
   const input = d.querySelector(`[data-layer="${name}"]`);
   if (!input.checked) input.click();
   log(`${name} layer enabled by checkbox`, engine.layers[name]);
  }
  log('AQI changes actual map visibility', engine.map.getLayoutProperty('aqi-layer', 'visibility') === 'visible');
  log('Events produce visible geographic marker', engine.markers.some(m => m.place.type === 'event' && m.el.style.display === 'flex'));
  d.getElementById('weather-button').click();
  d.querySelector('[data-weather="rain"]').click();
  log('Rain changes weather environment', d.getElementById('weather-effects').dataset.weather === 'rain');
  const slider = d.getElementById('time-slider');
  slider.value = '22'; slider.dispatchEvent(new w.Event('input', {bubbles:true}));
  log('Time slider changes night lighting', d.body.dataset.time === 'night' && engine.time === 22);
  d.getElementById('environment-close').click();
  await app.ask('Plan a 2 hour evening in Gurgaon. Avoid heavy traffic.');
  log('Copilot creates structured itinerary', d.querySelectorAll('.itinerary-stop').length === 3);
  log('Itinerary data provenance', d.getElementById('inspector-content').textContent.includes('Live congestion avoidance is not available'));
  d.querySelector('[data-action="save-plan"]').click();
  log('Itinerary persists locally', JSON.parse(w.localStorage.getItem('citypulse-plans')).length > 0);
  d.querySelector('[data-view="saved"]').click();
  log('Saved plans dialog opens', d.getElementById('app-dialog').open && !!d.querySelector('[data-saved]'));
  d.getElementById('dialog-close').click();
  await app.ask('Find coffee near Cyber Hub');
  log('Coffee prompt selects a real curated place', d.getElementById('inspector-content').textContent.includes('Starbucks'));
  engine.select(app.places.find(p => p.id === 'cyberhub'), {fly:false});
  d.querySelector('[data-action="route-place"]').click();
  d.getElementById('route-form').dispatchEvent(new w.Event('submit', {bubbles:true, cancelable:true}));
  await waitFor(() => !!d.querySelector('[data-action="follow-route"]'), 22000);
  log('Road route generated', engine.routeCoordinates?.length > 2);
  log('Route distance and duration displayed', !!d.querySelector('.route-summary'));
  await sleep(1500);
  d.querySelector('[data-action="follow-route"]').click();
  log('Camera follow starts', !!engine.followTimer);
  engine.stopFollowing();
  log('Camera follow stops', !engine.followTimer);
  const alternate = d.querySelector('[data-action="alternate-route"]');
  if (alternate) {alternate.click(); log('Alternative road route selected', engine.routeCoordinates.length > 2);}
  d.querySelector('[data-action="clear-route"]').click();
  log('Route clears', engine.routeCoordinates === null);
  const originalFetch = w.fetch;
  try {
   w.fetch = (url, options) => {
    if (String(url).includes('router.project-osrm.org')) return Promise.reject(new Error('Test: routing service offline'));
    return originalFetch.call(w, url, options);
   };
   await app.route([app.places.find(p => p.id === 'phase2'), app.places.find(p => p.id === 'cyberhub')]);
   log('Provider outage uses genuine cached geometry', engine.routeCoordinates?.length > 2 && engine.route.source.includes('STATIC'));
   log('Cached route is labelled static in UI', d.getElementById('route-result').textContent.includes('STATIC'));
   engine.clearRoute();
   await app.route([app.places.find(p => p.id === 'ambience'), app.places.find(p => p.id === 'westin')]);
   log('Unknown route is not invented during outage', engine.routeCoordinates === null && d.getElementById('route-result').textContent.includes('Routing unavailable'));
  } finally { w.fetch = originalFetch; }
  w.localStorage.setItem('citypulse-plans', '{broken');
  d.querySelector('[data-view="saved"]').click();
  log('Corrupt local storage does not crash saved plans', d.getElementById('dialog-content').textContent.includes('No saved plans yet'));
  d.getElementById('dialog-close').click();
  d.getElementById('reset-layers').click();
  log('Layer reset restores defaults', d.getElementById('active-layers').textContent === '3');
  app.setTime(17.5);
  log('Day-night restoration', d.body.dataset.time === 'sunset');
  console.log('CITYPULSE TEST SUITE COMPLETED · all assertions passed');
  output.textContent += '\n\nAll assertions passed.';
  document.body.dataset.tests = 'passed';
 } finally {
  if (pref === null) w.localStorage.removeItem('citypulse-preferences'); else w.localStorage.setItem('citypulse-preferences', pref);
  if (plans === null) w.localStorage.removeItem('citypulse-plans'); else w.localStorage.setItem('citypulse-plans', plans);
 }
}
frame.addEventListener('load', () => run().catch(error => {
 output.textContent += '\nFAIL · ' + error.message;
 document.body.dataset.tests = 'failed';
 console.error('CITYPULSE TEST SUITE FAILED', error.message);
}), {once:true});
