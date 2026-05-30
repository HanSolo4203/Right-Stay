'use client';

import dynamic from 'next/dynamic';

const PropertyMapDisplay = dynamic(
  () => import('@/components/maps/PropertyMapDisplay'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] items-center justify-center rounded-2xl border border-right-stay-200/60 bg-right-stay-50/40 md:h-[420px]">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-right-stay-200 border-t-right-stay-500"
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
  heightClassName?: string;
}

export default function PropertyMap({ latitude, longitude, label, heightClassName }: PropertyMapProps) {
  return (
    <PropertyMapDisplay
      latitude={latitude}
      longitude={longitude}
      label={label}
      appearance="booking"
      heightClassName={heightClassName}
    />
  );
}
