import {PLACES} from '../city-data/places.js';
async function request(url,timeout=11000){const response=await fetch(url,{signal:AbortSignal.timeout(timeout)});if(!response.ok)throw new Error(`Provider returned ${response.status}`);return response.json();}
export const placesProvider={
 search(query){const q=query.toLowerCase().trim();return PLACES.filter(p=>`${p.name} ${p.category} ${p.area}`.toLowerCase().includes(q));},
 async searchOSM(query){const data=await request(`https://photon.komoot.io/api/?q=${encodeURIComponent(query+' Gurugram')}&lat=28.49&lon=77.08&limit=6`);return data.features.filter(f=>f.geometry.coordinates[0]>76.9&&f.geometry.coordinates[0]<77.2&&f.geometry.coordinates[1]>28.3&&f.geometry.coordinates[1]<28.6).map((f,i)=>({id:'search-'+i,name:f.properties.name||query,type:f.properties.osm_value||'place',category:f.properties.osm_value||'Place',coordinates:f.geometry.coordinates,area:f.properties.street||'Gurugram',description:'Place data from OpenStreetMap via Photon. Opening hours and availability are not connected.'}));}
};
export const routeProvider = {
 async route(places) {
  if (places.length < 2) throw new Error('Select at least two places.');
  const coords = places.map(p => p.coordinates.join(',')).join(';');
  const cacheKey = places.map(p => p.id).join(',');
  const snapshots = {
   'phase2,cyberhub': 'phase2-cyberhub.json',
   'starbucks,cyberhub,social': 'cyberhub-evening.json'
  };
  let result, source = 'OSRM · OpenStreetMap';
  try {
   result = await request(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&alternatives=true&steps=false`, 12000);
  } catch (error) {
   if (!snapshots[cacheKey]) throw error;
   // Only exact, previously requested endpoints can use a genuine OSRM snapshot.
   result = await request(new URL('../city-data/routes/' + snapshots[cacheKey], import.meta.url), 3000);
   source = 'OSRM snapshot · STATIC';
  }
  if (result.code !== 'Ok' || !result.routes?.length) throw new Error('No road route available for these locations.');
  return result.routes.map(r => ({
   geometry: r.geometry,
   distance: r.distance / 1000,
   duration: Math.max(1, Math.round(r.duration / 60)),
   source,
   status: 'Estimated · no live traffic'
  }));
 }
};
// Deliberately deterministic, offline demo intent parser. No model is called.
export const copilotProvider={async query(text){const q=text.toLowerCase();await new Promise(r=>setTimeout(r,550));if(/busiest|traffic|busy/.test(q)&& !/plan|route|evening|date|avoid|coffee/.test(q))return {kind:'traffic',message:'Explore the simulated traffic layer. These are illustrative flows, not current congestion. I can’t tell which areas are busiest right now.'};if(/weather|rain|temperature/.test(q))return {kind:'weather',message:'Weather is a simulated environment, not a live forecast. Choose clear skies, rain, fog, or clouds in the environment controls. Live conditions are unavailable.'};if(/air|aqi|pollution/.test(q))return {kind:'aqi',message:'The air-quality overlay uses simulated values, not measurements. Do not use it for health or travel decisions.'};if(/metro|transit|train/.test(q))return {kind:'transit',message:'Showing curated metro station locations and OpenStreetMap railway geometry. Arrival times and current services are unavailable.'};if(/coffee|cafe/.test(q)&& !/plan|evening|dinner|date|hour|minute/.test(q))return {kind:'place',place:PLACES.find(p=>p.id==='starbucks'),message:'Try Starbucks at Cyber Hub. This is a curated place, not a live availability result. Opening hours are unavailable.'};if(/plan|evening|date|hour|minute|dinner|activity/.test(q)){const short=/90/.test(q);return {kind:'plan',message:short?'A little city time. Here’s a 90-minute idea.':'Your evening, thoughtfully planned.',subtitle:'A walkable Cyber Hub itinerary. Suggested timings; check venue hours.',stops:[{place:PLACES.find(p=>p.id==='starbucks'),label:'COFFEE',time:short?'18:00 – 18:25':'18:00 – 18:30'},{place:PLACES[0],label:'EXPLORE THE PLAZA',time:short?'18:30 – 18:50':'18:35 – 19:15'},{place:PLACES.find(p=>p.id==='social'),label:'DINNER',time:short?'18:55 – 19:30':'19:20 – 20:00'}],note:/avoid|traffic/.test(q)?'Stops stay in one complex to reduce road travel. Live congestion avoidance is not available.':'Demo suggestions · not reservations or live recommendations'};}const matches=placesProvider.search(text.replace(/show me|find|take me to/gi,'').trim());if(matches.length)return {kind:'place',place:matches[0],message:`Found ${matches[0].name} in the curated city index.`};return {kind:'help',message:'I’m the demo copilot, not a live AI model. Try “Plan a 2 hour evening”, “Find coffee near Cyber Hub”, “Show metro stations”, or search for a place above.'};}};
export const preferences = {
 load() {
  try {
   const value = JSON.parse(localStorage.getItem('citypulse-preferences') || '{}');
   return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
 },
 save(value) {
  try { localStorage.setItem('citypulse-preferences', JSON.stringify(value)); }
  catch { /* Storage can be unavailable; the current session remains usable. */ }
 }
};
export const savedPlans = {
 load() {
  try {
   const value = JSON.parse(localStorage.getItem('citypulse-plans') || '[]');
   if (!Array.isArray(value)) return [];
   return value.filter(plan => plan && Array.isArray(plan.stops) && plan.stops.every(stop =>
    stop?.place && typeof stop.place.name === 'string' && Array.isArray(stop.place.coordinates) &&
    stop.place.coordinates.length === 2 && stop.place.coordinates.every(Number.isFinite)
   ));
  } catch { return []; }
 },
 add(plan) {
  const list = this.load();
  list.push({...plan, savedAt: new Date().toISOString()});
  localStorage.setItem('citypulse-plans', JSON.stringify(list.slice(-20)));
  return list;
 }
};
