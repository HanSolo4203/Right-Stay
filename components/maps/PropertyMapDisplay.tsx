'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import {
  MAP_TILE_ATTRIBUTION,
  MAP_TILE_URL,
} from '@/lib/map-config';
import { getPropertyMarkerIcon } from '@/lib/leaflet-marker';
import 'leaflet/dist/leaflet.css';

interface PropertyMapDisplayProps {
  latitude: number;
  longitude: number;
  label?: string;
  className?: string;
  heightClassName?: string;
}

function clearLeafletContainer(el: HTMLDivElement) {
  const leafletEl = el as HTMLDivElement & { _leaflet_id?: number };
  if (leafletEl._leaflet_id != null) {
    delete leafletEl._leaflet_id;
  }
  el.replaceChildren();
}

export default function PropertyMapDisplay({
  latitude,
  longitude,
  label,
  className = '',
  heightClassName = 'h-[360px] md:h-[420px]',
}: PropertyMapDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    clearLeafletContainer(container);

    const map = L.map(container, {
      center: [latitude, longitude],
      zoom: 14,
      scrollWheelZoom: false,
      dragging: true,
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer(MAP_TILE_URL, { attribution: MAP_TILE_ATTRIBUTION }).addTo(map);
    L.marker([latitude, longitude], { icon: getPropertyMarkerIcon() }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      clearLeafletContainer(container);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([latitude, longitude], map.getZoom(), { animate: false });
  }, [latitude, longitude]);

  return (
    <div className={`property-map-shell ${className}`}>
      <div
        className={`property-map-frame ${heightClassName} overflow-hidden rounded-2xl border border-gray-200 shadow-sm`}
      >
        <div ref={containerRef} className="h-full w-full" />
      </div>

      {label ? (
        <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <p>{label}</p>
        </div>
      ) : null}
    </div>
  );
}
