# Nadi

A mobile-first, installable field guide to Bengaluru's lakes. The application combines a versioned official catalogue with a deliberately separate layer of personally verified field reports.

## Product structure

- **Lakes** is the home screen and searchable index of all 210 official records.
- **Explore map** is an optional spatial view for records with verified coordinates.
- **Field notes** contains only dated, personally verified reports.
- **Our approach** explains sources, uncertainty, and what has not been checked.

## Adding a field report

Nadi does not replace an activity tracker and requires no input during a visit. A report begins with an activity screenshot from Strava, Apple Fitness, or a similar service, visit photographs, and an optional GPX export. Free-form notes can be supplied later.

Activity screenshots are supporting evidence, not automatically published facts. GPX is optional; when it is unavailable, the report must not invent a route. Accessibility, safety, lake health, and route quality are never inferred from an activity file or photograph alone. Reviewed report data belongs in `src/data/reports.ts`; raw personal imports should not be committed.

## Run locally

```bash
npm install
npm run dev
```

The app falls back to OpenFreeMap for local development. For production, copy `.env.example` to `.env.local` and provide either:

```bash
VITE_MAPTILER_KEY=your_key
```

or a complete MapLibre style URL:

```bash
VITE_MAP_STYLE_URL=https://example.com/style.json
```

## Content model

- `src/data/lakes.json` is the 210-record, versioned catalogue snapshot.
- `src/data/reports.ts` publishes only verified reports. Draft shells remain outside the public application until real visits, evidence and dates are supplied.
- Unvisited lake entries must never contain inferred access, path, safety or environmental information.
- Map links appear only when coordinates include explicit verification metadata and a coordinate source. Lake centroids are never presented as confirmed entrances.

To regenerate the normalized catalogue from an updated authority CSV:

```bash
npm run catalog:build -- /absolute/path/to/official-lakes.csv
```

Review changes manually before publishing because official files can contain duplicate names, multiline fields and custody changes.

## Quality checks

```bash
npm test
npm run build
```

The tests enforce the 210-entry catalogue, unique IDs and slugs, separation of unchecked lakes from field reports, and local distance calculations.
