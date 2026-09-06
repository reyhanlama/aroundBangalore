import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { StatusTag } from '../components/StatusTag';
import { lakes, statusLabel } from '../data/catalog';
import type { LakeStatus } from '../types';

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
  const query = params.get('q') ?? '';
  const status = params.get('status') ?? 'all';
  const custodian = params.get('custodian') ?? 'all';
  const area = params.get('area') ?? 'all';
  const location = params.get('location') ?? 'all';
  const sort = params.get('sort') ?? 'alpha';
  const areas = useMemo(() => [...new Set(lakes.map((lake) => displaySourceArea(lake.zone)))].sort(), []);

  const filtered = useMemo(() => lakes.filter((lake) => {
    const haystack = `${lake.name} ${lake.aliases.join(' ')} ${lake.ward} ${lake.zone}`.toLowerCase();
    const locationMatch = location === 'all' || (location === 'mapped' ? Boolean(lake.coordinates) : !lake.coordinates);
    return haystack.includes(query.toLowerCase())
      && (status === 'all' || lake.status === status)
      && (custodian === 'all' || lake.custodian === custodian)
      && (area === 'all' || displaySourceArea(lake.zone) === area)
      && locationMatch;
  }).sort((a, b) => {
    if (sort === 'alpha') return a.name.localeCompare(b.name);
    const rank = (value: LakeStatus) => value === 'field_checked' ? 0 : value === 'report_in_progress' ? 1 : 2;
    return rank(a.status) - rank(b.status) || a.name.localeCompare(b.name);
  }), [area, custodian, location, query, sort, status]);

  const update = (key: string, value?: string, replace = true) => {
    const next = new URLSearchParams(params);
    value && value !== 'all' && !(key === 'sort' && value === 'alpha') ? next.set(key, value) : next.delete(key);
    setParams(next, { replace });
  };

  const activeFilters = [
    query && ['q', `Search: “${query}”`],
    status !== 'all' && ['status', statusLabel[status as LakeStatus]],
    custodian !== 'all' && ['custodian', custodian],
    area !== 'all' && ['area', area],
    location !== 'all' && ['location', location === 'mapped' ? 'Mapped locations' : 'Catalogue only']
  ].filter(Boolean) as string[][];

  return (
    <div className="directory-page page-wrap">
      <header className="page-heading"><p className="eyebrow">OFFICIAL DIRECTORY · VERSION 2026.09</p><h1>All 210<br /><span>lake records.</span></h1><p>A catalogue entry is not an endorsement or a field assessment.</p></header>

      <section className="directory-tools" aria-label="Lake directory filters">
        <label className="search-box"><span>Search</span><input value={query} onChange={(event) => update('q', event.target.value)} placeholder="Lake, alternate name or ward" /></label>
        <details className="filter-drawer">
          <summary>Filters & sort <span>{activeFilters.length ? `${activeFilters.length} active` : 'Open'}</span></summary>
          <div className="filter-grid">
            <label><span>Field status</span><select value={status} onChange={(event) => update('status', event.target.value)}><option value="all">All field statuses</option>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label><span>Custodian</span><select value={custodian} onChange={(event) => update('custodian', event.target.value)}><option value="all">All custodians</option>{['BBMP','BDA','KFD','BMRCL','LDA'].map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span>Source area</span><select value={area} onChange={(event) => update('area', event.target.value)}><option value="all">All source areas</option>{areas.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span>Map coverage</span><select value={location} onChange={(event) => update('location', event.target.value)}><option value="all">All records</option><option value="mapped">Mapped locations</option><option value="catalogue">Catalogue only</option></select></label>
            <label><span>Sort</span><select value={sort} onChange={(event) => update('sort', event.target.value)}><option value="alpha">A–Z by official name</option><option value="field">Field-checked first</option></select></label>
          </div>
        </details>
      </section>

      {activeFilters.length > 0 && <div className="active-filters" aria-label="Active filters">{activeFilters.map(([key, label]) => <button key={key} onClick={() => update(key)}>{label}<span aria-hidden="true">×</span></button>)}<button className="clear-all" onClick={() => setParams({})}>Clear all</button></div>}

      <div className="directory-count" aria-live="polite"><b>{filtered.length}</b><span>matching records</span><small>{filtered.filter((lake) => lake.coordinates).length} mapped</small></div>
      <section className="lake-directory" aria-label="Lake directory results">
        {filtered.map((lake, index) => (
          <Link to={`/lakes/${lake.slug}`} key={lake.id} className="directory-row">
            <span className="row-number">{String(index + 1).padStart(3, '0')}</span>
            <div className="row-copy"><h2>{lake.aliases[0] || lake.name}</h2>{lake.aliases[0] && <small>Official record: {lake.name}</small>}<p>{lake.ward} · {lake.custodian} · {displaySourceArea(lake.zone)}</p></div>
            <div className="row-status"><StatusTag status={lake.status} />{lake.coordinates && <span className="location-tag">⌖ Mapped</span>}</div><span className="row-arrow">→</span>
          </Link>
        ))}
        {!filtered.length && <div className="empty-state"><b>No lake matches those filters.</b><p>Try a broader name or remove one of the active filters.</p><button onClick={() => setParams({})}>Clear filters</button></div>}
      </section>
    </div>
  );
}
