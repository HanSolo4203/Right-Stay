'use client';

import dynamic from 'next/dynamic';

const PropertyLocationPickerView = dynamic(
  () => import('./PropertyLocationPickerView'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/70" aria-hidden="true" />
      </div>
    ),
  }
);

interface PropertyLocationPickerProps {
  latitude: string;
  longitude: string;
  onCoordinatesChange: (lat: string, lng: string) => void;
}

export default function PropertyLocationPicker(props: PropertyLocationPickerProps) {
  return <PropertyLocationPickerView {...props} />;
}
