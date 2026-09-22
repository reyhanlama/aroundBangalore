import { describe, expect, it } from 'vitest';
import { lakes } from './catalog';
import { reportBySlug, sampleReports } from './reports';

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

  it('keeps demo reports explicitly marked as samples', () => {
    expect(sampleReports).toHaveLength(3);
    expect(sampleReports.every((report) => report.verification === 'sample')).toBe(true);
    expect(sampleReports.every((report) => lakes.find((lake) => lake.slug === report.lakeSlug)?.status === 'not_field_checked')).toBe(true);
  });

  it('keeps location verification separate from field status', () => {
    const located = lakes.filter((lake) => lake.coordinates);
    expect(located).toHaveLength(11);
    expect(located.every((lake) => lake.locationVerification?.status === 'verified')).toBe(true);
    expect(located.every((lake) => lake.locationVerification?.sourceUrl)).toBe(true);
  });

  it('keeps the two Singasandra records distinct while flagging their possible relationship', () => {
    const kodige = lakes.find((lake) => lake.id === 'blr-lake-096');
    const singasandra = lakes.find((lake) => lake.id === 'blr-lake-098');
    expect(kodige?.aliases).toContain('Kodi Singasandra Lake');
    expect(kodige?.coordinates).toEqual([77.641832, 12.877959]);
    expect(kodige?.duplicateCandidateIds).toContain(singasandra?.id);
    expect(singasandra?.duplicateCandidateIds).toContain(kodige?.id);
    expect(kodige?.id).not.toBe(singasandra?.id);
  });
});
