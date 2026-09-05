# Nadi

A mobile-first, installable field guide to Bengaluru's lakes. The application combines a versioned official catalogue with a deliberately separate layer of personally verified field reports.

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
- `src/data/reports.ts` contains five sample report shells. They remain labeled as demo content until replaced with verified field visits.
- Unvisited lake entries must never contain inferred access, path, safety or environmental information.

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
