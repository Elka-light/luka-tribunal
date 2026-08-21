export type Coordinates = {
  latitude: number
  longitude: number
}

export function areValidCoordinates({ latitude, longitude }: Coordinates): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0)
  )
}

export function toPostgisPoint({ latitude, longitude }: Coordinates): [number, number] {
  if (!areValidCoordinates({ latitude, longitude })) {
    throw new RangeError('Invalid geographic coordinates')
  }

  return [longitude, latitude]
}
