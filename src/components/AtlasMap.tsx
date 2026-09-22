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
  compact?: boolean;
  cinematic?: boolean;
}

export function AtlasMap({ lakes, selected, onSelect, userLocation, compact = false, cinematic = false }: AtlasMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [mapFailed, setMapFailed] = useState(!navigator.onLine);

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      style: styleUrl,
      center: cinematic && selected?.coordinates ? selected.coordinates : [77.5946, 12.9716],
      zoom: cinematic ? 13.8 : 10.7,
      pitch: cinematic ? 48 : 0,
      bearing: cinematic ? -18 : 0,
      maxPitch: 65,
      attributionControl: false
    });
    // Restyle the real basemap; decorative contour art belongs to the page,
    // where it cannot be mistaken for measured terrain.
    map.on('style.load', () => {
      for (const layer of map.getStyle().layers ?? []) {
        const source = 'source-layer' in layer ? layer['source-layer'] ?? '' : '';
        const name = `${layer.id} ${source}`.toLowerCase();
        if (layer.type === 'background') map.setPaintProperty(layer.id, 'background-color', '#f5f5ef');
        if (layer.type === 'fill') {
          if (/water/.test(name)) {
            map.setPaintProperty(layer.id, 'fill-color', '#91aff6');
          } else if (/park|landcover|wood|forest|grass/.test(name)) {
            map.setPaintProperty(layer.id, 'fill-color', '#d5e7b7');
          } else if (/building/.test(name)) {
            map.setPaintProperty(layer.id, 'fill-color', '#c4c9d5');
            map.setPaintProperty(layer.id, 'fill-opacity', 0.55);
          } else if (/landuse/.test(name)) {
            map.setPaintProperty(layer.id, 'fill-color', '#eaeddf');
          }
        }
        if (layer.type === 'line') {
          if (/water/.test(name)) map.setPaintProperty(layer.id, 'line-color', '#6a94ef');
          else if (/transportation|road|highway|street/.test(name)) {
            map.setPaintProperty(layer.id, 'line-color', /casing|outline/.test(name) ? '#b8c0d1' : '#ffffff');
          } else if (/boundary/.test(name)) map.setPaintProperty(layer.id, 'line-color', '#8e99bb');
        }
        if (layer.type === 'symbol' && layer.layout?.['text-field']) {
          map.setPaintProperty(layer.id, 'text-color', '#243156');
          map.setPaintProperty(layer.id, 'text-halo-color', '#f5f5ef');
        }
      }
      if (cinematic && !map.getLayer('nadi-dimensional-buildings')) {
        const layers = map.getStyle().layers ?? [];
        const buildingLayer = layers.find((layer) => {
          const sourceLayer = 'source-layer' in layer ? layer['source-layer'] ?? '' : '';
          return layer.type === 'fill' && /building/i.test(`${layer.id} ${sourceLayer}`) && 'source' in layer && typeof layer.source === 'string';
        });
        const firstLabel = layers.find((layer) => layer.type === 'symbol')?.id;
        if (buildingLayer && 'source' in buildingLayer && typeof buildingLayer.source === 'string') {
          const sourceLayer = 'source-layer' in buildingLayer ? buildingLayer['source-layer'] : undefined;
          map.addLayer({
            id: 'nadi-dimensional-buildings',
            type: 'fill-extrusion',
            source: buildingLayer.source,
            ...(sourceLayer ? { 'source-layer': sourceLayer } : {}),
            minzoom: 12,
            paint: {
              'fill-extrusion-color': '#a9b1cf',
              'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 12, 0, 15, ['coalesce', ['get', 'render_height'], ['get', 'height'], 14]],
              'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
              'fill-extrusion-opacity': 0.7
            }
          } as maplibregl.LayerSpecification, firstLabel);
        }
      }
    });
    mapRef.current = map;
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(container.current);
    map.addControl(new maplibregl.NavigationControl({ showCompass: cinematic }), 'top-right');
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
      resizeObserver.disconnect();
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
      zoom: Math.max(map.getZoom(), cinematic ? 14 : 12.3),
      pitch: cinematic ? 48 : 0,
      bearing: cinematic ? -18 : 0,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : cinematic ? 900 : 650,
      essential: false,
      padding: compact ? 35 : isMobile ? { top: 20, right: 20, bottom: 280, left: 20 } : { top: 20, right: 410, bottom: 20, left: 20 }
    });
  }, [selected, compact, cinematic]);

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    const element = document.createElement('span');
    element.className = 'user-marker';
    const marker = new maplibregl.Marker({ element }).setLngLat(userLocation).addTo(mapRef.current);
    mapRef.current.flyTo({ center: userLocation, zoom: 12, duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650 });
    return () => { marker.remove(); };
  }, [userLocation]);

  return (
    <div className={`map-frame${cinematic ? ' map-cinematic' : ''}`}>
      <div ref={container} className="map-canvas" role="region" aria-label="Interactive map of verified Bengaluru lake locations" />
      {mapFailed && <div className="map-error" role="status"><b>Basemap unavailable</b><span>The complete lake directory still works offline. Reconnect to load map tiles.</span></div>}
    </div>
  );
}
