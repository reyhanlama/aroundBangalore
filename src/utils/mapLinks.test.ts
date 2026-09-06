import { describe, expect, it } from 'vitest';
import { appleLocationUrl, googleDirectionsUrl, googleLocationUrl } from './mapLinks';

const point: [number, number] = [77.57, 13.01];

describe('external map links', () => {
  it('uses latitude, longitude order expected by map providers', () => {
    expect(googleLocationUrl(point)).toContain('query=13.01,77.57');
    expect(googleDirectionsUrl(point)).toContain('destination=13.01,77.57');
  });

  it('includes a readable label in Apple Maps', () => {
    expect(appleLocationUrl('Sankey Tank', point)).toContain('q=Sankey+Tank');
  });
});
