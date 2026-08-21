import { test } from '@japa/runner'
import { areValidCoordinates, toPostgisPoint } from '#services/coordinates'

test.group('Coordinates', () => {
  test('accepts and converts a point to longitude/latitude order', ({ assert }) => {
    const coordinates = { latitude: -4.325, longitude: 15.322 }

    assert.isTrue(areValidCoordinates(coordinates))
    assert.deepEqual(toPostgisPoint(coordinates), [15.322, -4.325])
  })

  test('rejects out-of-range and null-island points', ({ assert }) => {
    assert.isFalse(areValidCoordinates({ latitude: 91, longitude: 15 }))
    assert.isFalse(areValidCoordinates({ latitude: -4, longitude: 181 }))
    assert.isFalse(areValidCoordinates({ latitude: 0, longitude: 0 }))
  })
})
