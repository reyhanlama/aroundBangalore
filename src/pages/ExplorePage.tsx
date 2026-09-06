import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AtlasMap } from '../components/AtlasMap';
import { ExternalMapActions } from '../components/ExternalMapActions';
import { StatusTag } from '../components/StatusTag';
import { lakeBySlug, locatedLakes } from '../data/catalog';
import type { Coordinates, LakeIndexEntry } from '../types';
import { distanceKm } from '../utils/geo';

const lenses = [
  ['all', 'All mapped'],
  ['bbmp', 'BBMP records'],
  ['bda', 'BDA records'],
  ['north', 'North Bengaluru'],
  ['east', 'East Bengaluru']
] as const;

export function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const routeLocation = useLocation();
  const navigate = useNavigate();
  const lens = params.get('lens') ?? 'all';
  const query = params.get('q') ?? '';
  const [userLocation, setUserLocation] = useState<Coordinates>();
  const [locationMessage, setLocationMessage] = useState('');
  const selected = params.get('lake') ? lakeBySlug.get(params.get('lake')!) : undefined;

  const visibleLakes = useMemo(() => locatedLakes.filter((lake) => {
    const matchesQuery = `${lake.name} ${lake.aliases.join(' ')} ${lake.ward} ${lake.zone}`.toLowerCase().includes(query.toLowerCase());
    if (!matchesQuery) return false;
    if (lens === 'bbmp') return lake.custodian === 'BBMP';
    if (lens === 'bda') return lake.custodian === 'BDA';
    if (lens === 'north') return /north|yalahanka|byatarayanapura/i.test(`${lake.zone} ${lake.ward}`);
    if (lens === 'east') return /east|mahadevapura|kr puram/i.test(`${lake.zone} ${lake.ward}`);
    return true;
  }).sort((a, b) => userLocation && a.coordinates && b.coordinates
    ? distanceKm(userLocation, a.coordinates) - distanceKm(userLocation, b.coordinates)
    : a.name.localeCompare(b.name)), [lens, query, userLocation]);

  const updateParams = useCallback((updates: Record<string, string | undefined>, replace = false, state?: Record<string, boolean>) => {
    const next = new URLSearchParams(params);
    Object.entries(updates).forEach(([key, value]) => value && value !== 'all' ? next.set(key, value) : next.delete(key));
    setParams(next, { replace, state });
  }, [params, setParams]);

  const selectLake = useCallback((lake: LakeIndexEntry) => updateParams({ lake: lake.slug }, false, { nadiMapSelection: true }), [updateParams]);
  const closeLake = () => routeLocation.state?.nadiMapSelection ? navigate(-1) : updateParams({ lake: undefined }, true);

  useEffect(() => {
    if (selected && !visibleLakes.some((lake) => lake.id === selected.id)) updateParams({ lake: undefined }, true);
  }, [selected, updateParams, visibleLakes]);

  const findMe = () => {
    if (!navigator.geolocation) { setLocationMessage('Location is not available in this browser.'); return; }
    setLocationMessage('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setUserLocation([coords.longitude, coords.latitude]); setLocationMessage('Sorted by distance. Your location is not stored or transmitted.'); },
      () => setLocationMessage('Location was not shared. You can still browse every mapped record.'),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  return (
    <div className="explore-page">
      <section className="explore-intro">
        <div><p className="eyebrow">BENGALURU LAKE DIRECTORY · MAP 01</p><h1>Read Bengaluru<br /><span>through its lakes.</span></h1></div>
        <p>See what official records establish—and what still needs checking on the ground.</p>
      </section>

      <section className="map-tools" aria-label="Search mapped lake records">
        <label className="map-search"><span className="sr-only">Search mapped lakes</span><input value={query} onChange={(event) => updateParams({ q: event.target.value }, true)} placeholder="Search the 10 mapped locations" /></label>
        <button className="near-me" onClick={findMe}>◎ Near me</button>
        <a href="#map-results" className="list-jump">View as list ↓</a>
      </section>

      <div className="lens-bar" aria-label="Map exploration lenses">
        <span className="lens-label">Browse mapped records by</span>
        {lenses.map(([id, label]) => <button key={id} className={lens === id ? 'active' : ''} onClick={() => updateParams({ lens: id, lake: undefined })}>{label}</button>)}
      </div>
      {locationMessage && <p className="location-message" role="status">{locationMessage}</p>}

      <div className="coverage-note"><b>{locatedLakes.length} locations verified on map</b><span>·</span><Link to="/lakes">210 official records in the directory</Link></div>

      <section className="map-workspace">
        <AtlasMap lakes={visibleLakes} selected={selected} onSelect={selectLake} userLocation={userLocation} />
        <div className="map-legend"><span><i className="legend-located" /> Located, not field-checked</span><span><i className="legend-selected" /> Selected</span></div>
        {selected && (
          <article className="lake-sheet" aria-label={`Selected lake: ${selected.name}`}>
            <button className="sheet-close" onClick={closeLake} aria-label="Close selected lake">×</button>
            <span className="sheet-handle" aria-hidden="true" />
            <div className="sheet-kicker"><StatusTag status={selected.status} /><span>{selected.custodian} · {selected.ward}</span></div>
            <h2>{selected.aliases[0] || selected.name}</h2>
            <p>We have verified this catalogue location, but not current conditions, access, paths or safety.</p>
            <div className="sheet-actions">
              <Link className="primary-action" to={`/lakes/${selected.slug}`}>Open lake record <span>→</span></Link>
              <ExternalMapActions lake={selected} compact />
            </div>
          </article>
        )}
      </section>

      <section id="map-results" className="map-results" aria-label="Lakes currently visible on the map">
        <header><span>{String(visibleLakes.length).padStart(2, '0')} MAPPED RECORDS</span><Link to="/lakes">Browse all 210 →</Link></header>
        {visibleLakes.map((lake) => <button key={lake.id} onClick={() => selectLake(lake)}><b>{lake.aliases[0] || lake.name}{userLocation && lake.coordinates && <small>{distanceKm(userLocation, lake.coordinates).toFixed(1)} km away</small>}</b><span>{lake.custodian}<small>{lake.ward}</small></span></button>)}
        {!visibleLakes.length && <div className="empty-state"><b>No mapped lake matches this view.</b><button onClick={() => setParams({})}>Clear map filters</button></div>}
      </section>
    </div>
  );
}
