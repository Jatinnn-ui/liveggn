# CityPulse

### Gurugram, in perspective.

CityPulse is a map-first urban intelligence **frontend prototype** for Gurugram, Haryana, India. It combines real satellite imagery, OpenStreetMap footprints and roads, an explorable 3D camera, geographic city layers, real road routing, and an explicitly labelled demo city copilot.

**This is an interactive application, not a static dashboard mockup. It is not a complete production digital twin.** No live AI, authenticated backend, PostGIS database, Redis service, or verified real-time city feeds are connected. Those integrations require infrastructure outside this static hosting environment.

## Run immediately

Open `index.html` through the project's Preview or any static HTTP server. Serve the repository root, not just the `js` folder. No build, package installation, paid API key, or account is needed.

Do not double-click the file using `file://`: browser ES modules and local JSON fetches need HTTP/HTTPS. Use a current browser with WebGL support. Internet access is required for map tiles, imagery, CDN libraries, and uncached online search/routing. The curated assistant runs locally after the application loads; this is **not a fully offline map**.

To publish, use the platform's **Publish tab**. No production URL has been provisioned or verified in this implementation. Preview changes do not by themselves update any previously deployed public domain.

## Completed functionality

- Opens directly into Gurugram with a short city-name introduction and cinematic descent.
- Real Esri satellite imagery with OpenFreeMap / OpenStreetMap vector geometry.
- Extruded real building footprints; OSM-derived or estimated heights and illustrative materials.
- Inertial pan, zoom, rotate, tilt, 2D/3D toggle, reset north, and recenter.
- Building, road, map-point, and place inspection; smooth location fly-to.
- Curated search and keyboard autocomplete, with Photon / OSM fallback when the local index has no match.
- Ten geographic layers: buildings, roads, traffic, weather, AQI, transit, dining, events, construction, and crowds.
- Three.js instanced vehicles following actual sampled road paths; clearly simulated traffic.
- Real OSM railway geometry and curated metro points. No fabricated arrivals.
- Simulated day/sunset/night lighting, sparse night facade lights, and adjustable city time.
- Simulated clear, cloudy, rain, and fog environments.
- Simulated heatmap and crowd points; demo event and construction markers.
- Place inspector with explicit provenance, geographic coordinates, curated nearby counts, and route/plan actions.
- Deterministic demo copilot with structured place, itinerary, and layer actions.
- Two-hour or 90-minute Cyber Hub itinerary suggestions, editable by adding places.
- Real OSRM driving routes, estimated distance/duration, alternatives **when returned by the provider**, animated route drawing, overview, and camera follow.
- Separate place-by-place itinerary camera tour.
- Saved places/plans and layer/time preferences in browser localStorage.
- Responsive mobile panels, touch map controls, accessible control labels, keyboard search, dialogs, loading/error states.
- Real cached OSRM responses for the featured metro-to-Cyber-Hub route and Cyber Hub evening route.
- Browser-based interaction test runner.

## Entry URIs

| Path / parameter | Function |
|---|---|
| `/` or `/index.html` | Main interactive explorer |
| `/index.html?view=plan` | Open the demo evening itinerary after the city loads |
| `/index.html?view=route` | Open the driving route planner |
| `/index.html?place=ambience` | Fly to a curated place by its ID |
| `/index.html?time=22` | Start with simulated night lighting |
| `/index.html?weather=fog` | Enable the specified simulated weather scene |
| `/index.html?place=cyberhub&view=route&time=17.5` | Parameters can be combined |
| `/evening.html` | Convenient redirect to the evening itinerary |
| `/night.html` | Convenient redirect to night exploration |
| `/tests/interaction.html` | Run browser smoke tests against the real app |

`time` accepts numeric hours from 0 to 24. `weather` accepts `clear`, `cloudy`, `rain`, or `fog`. Place IDs are defined in `city-data/places.js`. Unsupported values are ignored. The map is constrained to Gurugram and its surrounding area.

## Controls

- Drag to pan; scroll or pinch to zoom.
- Right-drag / Ctrl-drag to rotate and tilt; use two fingers on touch devices.
- Click a marker, building, road, or empty map point to inspect it.
- Press `/` to focus global search. Arrow keys navigate results; Enter selects.
- Press Escape to dismiss overlays and stop a camera tour/follow.
- Toggle Layers on the left rail; on phones it opens a collapsible panel.
- Use the weather summary or settings icon to choose an environment.
- Use the time slider or play button to preview a simulated day.
- Get directions from the location inspector, or open the Routes rail button.
- The Demo Mode button explains data provenance and unavailable integrations.

## Data accuracy and provenance

| Data | Source | Status / caveat |
|---|---|---|
| Roads, footprints, rail geometry | OpenStreetMap via OpenFreeMap | Real geographic dataset; completeness and recency vary |
| Satellite imagery | Esri World Imagery | Real imagery, **not live**; provider mosaic dates vary |
| Building heights | OSM-derived tile properties, then nominal fallback | Derived / estimated; not survey-grade |
| Facade lighting and materials | Procedural renderer | Illustrative, not real architectural reconstruction |
| Curated places | Local geographic index | Static approximate points; not verified entrances |
| Online place search | Photon / OpenStreetMap | Public geographic lookup, not a live opening-status API |
| Driving routes | Public OSRM service | Real road geometry, estimated duration, no live traffic |
| Featured route fallbacks | Saved genuine OSRM responses | Static snapshots, labelled when used |
| Traffic / AQI / weather / crowds | Local simulation | **SIMULATED**, never live observations |
| Event / construction examples | Local illustrative records | **DEMO**, not actual events or closures |
| Copilot | Deterministic local intent matcher | **DEMO AI**, no LLM call |

Nearby counts refer only to curated places within 1.5 km, **not** an exhaustive census of businesses. Distances from city focus are straight-line geographic estimates. Simulated AQI is not a health measurement. Transit operating hours and real-time arrivals are unavailable. Venue opening hours, bookings, and availability are unavailable.

### Public services used

- Vector metadata: `https://tiles.openfreemap.org/planet`
- Basemap style source: `https://tiles.openfreemap.org/styles/dark` (a copy is stored locally)
- Satellite tiles: `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
- Geographic search: `https://photon.komoot.io/api/?q=…&lat=28.49&lon=77.08&limit=6`
- Driving routing: `https://router.project-osrm.org/route/v1/driving/{coordinates}?overview=full&geometries=geojson&alternatives=true&steps=false`
- Libraries: jsDelivr; font: Google Fonts, Inter.

All current browser API calls are public, authorization-free requests. Public demo providers have no service guarantee; respect their terms and quotas. Do not treat them as a production entitlement. Confirm satellite and photo usage permissions before a commercial launch. Geographic attribution remains visible in the map and data dialog.

## Architecture and files

```text
index.html                    Semantic application shell
css/style.css                 Desktop/tablet/mobile styling
js/app.js                     UI controller, actions, search, inspector, plans
3d/city-engine.js             MapLibre camera and geographic scene; Three.js integration
3d/facade-details.js          Bounded instanced illustrative night windows
services/providers.js        Place, route, demo copilot and local persistence providers
city-data/places.js           Curated places, demo markers, geographic utilities
city-data/basemap-style.json  OpenFreeMap map style
city-data/routes/             Genuine cached OSRM JSON responses
images/cyberhub.jpg           Reference photograph
types/contracts.d.ts         Integration contracts (not a compiled application)
docs/architecture.md          Rendering design and proposed external backend architecture
tests/interaction.html        Browser integration-test runner
tests/interaction.js          Functional assertions and provider-failure tests
evening.html / night.html     Shareable demo entry points
```

Runtime uses **HTML, CSS, browser-native JavaScript modules, MapLibre GL 4.7.1, Three.js 0.158, Lucide icons, and Inter**. MapLibre provides geographic tile rendering and the camera; Three.js shares its WebGL context for instanced objects. The application intentionally avoids a build dependency so it works in this static environment.

**React Three Fiber, Drei, React, GSAP, Framer Motion, and a compiled strict-TypeScript application are not implemented.** Browser CSS transitions and the map's camera animation system are used instead. `types/contracts.d.ts` documents integration types; it does not imply that the JavaScript runtime has passed a strict TypeScript compiler.

See [Architecture](docs/architecture.md) for geographic projection, rendering budgets, backend API proposals, and the proposed PostgreSQL/PostGIS schema.

## Storage and models

No Table API, server database, or authentication is currently used.

- `Place`: ID, name, type/category, longitude/latitude, area, description, optional image/line information.
- `Route`: GeoJSON LineString, distance in km, estimated minutes, source and status.
- `Plan`: ordered stops containing a place, suggested time slot and activity label, optional note/name.
- `Preferences`: layer visibility and simulated hour.
- Local key `citypulse-preferences`: most recently saved layer/time choices.
- Local key `citypulse-plans`: up to 20 saved places or itineraries.

Clearing browser storage removes saved data. It is not synchronized between devices, accounts, preview URLs, or deployed sites. Saved plans are not private server records. Malformed local JSON falls back to an empty state; blocked writes report an error instead of claiming a save.

## Demo AI architecture

`copilotProvider.query(text)` returns a structured discriminated response, not arbitrary HTML or model output. The controller executes place selection, layer toggling, itinerary display, or a camera action.

Try:

- “Plan a 2 hour evening in Gurgaon. Avoid heavy traffic.”
- “I have 90 minutes before dinner.”
- “Find coffee near Cyber Hub.”
- “Show metro stations.”
- “Which areas are busiest right now?” — explicitly explains that live traffic is unavailable.

The demo has a limited vocabulary and a fixed curated itinerary. It does not search arbitrary venue availability, optimize live congestion, make reservations, or understand unrestricted natural language. The road route is requested only on user action. A production model could replace the provider contract through a separately secured server, not by putting an API key in browser JavaScript.

## Failure behavior

- Tile/style failures show a visible retry message instead of an empty silent screen.
- Search falls back to the curated index with a clear online-unavailable message.
- Routing uses real cached snapshots only for exact featured endpoint combinations; it never draws a fabricated straight line as a road.
- Other routing failures show an unavailable state without inventing geometry.
- Simulation data is labelled even when external services work.
- Copilot has an explicit help response for unsupported requests and a clean failure state.
- No secret credentials or client-side fake authentication checks are present.

## Validation

Open `/tests/interaction.html` to run assertions against the real application in an iframe. Tests exercise: engine initialization, Three.js instancing, autocomplete, place selection, geographic layer visibility, weather and night state, structured itinerary creation, local saving, saved-plan dialog, coffee intent, OSRM routing, displayed estimates, route follow/stop/clear, exact-route snapshot fallback, unavailable-route behavior, corrupt-storage recovery, and reset behavior. Test-created storage is restored afterward.

The runner is a **functional test**, not a substitute for mobile screenshots. Actual application renders have also been reviewed at 1280×800 desktop and 390×844 mobile, including the main explorer, itinerary view, and desktop night view. Browser software-WebGL warnings and the legacy Three.js distribution deprecation notice may appear; these are not runtime application errors.

No formal accessibility audit, load test, comprehensive security review, SLA, or cross-device frame-rate benchmark has been performed.

## Screenshots

- [Desktop explorer](https://www.genspark.ai/api/files/s/FziNPttY)
- [Mobile explorer](https://www.genspark.ai/api/files/s/36ypiMqG)
- [Mobile evening itinerary](https://www.genspark.ai/api/files/s/IpG5G54o)
- [Desktop evening itinerary](https://www.genspark.ai/api/files/s/lNuXwVVm)
- [Desktop night view](https://www.genspark.ai/api/files/s/kJVRfbKh)

These are development captures, not deployed-site URLs. Regenerate captures after visual changes. The reference Cyber Hub photograph is from the LBB listing identified during asset research, not a live camera.

## Environment variables

**None are required or read by this static demo.** There is no environment-file loader. External endpoint configuration lives in the provider and map-engine modules.

Future server-only names such as `AI_API_KEY`, `WEATHER_API_KEY`, `TRAFFIC_API_KEY`, `PLACES_API_KEY`, `EVENTS_API_KEY`, `DATABASE_URL`, and `REDIS_URL` are discussed in the architecture document. Adding those names to a file does not implement their integrations. Never commit or expose secret keys in this public project.

## Known limitations / not implemented

- No FastAPI backend, PostgreSQL/PostGIS database, Redis caching, shared persistence, user authentication, or live Gemini/OpenAI integration.
- No photogrammetry, detailed landmark meshes, surveyed facade materials, balconies, accurate interiors, or building-specific tenant inventory.
- No physically based sun-shadow studies, wet-road reflections, volumetric weather, or verified astronomical sun position.
- Traffic follows sampled real road segments, but lane directions, intersection rules, signal timing, collision avoidance, and real congestion are not modelled.
- Road/rail layers use OSM geometry; satellite roads remain visible when vector road rendering is disabled because they are part of the imagery.
- Transit routes are OSM rail geometry, not a verified operator line graph. No fares, schedules, or real-time arrivals.
- No live AQI, weather, traffic, construction, crowds, or verified events.
- No detailed pedestrian routing. Camera tours between itinerary stops are distinct from fetched road routes.
- Only a small curated place catalog and featured itinerary; not comprehensive city coverage.
- External public API availability, imagery alignment, and OSM completeness vary.
- No service-worker offline map or private API keys; initial loading requires connectivity.

## Recommended next steps

1. Validate curated coordinates, public entrances, OSM building coverage, and data/photo licensing.
2. Benchmark rendering on representative laptops and phones; add browser automation and accessibility audits.
3. Move to a compiled strict TypeScript toolchain if required, keeping the provider and scene boundaries.
4. Build a separately hosted authenticated backend with PostGIS queries, caching, freshness metadata, and quotas.
5. Connect licensed observations and a server-side structured-tool AI model, retaining explicit unavailable/simulated states.
6. Add pedestrian routes, accessible entrances, verified venue hours, and itinerary constraint checks.
7. Add geographically registered landmark assets and richer facade detail only where data supports it.
8. Establish provider monitoring, stale-data alerts, geographic refresh jobs, and production operational ownership.

**Goal:** make a real city understandable and explorable without disguising demo intelligence as live reality.
