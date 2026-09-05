import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap, Marker } from 'maplibre-gl';
import type { LakeIndexEntry, Coordinates } from '../types';
import { reportBySlug } from '../data/reports';

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
  const [mapFailed, setMapFailed] = useState(false);

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
    map.on('error', () => setMapFailed(true));
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = lakes.flatMap((lake) => {
      if (!lake.coordinates) return [];
      const element = document.createElement('button');
      element.className = `atlas-marker marker-${lake.status}${selected?.id === lake.id ? ' selected' : ''}`;
      element.type = 'button';
      element.setAttribute('aria-label', `${lake.name}, ${lake.status.replaceAll('_', ' ')}`);
      element.addEventListener('click', () => onSelect(lake));
      return [new maplibregl.Marker({ element }).setLngLat(lake.coordinates).addTo(map)];
    });
  }, [lakes, selected?.id, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected?.coordinates) return;
    map.flyTo({ center: selected.coordinates, zoom: Math.max(map.getZoom(), 12.3), duration: 700, essential: true });
    const sourceId = 'selected-route';
    const report = reportBySlug.get(selected.slug);
    const update = () => {
      if (map.getLayer('selected-route-line')) map.removeLayer('selected-route-line');
      if (map.getSource(sourceId)) map.removeSource(sourceId);
      if (!report) return;
      map.addSource(sourceId, { type: 'geojson', data: report.route });
      map.addLayer({ id: 'selected-route-line', type: 'line', source: sourceId, paint: { 'line-color': '#ff7138', 'line-width': 5, 'line-dasharray': [1.2, 1.1] } });
    };
    map.isStyleLoaded() ? update() : map.once('load', update);
  }, [selected]);

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    const element = document.createElement('span');
    element.className = 'user-marker';
    const marker = new maplibregl.Marker({ element }).setLngLat(userLocation).addTo(mapRef.current);
    mapRef.current.flyTo({ center: userLocation, zoom: 12, duration: 700 });
    return () => { marker.remove(); };
  }, [userLocation]);

  return (
    <div className="map-frame">
      <div ref={container} className="map-canvas" aria-label="Interactive map of Bengaluru lakes" />
      <div className="map-atlas-overlay" aria-hidden="true"><i /><i /><i /><b>BLR 12.97° N</b></div>
      {mapFailed && <div className="map-error" role="status"><b>Map unavailable</b><span>The directory and saved field notes still work offline.</span></div>}
    </div>
  );
}
