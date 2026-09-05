import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { lakes, statusLabel } from '../data/catalog';
import { StatusTag } from '../components/StatusTag';
import type { LakeStatus } from '../types';

export function LakesPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const status = params.get('status') ?? 'all';
  const custodian = params.get('custodian') ?? 'all';
  const zone = params.get('zone') ?? 'all';
  const zones = useMemo(() => [...new Set(lakes.map((lake) => lake.zone))].sort(), []);

  const filtered = useMemo(() => lakes.filter((lake) => {
    const haystack = `${lake.name} ${lake.aliases.join(' ')} ${lake.ward} ${lake.zone}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (status === 'all' || lake.status === status) && (custodian === 'all' || lake.custodian === custodian) && (zone === 'all' || lake.zone === zone);
  }).sort((a, b) => {
    const rank = (value: LakeStatus) => value === 'field_checked' ? 0 : value === 'report_in_progress' ? 1 : 2;
    return rank(a.status) - rank(b.status) || a.name.localeCompare(b.name);
  }), [query, status, custodian, zone]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value && value !== 'all' ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <div className="directory-page page-wrap">
      <header className="page-heading"><p className="eyebrow">OFFICIAL DIRECTORY · VERSION 2026.09</p><h1>All 210<br /><span>catalogued lakes.</span></h1><p>Presence in this directory does not mean Nadi has visited or assessed a lake.</p></header>
      <section className="directory-tools" aria-label="Lake directory filters">
        <label className="search-box"><span>SEARCH</span><input value={query} onChange={(event) => update('q', event.target.value)} placeholder="Lake, ward or neighbourhood" /></label>
        <div className="select-row">
          <label><span>STATUS</span><select value={status} onChange={(event) => update('status', event.target.value)}><option value="all">All statuses</option>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label><span>CUSTODIAN</span><select value={custodian} onChange={(event) => update('custodian', event.target.value)}><option value="all">All custodians</option>{['BBMP','BDA','KFD','BMRCL'].map((value) => <option key={value}>{value}</option>)}</select></label>
        </div>
        <label className="zone-filter"><span>ZONE / CONSTITUENCY</span><select value={zone} onChange={(event) => update('zone', event.target.value)}><option value="all">All zones</option>{zones.map((value) => <option key={value}>{value}</option>)}</select></label>
      </section>
      <div className="directory-count"><b>{filtered.length}</b><span>matching lakes</span></div>
      <section className="lake-directory">
        {filtered.map((lake, index) => (
          <Link to={`/lakes/${lake.slug}`} key={lake.id} className="directory-row">
            <span className="row-number">{String(index + 1).padStart(3, '0')}</span>
            <div><h2>{lake.aliases[0] || lake.name}</h2>{lake.aliases[0] && <small>Official: {lake.name}</small>}<p>{lake.ward} · {lake.custodian}</p></div>
            <StatusTag status={lake.status} /><span className="row-arrow">↗</span>
          </Link>
        ))}
        {!filtered.length && <div className="empty-state"><b>No lake matches those filters.</b><button onClick={() => setParams({})}>Clear filters</button></div>}
      </section>
    </div>
  );
}
