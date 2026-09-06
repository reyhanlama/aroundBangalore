import { describe, expect, it } from 'vitest';
import { lakes } from './catalog';
import { reportBySlug } from './reports';

describe('lake catalogue', () => {
  it('contains exactly 210 unique entries', () => {
    expect(lakes).toHaveLength(210);
    expect(new Set(lakes.map((lake) => lake.id)).size).toBe(210);
    expect(new Set(lakes.map((lake) => lake.slug)).size).toBe(210);
  });

  it('never gives an unchecked lake a field report', () => {
    const invalid = lakes.filter((lake) => lake.status === 'not_field_checked' && reportBySlug.has(lake.slug));
    expect(invalid).toEqual([]);
  });

  it('publishes only verified personal reports', () => {
    expect([...reportBySlug.values()].every((report) => report.verification === 'verified')).toBe(true);
  });

  it('keeps location verification separate from field status', () => {
    const located = lakes.filter((lake) => lake.coordinates);
    expect(located).toHaveLength(10);
    expect(located.every((lake) => lake.locationVerification?.status === 'verified')).toBe(true);
    expect(located.every((lake) => lake.locationVerification?.sourceUrl)).toBe(true);
  });
});
