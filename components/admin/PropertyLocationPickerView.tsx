'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  MAP_TILE_ATTRIBUTION,
  MAP_TILE_URL,
} from '@/lib/map-config';
import { getPropertyMarkerIcon } from '@/lib/leaflet-marker';
import { hasValidMapCoordinates, parseCoordinate } from '@/lib/property-location';
import 'leaflet/dist/leaflet.css';

interface PropertyLocationPickerViewProps {
  latitude: string;
  longitude: string;
  onCoordinatesChange: (lat: string, lng: string) => void;
}

function clearLeafletContainer(el: HTMLDivElement) {
  const leafletEl = el as HTMLDivElement & { _leaflet_id?: number };
  if (leafletEl._leaflet_id != null) {
    delete leafletEl._leaflet_id;
  }
  el.replaceChildren();
}

export default function PropertyLocationPickerView({
  latitude,
  longitude,
  onCoordinatesChange,
}: PropertyLocationPickerViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onCoordinatesChangeRef = useRef(onCoordinatesChange);

  useEffect(() => {
    onCoordinatesChangeRef.current = onCoordinatesChange;
  }, [onCoordinatesChange]);

  const placeMarker = (map: L.Map, lat: number, lng: number) => {
    const icon = getPropertyMarkerIcon();

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      return;
    }

    const marker = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onCoordinatesChangeRef.current(
        pos.lat.toFixed(6),
        pos.lng.toFixed(6)
      );
    });
    markerRef.current = marker;
  };

  // Create map once per mount; full teardown on unmount.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    clearLeafletContainer(container);

    const startLat = parseCoordinate(latitude);
    const startLng = parseCoordinate(longitude);
    const hasStart = hasValidMapCoordinates(startLat, startLng);
    const center: L.LatLngExpression = hasStart
      ? [startLat!, startLng!]
      : DEFAULT_MAP_CENTER;
    const zoom = hasStart ? 15 : DEFAULT_MAP_ZOOM;

    const map = L.map(container, {
      center,
      zoom,
      scrollWheelZoom: true,
    });
    mapRef.current = map;

    L.tileLayer(MAP_TILE_URL, { attribution: MAP_TILE_ATTRIBUTION }).addTo(map);

    map.on('click', (event) => {
      const { lat, lng } = event.latlng;
      placeMarker(map, lat, lng);
      onCoordinatesChangeRef.current(lat.toFixed(6), lng.toFixed(6));
    });

    if (hasStart) {
      placeMarker(map, startLat!, startLng!);
    }

    return () => {
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
      clearLeafletContainer(container);
    };
    // Intentionally mount once; coordinate updates handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan / marker updates when geocoding or loading saved coordinates.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const lat = parseCoordinate(latitude);
    const lng = parseCoordinate(longitude);

    if (!hasValidMapCoordinates(lat, lng)) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    map.setView([lat!, lng!], Math.max(map.getZoom(), 15), { animate: true });
    placeMarker(map, lat!, lng!);
  }, [latitude, longitude]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">
        Click the map or drag the pin to set the exact property location.
      </p>
      <div className="property-map-frame admin-property-map h-[280px] overflow-hidden rounded-xl border border-white/10">
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
