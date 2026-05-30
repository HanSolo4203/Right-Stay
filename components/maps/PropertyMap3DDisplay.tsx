'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { MapPin } from 'lucide-react';
import {
  MAPLIBRE_BOOKING_STYLE_URL,
  PROPERTY_BOOKING_MAP_BEARING,
  PROPERTY_BOOKING_MAP_PADDING,
  PROPERTY_BOOKING_MAP_PITCH,
  PROPERTY_BOOKING_MAP_ZOOM,
} from '@/lib/map-config';
import { createBookingMapMarkerElement, enhanceMapLibre3D } from '@/lib/maplibre-booking';
import 'maplibre-gl/dist/maplibre-gl.css';

interface PropertyMap3DDisplayProps {
  latitude: number;
  longitude: number;
  label?: string;
  className?: string;
  heightClassName?: string;
  zoom?: number;
}

/** Pitched 3D map with terrain and building extrusions for the booking page. */
export default function PropertyMap3DDisplay({
  latitude,
  longitude,
  label,
  className = '',
  heightClassName = 'h-[360px] md:h-[420px]',
  zoom = PROPERTY_BOOKING_MAP_ZOOM,
}: PropertyMap3DDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = new maplibregl.Map({
      container,
      style: MAPLIBRE_BOOKING_STYLE_URL,
      center: [longitude, latitude],
      zoom,
      pitch: PROPERTY_BOOKING_MAP_PITCH,
      bearing: PROPERTY_BOOKING_MAP_BEARING,
      minZoom: 14,
      maxZoom: 18,
      scrollZoom: false,
      dragRotate: true,
      touchPitch: true,
    });
    mapRef.current = map;
    map.setPadding(PROPERTY_BOOKING_MAP_PADDING);

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }),
      'top-right'
    );

    enhanceMapLibre3D(map);

    const markerEl = createBookingMapMarkerElement();
    markerRef.current = new maplibregl.Marker({ element: markerEl, anchor: 'bottom' })
      .setLngLat([longitude, latitude])
      .addTo(map);

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const center: [number, number] = [longitude, latitude];

    if (markerRef.current) {
      markerRef.current.setLngLat(center);
    } else {
      const markerEl = createBookingMapMarkerElement();
      markerRef.current = new maplibregl.Marker({ element: markerEl, anchor: 'bottom' })
        .setLngLat(center)
        .addTo(map);
    }

    map.flyTo({
      center,
      zoom,
      pitch: PROPERTY_BOOKING_MAP_PITCH,
      bearing: PROPERTY_BOOKING_MAP_BEARING,
      padding: PROPERTY_BOOKING_MAP_PADDING,
      duration: 800,
      essential: true,
    });
  }, [latitude, longitude, zoom]);

  return (
    <div className={`property-map-shell property-map-shell--booking ${className}`}>
      <div
        className={`property-map-frame property-map-frame--booking ${heightClassName} overflow-hidden rounded-2xl border border-gray-200 shadow-lg`}
      >
        <div ref={containerRef} className="h-full w-full property-map-3d-canvas" />
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
          <span className="sr-only">3D map — drag to rotate, use controls to adjust view</span>
        </div>
      ) : null}
    </div>
  );
}
