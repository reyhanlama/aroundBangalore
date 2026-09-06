import type { Coordinates } from '../types';

export function googleLocationUrl([longitude, latitude]: Coordinates) {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export function appleLocationUrl(name: string, [longitude, latitude]: Coordinates) {
  const query = new URLSearchParams({ ll: `${latitude},${longitude}`, q: name });
  return `https://maps.apple.com/?${query.toString()}`;
}

export function googleDirectionsUrl([longitude, latitude]: Coordinates) {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

export function appleDirectionsUrl([longitude, latitude]: Coordinates) {
  return `https://maps.apple.com/?daddr=${latitude},${longitude}`;
}
