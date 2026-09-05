import type { Coordinates } from '../types';

export function distanceKm(from: Coordinates, to: Coordinates) {
  const earthRadiusKm = 6371;
  const radians = (value: number) => value * Math.PI / 180;
  const dLat = radians(to[1] - from[1]);
  const dLng = radians(to[0] - from[0]);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(from[1])) * Math.cos(radians(to[1])) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
