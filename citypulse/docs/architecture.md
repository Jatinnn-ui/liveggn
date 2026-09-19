# CityPulse architecture and production roadmap

## What actually runs

CityPulse is a static, browser-native application. It does **not** include a Python service, PostgreSQL database, Redis instance, authentication service, or LLM connection. The following production architecture is a design proposal, not an implemented backend.

```text
index.html + CSS
        │
        ├── js/app.js: UI events, inspector, itinerary, search, local state
        ├── services/providers.js: place lookup, road routing, demo intent parser
        ├── city-data/: curated points and genuine OSRM response snapshots
        └── 3d/city-engine.js
             ├── MapLibre GL: geographic projection, raster/vector tiles,
             │   extruded OSM footprints, rail/road lines, heatmap, route
             └── Three.js: shared WebGL context, instanced road vehicles,
                 sparse illustrative facade lights
```

All coordinates are WGS84 longitude/latitude. MapLibre handles the geographic camera. Three.js geometry is expressed in meters relative to Cyber City, converted to Web Mercator, and transformed by MapLibre's camera matrix. The origin-relative transform avoids unnecessary loss of floating-point precision.

Building heights use the vector tiles' `render_height` / `render_min_height`, with a nominal fallback where heights are missing. This is an OSM-derived massing model, **not** reconstructed facade geometry. Satellite imagery and footprints can have different acquisition dates and registration offsets.

### Rendering budget

- Footprint geometry is batched by the vector renderer, with tile loading and culling.
- A single vehicle `InstancedMesh`, capped at 220 vehicles on desktop and 80 on mobile.
- One optional facade-window `InstancedMesh`, capped at 1,800 instances on desktop and 650 on mobile.
- Bounded road sampling, deduplicated per view; refresh is debounced after camera movement.
- Crowd display uses small geographic points rather than animated character meshes.
- Time modifies light direction/color, base brightness, facade lights, and simulated traffic/crowd density.
- Rain and fog are inexpensive screen-space effects, not volumetric weather or physical reflections.
- No frame-rate guarantees or formal hardware benchmarks are claimed.

### Current copilot execution

1. Normalize a user's query.
2. Match a limited, deterministic set of local intents.
3. Return a structured action: place, plan, layer, or help.
4. The UI highlights places, opens a plan, changes a layer, or moves the camera.
5. A user explicitly requests road routing; the service fetches real OSRM geometry.

A plan tour flies between stops. **It is not a road-following route.** The separate Follow Route action follows the fetched polyline. Itinerary slots are suggestions, not a solved constraint-optimization problem. Route timing is for driving; walking times, venue availability, and live traffic avoidance are not verified.

## Proposed external backend — not implemented

A separately hosted service would be necessary for secret-key integrations, authentication, durable shared records, server-side caching, and robust provider quotas. No secrets should ever be placed in this public frontend.

| Proposed route | Responsibility |
|---|---|
| `GET /api/city` | City metadata, bounds, geographic dataset version and provenance |
| `GET /api/places?q=&bbox=&category=` | Paginated, geographically restricted place lookup |
| `GET /api/weather?lat=&lon=` | Weather with timestamps, source and freshness |
| `GET /api/traffic?bbox=` | Licensed observations or explicitly simulated response |
| `GET /api/transit?bbox=` | Validated stations, line topology and service information |
| `GET /api/events?bbox=&date=` | Verified event listings with retrieval times |
| `POST /api/route` | Validate endpoints and profile, return geometry and estimates |
| `POST /api/ai/query` | Authorized, rate-limited model/tool orchestration |
| `POST /api/ai/plan` | Validated structured itinerary and routing constraints |

These paths do **not** exist in the current application. The frontend calls the documented public geographic services directly.

### Proposed relational model

Use UUID primary keys. Store geometry in SRID 4326 and create GiST indexes on spatial fields. A normalized location record can serve place, event, and station references rather than copying coordinates into every table.

| Entity | Principal fields |
|---|---|
| users | id, external_identity_subject, display_name, preferences, created_at |
| cities | id, name, region, timezone, bounds, center, source_version |
| locations | id, city_id, name, category, point, source, source_id, verified_at |
| places | location_id, operator, website, opening_hours, hours_source |
| roads | id, city_id, osm_id, geometry, road_class, direction, restrictions, source_version |
| events | id, location_id, title, starts_at, ends_at, category, source_url, verified_at, status |
| transit_stations | location_id, operator, line_ids, interchange, source_version |
| weather_snapshots | id, city_id, observed_at, retrieved_at, valid_until, provider, status, metrics |
| city_layers | id, city_id, layer_type, source, source_version, provenance, configuration |
| saved_routes | id, user_id, city_id, waypoints, geometry, profile, distance_m, duration_s, provenance |
| saved_plans | id, user_id, city_id, title, ordered_stops, constraints, created_at |

The prototype instead uses `Place`, `Route`, `Plan`, and `Preferences` contracts described in `types/contracts.d.ts`, with curated files and browser localStorage. No database has been provisioned and no production records exist.

### Proposed caching and model tools

An external Redis service could cache geographic queries by rounded bounding box, place details by provider ID, weather by area and observation interval, and routes by coordinates/profile/dataset version. Freshness must survive through to the UI. Never cache user-private records under publicly shared keys.

Future model tools could implement `search_places`, `get_weather`, `get_air_quality`, `get_traffic`, `find_route`, `get_events`, `get_transit`, `create_itinerary`, and `get_location_details`. Validate tool input/output schemas, reject coordinates outside allowed city bounds, require provenance, limit tool rounds, and return explicit unavailable states. Treat third-party content as untrusted data. An LLM must not upgrade a simulated fact to a live observation.

Potential **server-only**, future configuration names:

```text
DATABASE_URL
REDIS_URL
AI_API_KEY
WEATHER_API_KEY
MAP_API_KEY
PLACES_API_KEY
TRAFFIC_API_KEY
EVENTS_API_KEY
```

These names are not read by this application. Adding an environment file does not enable a backend or real AI. This static deployment cannot safely consume secret-key APIs.

## Production readiness gaps

Before any production claim: verify coordinates and entrances, obtain provider licenses and capacity, migrate to a compiled strict TypeScript application if required, add automated accessibility and cross-browser testing, benchmark devices, introduce server authorization and rate limits, establish geographic refresh jobs, and monitor provider/data freshness. Replace the reference photo with a licensed asset if public commercial usage is planned.
