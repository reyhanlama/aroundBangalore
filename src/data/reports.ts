import type { LakeReport } from '../types';

// Publish reports only after a dated personal visit has been supplied and verified.
// Draft shells intentionally stay out of the public application.
export const reports: LakeReport[] = [];

// Design-review content only. These reports exercise the complete product flow without
// claiming that a personal visit or activity file has been verified.
export const sampleReports: LakeReport[] = [
  {
    lakeSlug: 'sankey-lake',
    verification: 'sample',
    summary: 'A morning by the water. Sample notes on shade, paths and the pace of the place.',
    activity: {
      source: 'strava',
      capturedAt: '2026-08-30',
      distanceKm: 3.2,
      durationMinutes: 24,
      elevationGainMetres: 18
    },
    visits: [{
      id: 'sample-sankey-01',
      visitedAt: '2026-08-30',
      time: '07:05',
      weather: 'Example: overcast, 21°C',
      note: 'Sample note: the first kilometre felt calm, with a busier stretch later in the loop. This text is here to test the reading rhythm, not to describe current conditions.',
      observations: [
        { category: 'shade', state: 'observed', value: 'Example: intermittent', segmentIds: [] },
        { category: 'surface', state: 'observed', value: 'Example: mostly paved', segmentIds: [] },
        { category: 'crowd', state: 'observed', value: 'Example: moderate after 7:30', segmentIds: [] },
        { category: 'smell', state: 'not_checked', segmentIds: [] },
        { category: 'lighting', state: 'not_checked', segmentIds: [] }
      ]
    }],
    ratings: [
      { category: 'shade', score: 3, note: 'Sample score' },
      { category: 'surface', score: 4, note: 'Sample score' },
      { category: 'calmness', score: 4, note: 'Sample score' },
      { category: 'wayfinding', score: 4, note: 'Sample score' }
    ],
    photos: []
  },
  {
    lakeSlug: 'jakkur-lake',
    verification: 'sample',
    summary: 'A longer morning loop. Sample notes on changing surfaces and quieter stretches.',
    activity: {
      source: 'apple_fitness',
      capturedAt: '2026-08-23',
      distanceKm: 4.8,
      durationMinutes: 39,
      elevationGainMetres: 22
    },
    visits: [{
      id: 'sample-jakkur-01',
      visitedAt: '2026-08-23',
      time: '06:42',
      weather: 'Example: clear, 20°C',
      note: 'Sample note: this entry demonstrates a longer, quieter outing with a change in surface partway through. Replace it with a few sentences after a real visit.',
      observations: [
        { category: 'shade', state: 'observed', value: 'Example: patchy', segmentIds: [] },
        { category: 'surface', state: 'observed', value: 'Example: mixed', segmentIds: [] },
        { category: 'crowd', state: 'observed', value: 'Example: light', segmentIds: [] },
        { category: 'smell', state: 'unknown', segmentIds: [] },
        { category: 'lighting', state: 'not_checked', segmentIds: [] }
      ]
    }],
    ratings: [
      { category: 'shade', score: 2, note: 'Sample score' },
      { category: 'surface', score: 3, note: 'Sample score' },
      { category: 'calmness', score: 5, note: 'Sample score' },
      { category: 'wayfinding', score: 3, note: 'Sample score' }
    ],
    photos: []
  },
  {
    lakeSlug: 'venkojirao-kere-agara-kere',
    verification: 'sample',
    summary: 'A short city escape. Sample notes from a morning at the lake.',
    activity: {
      source: 'other',
      capturedAt: '2026-08-16',
      distanceKm: 2.7,
      durationMinutes: 21,
      elevationGainMetres: 9
    },
    visits: [{
      id: 'sample-agara-01',
      visitedAt: '2026-08-16',
      time: '07:28',
      weather: 'Example: humid, 22°C',
      note: 'Sample note: a concise entry can still communicate the shape of an outing. Only observations that were actively checked should appear in a real report.',
      observations: [
        { category: 'shade', state: 'observed', value: 'Example: limited', segmentIds: [] },
        { category: 'surface', state: 'observed', value: 'Example: even', segmentIds: [] },
        { category: 'crowd', state: 'observed', value: 'Example: active', segmentIds: [] },
        { category: 'smell', state: 'not_checked', segmentIds: [] },
        { category: 'lighting', state: 'not_checked', segmentIds: [] }
      ]
    }],
    ratings: [
      { category: 'shade', score: 2, note: 'Sample score' },
      { category: 'surface', score: 4, note: 'Sample score' },
      { category: 'calmness', score: 3, note: 'Sample score' },
      { category: 'wayfinding', score: 4, note: 'Sample score' }
    ],
    photos: []
  }
];

export const reportBySlug = new Map(reports.map((report) => [report.lakeSlug, report]));
export const sampleReportBySlug = new Map(sampleReports.map((report) => [report.lakeSlug, report]));
export const previewReportBySlug = new Map([...reports, ...sampleReports].map((report) => [report.lakeSlug, report]));
