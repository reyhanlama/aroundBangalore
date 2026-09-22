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
  const [locationConsentOpen, setLocationConsentOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
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
    : (a.aliases[0] || a.name).localeCompare(b.aliases[0] || b.name)), [lens, query, userLocation]);

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

  const requestLocation = () => {
    setLocationConsentOpen(false);
    if (!navigator.geolocation) { setLocationMessage('Location is not available in this browser.'); return; }
    setLocationMessage('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextLocation: Coordinates = [coords.longitude, coords.latitude];
        if (distanceKm(nextLocation, [77.5946, 12.9716]) > 100) {
          setUserLocation(undefined);
          setLocationMessage('You appear to be outside Bengaluru. The map remains centred on the city.');
          return;
        }
        setUserLocation(nextLocation);
        setLocationMessage('Sorted by distance. Your location stays on this device.');
      },
      (error) => setLocationMessage(error.code === error.TIMEOUT
        ? 'We could not determine your location. Try again or browse by area.'
        : 'Location was not shared. You can still browse every mapped lake.'),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  return (
    <div className={`explore-page mobile-${mobileView}`}>
      <header className="explore-intro">
        <div><p className="eyebrow">THE BENGALURU LAKE ATLAS</p><h1>A different view of the city.</h1><p>Find a lake. Get to know the place.</p></div>
        <Link className="intro-link" to="/about">A guide grounded in evidence <span>↗</span></Link>
      </header>
      <div className="explorer-layout">
        <aside className="explorer-sidebar" aria-label="Find a lake">
          <div className="sidebar-heading"><h2>Explore lakes</h2><span>{locatedLakes.length} mapped</span></div>
          <section className="map-tools" aria-label="Search mapped lake records">
            <label className="map-search"><span aria-hidden="true">⌕</span><span className="sr-only">Search mapped lakes</span><input aria-label="Search mapped lakes" value={query} onChange={(event) => updateParams({ q: event.target.value }, true)} placeholder="Search by lake or neighbourhood" />{query && <button aria-label="Clear search" onClick={() => updateParams({ q: undefined }, true)}>×</button>}</label>
            <button className="near-me" aria-label={userLocation ? "Refresh nearby lakes" : "Find lakes near me"} onClick={() => setLocationConsentOpen(true)}>◎ <span>{userLocation ? 'Sorted by distance' : 'Find lakes near me'}</span><span>↗</span></button>
          </section>
          {locationConsentOpen && <section className="location-consent" aria-labelledby="location-consent-title"><button className="consent-close" aria-label="Cancel location request" onClick={() => setLocationConsentOpen(false)}>×</button><b id="location-consent-title">Find nearby mapped lakes?</b><p>Your location is used on this device to sort lakes by distance. It is not stored or sent to Nadi.</p><button className="consent-action" onClick={requestLocation}>Continue</button></section>}
          <div className="lens-bar" aria-label="Map filters">
            {lenses.map(([id, label]) => <button key={id} aria-pressed={lens === id} className={lens === id ? 'active' : ''} onClick={() => updateParams({ lens: id, lake: undefined })}>{label.replace(' records', '').replace(' Bengaluru', '').replace('All mapped', 'All lakes')}</button>)}
          </div>
          {locationMessage && <p className="location-message" role="status">{locationMessage}</p>}
          <div className="mobile-view-toggle" aria-label="Explore view"><button aria-pressed={mobileView === 'map'} onClick={() => setMobileView('map')}>Map</button><button aria-pressed={mobileView === 'list'} onClick={() => setMobileView('list')}>List</button></div>
          <section id="map-results" className="map-results" aria-label="Lakes currently visible on the map">
            <header><span aria-live="polite">{visibleLakes.length} {visibleLakes.length === 1 ? 'location' : 'locations'}</span><span>{userLocation ? 'NEAREST FIRST' : 'A–Z'}</span></header>
            {visibleLakes.map((lake, index) => <button className={selected?.id === lake.id ? 'selected' : ''} aria-pressed={selected?.id === lake.id} key={lake.id} onClick={() => { selectLake(lake); setMobileView('map'); }}><span className="lake-list-marker" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="lake-list-copy"><b>{lake.aliases[0] || lake.name}</b><small>{lake.ward} · {lake.custodian}</small>{userLocation && lake.coordinates && <small>{distanceKm(userLocation, lake.coordinates).toFixed(1)} km away</small>}</span><span className="lake-list-arrow" aria-hidden="true">↗</span></button>)}
            {!visibleLakes.length && <div className="empty-state"><b>No lakes found.</b><p>Try another name or broaden your filters.</p><button onClick={() => setParams({})}>Clear filters</button></div>}
          </section>
          <div className="sidebar-footer"><span>There’s more beyond the map.</span><Link to={`/${query ? `?q=${encodeURIComponent(query)}` : ''}`}>Browse all 210 lake records <span>→</span></Link></div>
        </aside>
        <section className="map-workspace" aria-label="Lake atlas">
          <AtlasMap lakes={visibleLakes} selected={selected} onSelect={selectLake} userLocation={userLocation} />
          <div className="map-label"><span className="live-dot" /> BENGALURU <span>12.9716° N · 77.5946° E</span></div>
          <div className="map-legend"><span><i className="legend-located" /> Verified location</span><span>Field visits pending</span></div>
          {!selected && <div className="map-hint">Select a lake to explore its record <span>↗</span></div>}
          {selected && (
            <article className="lake-sheet" aria-label={`Selected lake: ${selected.name}`}>
              <button className="sheet-close" onClick={closeLake} aria-label="Close selected lake">×</button>
              <p className="eyebrow">ON THE MAP · {selected.custodian}</p>
              <h2>{selected.aliases[0] || selected.name}</h2>
              <p className="sheet-area">{selected.ward} · {selected.zone}</p>
              <StatusTag status={selected.status} />
              <p className="sheet-note">Location verified. Access, paths and current conditions still need a field visit.</p>
              <div className="sheet-actions"><Link className="primary-action" to={`/lakes/${selected.slug}`}>Explore lake record <span>→</span></Link><ExternalMapActions lake={selected} compact /></div>
            </article>
          )}
        </section>
      </div>
      <footer className="atlas-footer"><span><i className="live-dot" /> {locatedLakes.length} verified locations · 210 official records</span><Link to="/about">Our sources & method ↗</Link><span>A living atlas. A closer look.</span></footer>
    </div>
  );
}
