/** Integration contracts only. Runtime is browser-native JavaScript, not a compiled TypeScript application. */
export type Coordinates = readonly [longitude: number, latitude: number];
export type DataStatus = 'static' | 'estimated' | 'simulated' | 'demo' | 'unavailable' | 'live';
export type LayerId = 'buildings' | 'roads' | 'traffic' | 'weather' | 'aqi' | 'transit' | 'restaurants' | 'events' | 'construction' | 'crowd';
export type WeatherScene = 'clear' | 'cloudy' | 'rain' | 'fog';
export interface Provenance {
 status: DataStatus;
 source: string;
 observedAt?: string;
 retrievedAt?: string;
 caveat?: string;
}
export interface Place {
 id: string;
 name: string;
 category: string;
 type: string;
 coordinates: Coordinates;
 area: string;
 description: string;
 image?: string;
 lines?: string;
}
export interface Route {
 geometry: { type: 'LineString'; coordinates: Coordinates[] };
 /** Kilometers */
 distance: number;
 /** Rounded minutes; estimate, not current traffic */
 duration: number;
 source: string;
 status: string;
}
export interface PlanStop { place: Place; label: string; time: string; }
export interface Plan {
 name?: string;
 message?: string;
 subtitle?: string;
 note?: string;
 stops: PlanStop[];
 savedAt?: string;
}
export type CopilotResponse =
 | ({kind: 'plan'} & Plan)
 | {kind: 'place'; place: Place; message: string}
 | {kind: 'traffic' | 'weather' | 'aqi' | 'transit' | 'help'; message: string};
export interface PlacesProvider {
 search(query: string): Place[];
 searchOSM(query: string): Promise<Place[]>;
}
export interface RouteProvider { route(places: Place[]): Promise<Route[]>; }
export interface CopilotProvider { query(text: string): Promise<CopilotResponse>; }
export interface Preferences { layers?: Partial<Record<LayerId, boolean>>; time?: string | number; }
