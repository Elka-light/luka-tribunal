import test from 'node:test';
import assert from 'node:assert/strict';
import { routeUrl, parseRoute, formatDuration } from '../src/lib/routing.ts';

const start = { latitude: -4.325, longitude: 15.322 };
const end = { latitude: -4.35, longitude: 15.3 };

test('routing uses the distinct transport servers and longitude/latitude order', () => {
  for (const mode of ['foot', 'bike', 'car']) {
    const url = new URL(routeUrl(start, end, mode));
    assert.equal(url.hostname, 'routing.openstreetmap.de');
    assert.equal(url.pathname, `/routed-${mode}/route/v1/driving/15.322,-4.325;15.3,-4.35`);
    assert.equal(url.searchParams.get('geometries'), 'geojson');
  }
});

test('invalid coordinates and unsupported transport never produce a request URL', () => {
  for (const bad of [NaN, Infinity, 91, -91]) {
    assert.throws(() => routeUrl({ ...start, latitude: bad }, end, 'foot'));
  }
  assert.throws(() => routeUrl(start, { ...end, longitude: 181 }, 'car'));
  assert.throws(() => routeUrl(start, end, 'motorcycle'));
});

test('route parsing preserves provider duration and converts geometry for Leaflet', () => {
  assert.deepEqual(parseRoute({ code: 'Ok', routes: [{ duration: 125, distance: 220, geometry: {
    type: 'LineString', coordinates: [[15.322, -4.325], [15.3, -4.35]],
  } }] }), { duration: 125, distance: 220, points: [[-4.325, 15.322], [-4.35, 15.3]] });
  assert.equal(formatDuration(125), '3 min');
  assert.equal(formatDuration(3660), '1 h 1 min');
});

test('missing routes and malformed provider data cannot be displayed as a valid path', () => {
  for (const value of [{ code: 'NoRoute', routes: [] }, { code: 'Ok', routes: [] },
    { code: 'Ok', routes: [{ duration: -1, distance: 1, geometry: { type: 'LineString', coordinates: [[0, 0], [999, 999]] } }] }]) {
    assert.throws(() => parseRoute(value));
  }
});
