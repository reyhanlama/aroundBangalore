import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { StatusTag } from '../components/StatusTag';
import { AtlasMap as DirectoryMap } from '../components/AtlasMap';
import { LakeLoopGlyph } from '../components/LakeLoopGlyph';
import { custodianLabel, lakeBySlug, lakes, statusLabel } from '../data/catalog';
import { reports, sampleReportBySlug, sampleReports } from '../data/reports';
import { illustrationForSample } from '../data/illustrations';
import type { LakeIndexEntry, LakeStatus } from '../types';

function normalizeText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/bangalore/gi, 'bengaluru')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase();
}

function displaySourceArea(value: string) {
  if (/^160/i.test(value)) return 'Sarvagna Nagar';
  if (/^161/i.test(value)) return 'C. V. Raman Nagar';
  if (/^162/i.test(value)) return 'Shivajinagar';
  if (/^154/i.test(value)) return 'Rajarajeshwari Nagar';
  if (/yashwanth|yeshwanth/i.test(value)) return 'Yeshwanthpur';
  if (/rajarajesh|rajarajeshwari/i.test(value)) return 'Rajarajeshwari Nagar';
  if (/c\.v\.raman/i.test(value)) return 'C. V. Raman Nagar';
  if (/bangalore north additional/i.test(value)) return 'Bengaluru North Additional';
  return value.replace(/^Bangalore /, 'Bengaluru ');
}

export function LakesPage() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(() => params.has('lake') || window.matchMedia('(min-width: 1000px)').matches);
  const selectMapLake = useCallback((lake: LakeIndexEntry) => {
    setParams(previous => { const next = new URLSearchParams(previous); next.set('lake', lake.slug); return next; }, { replace: true });
    setMapOpen(true);
  }, [setParams]);
  useEffect(() => {
    if ([...params.keys()].some((key) => ['status', 'custodian', 'area', 'location', 'sort'].includes(key))) setFiltersOpen(true);
  }, [params]);
  const query = params.get('q') ?? '';
  const status = params.get('status') ?? 'all';
  const custodian = params.get('custodian') ?? 'all';
  const area = params.get('area') ?? 'all';
  const location = params.get('location') ?? 'all';
  const sampleOnly = params.get('notes') === 'sample';
  const sort = params.get('sort') ?? 'field';
  const areas = useMemo(() => [...new Set(lakes.map((lake) => displaySourceArea(lake.zone)))].sort(), []);
  const featuredReport = reports[0];
  const featuredLake = featuredReport ? lakeBySlug.get(featuredReport.lakeSlug) : undefined;

  const filtered = useMemo(() => lakes.filter((lake) => {
    const haystack = normalizeText(`${lake.name} ${lake.aliases.join(' ')} ${lake.ward} ${lake.zone} ${lake.custodian} ${custodianLabel[lake.custodian]}`);
    const queryTokens = normalizeText(query).split(' ').filter(Boolean);
    const locationMatch = location === 'all' || (location === 'mapped' ? Boolean(lake.coordinates) : !lake.coordinates);
    return queryTokens.every((token) => haystack.includes(token))
      && (status === 'all' || lake.status === status)
      && (custodian === 'all' || lake.custodian === custodian)
      && (area === 'all' || displaySourceArea(lake.zone) === area)
      && locationMatch
      && (!sampleOnly || sampleReportBySlug.has(lake.slug));
  }).sort((a, b) => {
    if (query) {
      const normalizedQuery = normalizeText(query);
      const aNames = [a.name, ...a.aliases].map(normalizeText);
      const bNames = [b.name, ...b.aliases].map(normalizeText);
      const score = (names: string[]) => names.some((name) => name === normalizedQuery) ? 0 : names.some((name) => name.startsWith(normalizedQuery)) ? 1 : 2;
      const matchRank = score(aNames) - score(bNames);
      if (matchRank) return matchRank;
    }
    if (sort === 'alpha') return a.name.localeCompare(b.name);
    const rank = (value: LakeStatus) => value === 'field_checked' ? 0 : value === 'report_in_progress' ? 1 : 2;
    return rank(a.status) - rank(b.status) || a.name.localeCompare(b.name);
  }), [area, custodian, location, query, sort, status, sampleOnly]);
  const mappedResults = useMemo(() => filtered.filter(lake => lake.coordinates && lake.locationVerification), [filtered]);
  const selectedLake = mappedResults.find(lake => lake.slug === params.get('lake'));

  const update = (key: string, value?: string, replace = true) => {
    const next = new URLSearchParams(params);
    value && value !== 'all' && !(key === 'sort' && value === 'field') ? next.set(key, value) : next.delete(key);
    setParams(next, { replace });
  };

  const activeFilters = [
    query && ['q', `Search: “${query}”`],
    sampleOnly && ['notes', 'Sample notes'],
    status !== 'all' && ['status', statusLabel[status as LakeStatus]],
    custodian !== 'all' && ['custodian', custodian],
    area !== 'all' && ['area', area],
    location !== 'all' && ['location', location === 'mapped' ? 'Mapped locations' : 'Catalogue only']
  ].filter(Boolean) as string[][];

  return (
    <div className="directory-page page-wrap">
      <header className="page-heading directory-heading"><p className="eyebrow">BENGALURU / THE LAKE GUIDE</p><h1>A city of <span>water.</span></h1><span className="hero-art-credit">ORIGINAL EDITORIAL ILLUSTRATION</span></header>


      {featuredLake && featuredReport && <section className={`featured-report ${featuredReport.verification === 'sample' ? 'sample-feature' : ''}`} aria-labelledby="featured-report-title">{featuredReport.verification === 'sample' && <img className="featured-art" src={illustrationForSample(0)} alt="Conceptual illustration of a person beside a city lake; not a photograph of this lake" />}<div><p className="eyebrow">{featuredReport.verification === 'sample' ? 'SAMPLE FIELD NOTE · DESIGN PREVIEW' : 'LATEST FIELD NOTE'}</p><h2 id="featured-report-title">{featuredLake.aliases[0] || featuredLake.name}</h2><p>{featuredReport.summary}</p>{featuredReport.verification === 'sample' && <small>Placeholder observations—not a field-checked claim.</small>}</div><Link to={`/lakes/${featuredLake.slug}`}>{featuredReport.verification === 'sample' ? 'Open sample report' : 'Read the field report'} <span>→</span></Link></section>}

      <section className="home-notes" aria-label="Sample field notes"><header><h2>From the notebook</h2><Link to="/field-notes">All notes ↗</Link></header><div>{sampleReports.map((report, index) => { const lake = lakeBySlug.get(report.lakeSlug)!; return <Link key={lake.slug} to={`/lakes/${lake.slug}#visit-notes`}><img src={illustrationForSample(index)} alt="" loading="lazy" /><small>SAMPLE NOTE · ILLUSTRATED</small><b>{lake.aliases[0] || lake.name}</b><span>Read the visit →</span></Link>; })}</div></section>
      <div className="directory-workspace"><div className="directory-index">
      <section className="directory-tools" aria-label="Lake directory filters">
        <div className="directory-search-row"><label className="search-box"><span>Search all lakes</span><span className="search-input-wrap"><input value={query} onChange={(event) => update('q', event.target.value)} placeholder="Lake name, alternate name or neighbourhood" />{query && <button aria-label="Clear search" onClick={() => update('q')}>×</button>}</span></label><Link className="explore-map-link" to={`/explore${query ? `?q=${encodeURIComponent(query)}` : ''}`}><span>⌖</span> Explore on map</Link></div>
        <div className="discovery-shortcuts" aria-label="Quick lake filters"><button aria-pressed={!sampleOnly && location === 'all'} onClick={() => { const next = new URLSearchParams(params); next.delete('notes'); next.delete('location'); setParams(next, { replace: true }); }}>All lakes <span>210</span></button><button aria-pressed={location === 'mapped'} onClick={() => update('location', location === 'mapped' ? undefined : 'mapped')}>On the map ↗</button><button aria-pressed={sampleOnly} onClick={() => update('notes', sampleOnly ? undefined : 'sample')}>Sample notes <span>03</span></button></div>
        <details className="filter-drawer" open={filtersOpen} onToggle={(event) => setFiltersOpen(event.currentTarget.open)}>
          <summary>More filters and sorting <span>{activeFilters.length ? `${activeFilters.length} active` : 'Show'}</span></summary>
          <div className="filter-grid">
            <label><span>Field status</span><select value={status} onChange={(event) => update('status', event.target.value)}><option value="all">All field statuses</option>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label><span>Maintaining authority</span><select value={custodian} onChange={(event) => update('custodian', event.target.value)}><option value="all">All authorities</option>{(['BBMP','BDA','KFD','BMRCL','LDA'] as const).map((value) => <option key={value} value={value}>{value} — {custodianLabel[value]}</option>)}</select></label>
            <label><span>Source area</span><select value={area} onChange={(event) => update('area', event.target.value)}><option value="all">All source areas</option>{areas.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span>Map coverage</span><select value={location} onChange={(event) => update('location', event.target.value)}><option value="all">All records</option><option value="mapped">Mapped locations</option><option value="catalogue">Catalogue only</option></select></label>
            <label><span>Sort</span><select value={sort} onChange={(event) => update('sort', event.target.value)}><option value="field">Field-checked first</option><option value="alpha">A–Z by official name</option></select></label>
          </div>
        </details>
      </section>

      {activeFilters.length > 0 && <div className="active-filters" aria-label="Active filters">{activeFilters.map(([key, label]) => <button key={key} onClick={() => update(key)}>{label}<span aria-hidden="true">×</span></button>)}<button className="clear-all" onClick={() => setParams({})}>Clear all</button></div>}

      <div className="directory-count" aria-live="polite"><b>{filtered.length}</b><span>{activeFilters.length ? 'lakes found' : 'lakes to get to know'}</span><small>ILLUSTRATIVE LOOPS · NOT SHORELINES</small></div>
      <section className="lake-directory" aria-label="Lake directory results">
        {filtered.map((lake, index) => (
          <article key={lake.id} className="directory-row">
            <Link className="directory-row-main" to={`/lakes/${lake.slug}`}>
              <span className="row-visual"><span className="row-number">{String(index + 1).padStart(3, '0')}</span><LakeLoopGlyph seed={lake.id} /></span>
              <div className="row-copy"><h2>{lake.aliases[0] || lake.name}</h2><p>{displaySourceArea(lake.zone)}</p>{sampleReportBySlug.has(lake.slug) && <small className="sample-note-label">Sample visit note available ↗</small>}</div>
              <div className="row-status"><StatusTag status={lake.status} /></div><span className="row-arrow">→</span>
            </Link>
            {lake.coordinates && <button className="row-map-link" aria-label={`Locate ${lake.aliases[0] || lake.name} on the directory map`} aria-pressed={selectedLake?.id === lake.id} onClick={() => { selectMapLake(lake); document.getElementById('directory-map')?.scrollIntoView({ block: 'nearest', behavior: 'auto' }); }}>⌖ <span>Map</span></button>}
          </article>
        ))}
        {!filtered.length && <div className="empty-state"><b>No lake matches {query ? `“${query}”` : 'those filters'}.</b><p>{query ? 'Try another spelling, an alternate name, or a neighbourhood.' : 'Remove one of the active filters to broaden the directory.'}</p><button onClick={() => setParams({})}>Clear search and filters</button></div>}
      </section>
</div><aside id="directory-map" className="directory-map-panel"><button className="directory-map-toggle" aria-expanded={mapOpen} aria-controls="directory-map-content" onClick={() => setMapOpen(!mapOpen)}><span>⌖ Around the city</span><small>{mappedResults.length} mapped · {mapOpen ? 'Hide −' : 'Show +'}</small></button>{mapOpen && <div id="directory-map-content"><div className="directory-map-canvas"><DirectoryMap lakes={mappedResults} selected={selectedLake} onSelect={selectMapLake} compact /></div>{selectedLake ? <div className="directory-map-selection"><small>SELECTED LAKE</small><h2>{selectedLake.aliases[0] || selectedLake.name}</h2><Link to={`/lakes/${selectedLake.slug}`}>Open lake {sampleReportBySlug.has(selectedLake.slug) ? '& sample note' : 'details'} →</Link></div> : <p className="directory-map-help">{mappedResults.length ? 'Tap a pin or a lake’s map button.' : 'No verified locations match these filters.'}</p>}<Link className="directory-map-expand" to={`/explore${selectedLake ? `?lake=${selectedLake.slug}` : ''}`}>Open full map ↗</Link></div>}</aside></div>
      <details className="guide-explainer"><summary>What does “field-checked” mean?</summary><p>Official records establish a lake’s identity. A mapped location has a sourced coordinate. Only a dated personal visit can establish field observations. Sample notes are previews and don’t change that status.</p><Link to="/about">How we build this guide ↗</Link></details>
    </div>
  );
}
