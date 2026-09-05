import { describe, expect, it } from 'vitest';
import { distanceKm } from './geo';

describe('distanceKm', () => {
  it('returns zero for the same point', () => expect(distanceKm([77.6, 13], [77.6, 13])).toBe(0));
  it('returns a local distance in kilometres', () => expect(distanceKm([77.5704, 13.0102], [77.5868, 13.0466])).toBeGreaterThan(4));
});
