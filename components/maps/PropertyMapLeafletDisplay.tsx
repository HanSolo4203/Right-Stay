'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import {
  MAP_BOOKING_TILE_URL,
  MAP_TILE_ATTRIBUTION,
  PROPERTY_BOOKING_MAP_ZOOM,
} from '@/lib/map-config';
import { getPropertyMarkerIcon } from '@/lib/leaflet-marker';
import 'leaflet/dist/leaflet.css';

interface PropertyMapLeafletDisplayProps {
  latitude: number;
  longitude: number;
  label?: string;
  className?: string;
  heightClassName?: string;
  zoom?: number;
}

function clearLeafletContainer(el: HTMLDivElement) {
  const leafletEl = el as HTMLDivElement & { _leaflet_id?: number };
  if (leafletEl._leaflet_id != null) {
    delete leafletEl._leaflet_id;
  }
  el.replaceChildren();
}

/** Flat 2D map for admin pin placement and legacy display. */
export default function PropertyMapLeafletDisplay({
  latitude,
  longitude,
  label,
  className = '',
  heightClassName = 'h-[360px] md:h-[420px]',
  zoom = PROPERTY_BOOKING_MAP_ZOOM,
}: PropertyMapLeafletDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    clearLeafletContainer(container);

    const map = L.map(container, {
      center: [latitude, longitude],
      zoom,
      minZoom: 10,
      maxZoom: 19,
      scrollWheelZoom: false,
      dragging: true,
      zoomControl: false,
    });
    mapRef.current = map;

    L.control.zoom({ position: 'topleft' }).addTo(map);
    L.tileLayer(MAP_BOOKING_TILE_URL, { attribution: MAP_TILE_ATTRIBUTION }).addTo(map);

    markerRef.current = L.marker([latitude, longitude], {
      icon: getPropertyMarkerIcon('default'),
    }).addTo(map);

    return () => {
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
      clearLeafletContainer(container);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setView([latitude, longitude], zoom, { animate: true });

    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
    } else {
      markerRef.current = L.marker([latitude, longitude], {
        icon: getPropertyMarkerIcon('default'),
      }).addTo(map);
    }
  }, [latitude, longitude, zoom]);

  return (
    <div className={`property-map-shell property-map-shell--booking ${className}`}>
      <div
        className={`property-map-frame property-map-frame--booking ${heightClassName} overflow-hidden rounded-2xl border border-gray-200 shadow-lg`}
      >
        <div ref={containerRef} className="h-full w-full" />
      </div>

      {label ? (
        <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-right-stay-500" strokeWidth={1.75} />
          <p
            className="font-medium text-gray-900"
            style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
          >
            {label}
          </p>
        </div>
      ) : null}
    </div>
  );
}
