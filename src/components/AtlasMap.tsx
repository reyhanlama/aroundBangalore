import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap, Marker } from 'maplibre-gl';
import type { Coordinates, LakeIndexEntry } from '../types';

const fallbackStyle = 'https://tiles.openfreemap.org/styles/liberty';
const configuredStyle = import.meta.env.VITE_MAP_STYLE_URL as string | undefined;
const maptilerKey = import.meta.env.VITE_MAPTILER_KEY as string | undefined;
const styleUrl = configuredStyle || (maptilerKey ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}` : fallbackStyle);

interface AtlasMapProps {
  lakes: LakeIndexEntry[];
  selected?: LakeIndexEntry;
  onSelect: (lake: LakeIndexEntry) => void;
  userLocation?: Coordinates;
}

export function AtlasMap({ lakes, selected, onSelect, userLocation }: AtlasMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [mapFailed, setMapFailed] = useState(!navigator.onLine);

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      style: styleUrl,
      center: [77.5946, 12.9716],
      zoom: 10.7,
      attributionControl: false
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    const timeout = window.setTimeout(() => { if (!map.isStyleLoaded()) setMapFailed(true); }, 12000);
    const ready = () => { window.clearTimeout(timeout); setMapFailed(false); };
    const wentOffline = () => setMapFailed(!map.isStyleLoaded());
    const cameOnline = () => { setMapFailed(false); if (!map.isStyleLoaded()) map.setStyle(styleUrl); };
    map.on('load', ready);
    window.addEventListener('offline', wentOffline);
    window.addEventListener('online', cameOnline);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('offline', wentOffline);
      window.removeEventListener('online', cameOnline);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = lakes.flatMap((lake) => {
      if (!lake.coordinates) return [];
      const element = document.createElement('button');
      const fieldStatus = lake.status === 'field_checked' ? 'checked' : 'record-only';
      element.className = `atlas-marker marker-${fieldStatus}${selected?.id === lake.id ? ' selected' : ''}`;
      element.type = 'button';
      element.setAttribute('aria-label', `${lake.name}, location verified, ${lake.status.replaceAll('_', ' ')}`);
      element.addEventListener('click', () => onSelect(lake));
      return [new maplibregl.Marker({ element }).setLngLat(lake.coordinates).addTo(map)];
    });
  }, [lakes, selected?.id, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected?.coordinates) return;
    const isMobile = window.matchMedia('(max-width: 759px)').matches;
    map.flyTo({
      center: selected.coordinates,
      zoom: Math.max(map.getZoom(), 12.3),
      duration: 650,
      essential: true,
      padding: isMobile ? { top: 20, right: 20, bottom: 280, left: 20 } : { top: 20, right: 410, bottom: 20, left: 20 }
    });
  }, [selected]);

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    const element = document.createElement('span');
    element.className = 'user-marker';
    const marker = new maplibregl.Marker({ element }).setLngLat(userLocation).addTo(mapRef.current);
    mapRef.current.flyTo({ center: userLocation, zoom: 12, duration: 650 });
    return () => { marker.remove(); };
  }, [userLocation]);

  return (
    <div className="map-frame">
      <div ref={container} className="map-canvas" role="region" aria-label="Interactive map of verified Bengaluru lake locations" />
      {mapFailed && <div className="map-error" role="status"><b>Basemap unavailable</b><span>The complete lake directory still works offline. Reconnect to load map tiles.</span></div>}
    </div>
  );
}
