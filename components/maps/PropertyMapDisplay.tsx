'use client';

import dynamic from 'next/dynamic';

export type PropertyMapAppearance = 'booking' | 'default';

export interface PropertyMapDisplayProps {
  latitude: number;
  longitude: number;
  label?: string;
  className?: string;
  heightClassName?: string;
  zoom?: number;
  /** `booking` = 3D MapLibre; `default` = flat Leaflet (admin). */
  appearance?: PropertyMapAppearance;
}

const PropertyMap3DDisplay = dynamic(() => import('@/components/maps/PropertyMap3DDisplay'), {
  ssr: false,
});

const PropertyMapLeafletDisplay = dynamic(
  () => import('@/components/maps/PropertyMapLeafletDisplay'),
  { ssr: false }
);

export default function PropertyMapDisplay({
  appearance = 'booking',
  ...props
}: PropertyMapDisplayProps) {
  if (appearance === 'booking') {
    return <PropertyMap3DDisplay {...props} />;
  }
  return <PropertyMapLeafletDisplay {...props} />;
}
