'use client';

import dynamic from 'next/dynamic';

const PropertyMapDisplay = dynamic(
  () => import('@/components/maps/PropertyMapDisplay'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 md:h-[420px]">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
          aria-hidden="true"
        />
      </div>
    ),
  }
);

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  label?: string;
}

export default function PropertyMap({ latitude, longitude, label }: PropertyMapProps) {
  return (
    <PropertyMapDisplay latitude={latitude} longitude={longitude} label={label} />
  );
}
