import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AtlasMap } from '../components/AtlasMap';
import { StatusTag } from '../components/StatusTag';
import { lakeBySlug, locatedLakes } from '../data/catalog';
import { reportBySlug } from '../data/reports';
import type { Coordinates, LakeIndexEntry } from '../types';
import { distanceKm } from '../utils/geo';

const lenses = [
  ['reports', '✦', 'With field notes'],
  ['short', '↝', 'Short loops'],
  ['north', '↑', 'North Bengaluru'],
  ['east', '→', 'East Bengaluru']
] as const;

export function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const [activeLenses, setActiveLenses] = useState<string[]>(params.get('lens')?.split(',').filter(Boolean) ?? []);
  const [location, setLocation] = useState<Coordinates>();
  const [locationMessage, setLocationMessage] = useState('');
  const selected = params.get('lake') ? lakeBySlug.get(params.get('lake')!) : undefined;

  const visibleLakes = useMemo(() => locatedLakes.filter((lake) => activeLenses.every((lens) => {
    const report = reportBySlug.get(lake.slug);
    if (lens === 'reports') return Boolean(report);
    if (lens === 'short') return Boolean(report && report.distanceKm < 3);
    if (lens === 'north') return /north|yalahanka|byatarayanapura/i.test(`${lake.zone} ${lake.ward}`);
    if (lens === 'east') return /east|mahadevapura|kr puram/i.test(`${lake.zone} ${lake.ward}`);
    return true;
  })).sort((a, b) => location && a.coordinates && b.coordinates ? distanceKm(location, a.coordinates) - distanceKm(location, b.coordinates) : 0), [activeLenses, location]);

  const selectLake = useCallback((lake: LakeIndexEntry) => {
    const next = new URLSearchParams(params);
    next.set('lake', lake.slug);
    if (activeLenses.length) next.set('lens', activeLenses.join(','));
    setParams(next, { replace: true });
  }, [activeLenses, params, setParams]);

  const toggleLens = (lens: string) => {
    const nextLenses = activeLenses.includes(lens) ? activeLenses.filter((item) => item !== lens) : [...activeLenses, lens];
    setActiveLenses(nextLenses);
    const next = new URLSearchParams(params);
    nextLenses.length ? next.set('lens', nextLenses.join(',')) : next.delete('lens');
    setParams(next, { replace: true });
  };

  const findMe = () => {
    if (!navigator.geolocation) { setLocationMessage('Location is not available in this browser.'); return; }
    setLocationMessage('Finding you…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setLocation([coords.longitude, coords.latitude]); setLocationMessage('Showing your position. It is not stored.'); },
      () => setLocationMessage('Location was not shared. You can still browse the map.'),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const selectedReport = selected ? reportBySlug.get(selected.slug) : undefined;

  return (
    <div className="explore-page">
      <section className="explore-intro">
        <div><p className="eyebrow">A LIVING FIELD GUIDE · CATALOGUE 01</p><h1>Know Bengaluru,<br /><span>lake by lake.</span></h1></div>
        <p>Official lake records meet personal field visits. Explore what is known, what is changing, and what still needs checking.</p>
      </section>

      <div className="lens-bar" aria-label="Map exploration lenses">
        {lenses.map(([id, symbol, label]) => <button key={id} className={activeLenses.includes(id) ? 'active' : ''} onClick={() => toggleLens(id)}><i>{symbol}</i>{label}</button>)}
        <button className="near-me" onClick={findMe}>◎ Near me</button>
      </div>
      {locationMessage && <p className="location-message" role="status">{locationMessage}</p>}

      <section className="map-workspace">
        <AtlasMap lakes={visibleLakes} selected={selected} onSelect={selectLake} userLocation={location} />
        <div className="map-legend"><span><i className="legend-draft" /> Report draft</span><span><i className="legend-unchecked" /> Not field-checked</span></div>
        {selected && (
          <article className="lake-sheet">
            <div className="sheet-kicker"><StatusTag status={selected.status} /><span>{selected.custodian} · {selected.zone}</span></div>
            <h2>{selected.aliases[0] || selected.name}</h2>
            {selectedReport ? (
              <><p>{selectedReport.summary}</p><div className="sheet-facts"><span><small>LOOP</small>{selectedReport.distanceKm} km</span><span><small>SURFACE</small>{selectedReport.surface}</span><span><small>DATA</small>Sample draft</span></div></>
            ) : <p>This lake is in the official catalogue, but Nadi has not visited or assessed it yet.</p>}
            <Link className="primary-action" to={`/lakes/${selected.slug}`}>{selectedReport ? 'Open field report' : 'View catalogue entry'} <span>→</span></Link>
          </article>
        )}
      </section>

      <section className="map-results" aria-label="Lakes currently visible on the map">
        <header><span>{String(visibleLakes.length).padStart(2, '0')} LOCATED</span><Link to="/lakes">Browse all 210 →</Link></header>
        {visibleLakes.map((lake) => <button key={lake.id} onClick={() => selectLake(lake)}><b>{lake.aliases[0] || lake.name}{location && lake.coordinates && <small>{distanceKm(location, lake.coordinates).toFixed(1)} km away</small>}</b><StatusTag status={lake.status} /></button>)}
      </section>
    </div>
  );
}
