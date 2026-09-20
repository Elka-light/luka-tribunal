import { z } from "zod";

export const travelModes = { foot: "À pied", bike: "À vélo", car: "En voiture" } as const;
export type TravelMode = keyof typeof travelModes;
export type Position = { latitude: number; longitude: number };
const positionSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
});
const routeSchema = z.object({
  code: z.literal("Ok"),
  routes: z.array(z.object({
    duration: z.number().finite().nonnegative(),
    distance: z.number().finite().nonnegative(),
    geometry: z.object({
      type: z.literal("LineString"),
      coordinates: z.array(z.tuple([
        z.number().finite().min(-180).max(180),
        z.number().finite().min(-90).max(90),
      ])).min(2),
    }),
  })).min(1),
});
export type Route = { duration: number; distance: number; points: [number, number][] };

export function routeUrl(start: Position, end: Position, mode: TravelMode) {
  positionSchema.parse(start);
  positionSchema.parse(end);
  if (!Object.hasOwn(travelModes, mode)) throw new Error("Mode de transport indisponible.");
  // Each server has a distinct precomputed profile, regardless of the path profile name.
  return `https://routing.openstreetmap.de/routed-${mode}/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson&steps=false`;
}

export function parseRoute(data: unknown): Route {
  const route = routeSchema.parse(data).routes[0];
  return {
    duration: route.duration,
    distance: route.distance,
    points: route.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]),
  };
}

export function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

let queue: Promise<unknown> = Promise.resolve();
let lastRequest = 0;
export function fetchRoute(start: Position, end: Position, mode: TravelMode, signal: AbortSignal): Promise<Route> {
  const url = routeUrl(start, end, mode);
  const task = queue.catch(() => {}).then(async () => {
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, 1100 - (Date.now() - lastRequest))));
    signal.throwIfAborted();
    lastRequest = Date.now();
    const response = await fetch(url, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
      credentials: "omit", cache: "no-store",
    });
    if (!response.ok) throw new Error("Itinéraire indisponible. Réessayez plus tard.");
    return parseRoute(await response.json());
  });
  queue = task;
  return task;
}
