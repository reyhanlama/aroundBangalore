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

  it('keeps draft reports explicitly non-verified', () => {
    expect([...reportBySlug.values()].every((report) => report.verification === 'sample')).toBe(true);
  });
});
