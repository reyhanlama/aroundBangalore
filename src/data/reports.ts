import type { LakeReport } from '../types';
import { lakeBySlug } from './catalog';

const routeAround = (slug: string, radius = 0.006): GeoJSON.Feature<GeoJSON.LineString> => {
  const center = lakeBySlug.get(slug)?.coordinates;
  if (!center) throw new Error(`No coordinates for ${slug}`);
  const [lng, lat] = center;
  const points = Array.from({ length: 25 }, (_, index) => {
    const angle = (index / 24) * Math.PI * 2;
    return [lng + Math.cos(angle) * radius, lat + Math.sin(angle) * radius * 0.65];
  });
  return { type: 'Feature', properties: { draft: true }, geometry: { type: 'LineString', coordinates: points } };
};

const reportSeed = [
  ['venkojirao-kere-agara-kere', 'An easy everyday loop with generous morning shade and room to settle into a rhythm.', 2.8, 'Packed earth'],
  ['kaigondanahalli-lake', 'A soft, green loop for an unhurried visit, with changing activity around the water.', 2.6, 'Mixed path'],
  ['sankey-lake', 'A compact urban lake whose paths, entrances and busy edges reward repeat observation.', 2.4, 'Paved'],
  ['jakkur-lake', 'A longer open edge where water, wetland and neighbourhood life meet.', 4.1, 'Red earth'],
  ['ulsoor-bangalore-north', 'A central lake shaped by city movement, old trees and glimpses of water.', 3.0, 'Mixed path']
] as const;

export const reports: LakeReport[] = reportSeed.map(([lakeSlug, summary, distanceKm, surface], index) => ({
  lakeSlug,
  verification: 'sample',
  summary,
  distanceKm,
  surface,
  route: routeAround(lakeSlug, 0.0048 + index * 0.00035),
  photos: [],
  visits: [{
    id: `${lakeSlug}-sample-visit`,
    visitedAt: '2026-09-02',
    time: '06:42',
    weather: 'Sample observation',
    note: 'This draft demonstrates the field-note format. Replace it with a dated personal observation before publishing.',
    observations: [
      { category: 'shade', state: 'unknown', segmentIds: [] },
      { category: 'smell', state: 'unknown', segmentIds: [] },
      { category: 'crowd', state: 'unknown', segmentIds: [] },
      { category: 'surface', state: 'observed', value: surface, segmentIds: ['full-loop'] },
      { category: 'lighting', state: 'not_checked', segmentIds: [] }
    ]
  }]
}));

export const reportBySlug = new Map(reports.map((report) => [report.lakeSlug, report]));
