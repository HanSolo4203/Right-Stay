'use client';

import {
  extractAmenitiesFromAttributes,
  getAmenityAccentClass,
  getAmenityIcon,
  sortAmenitiesForDisplay,
} from '@/lib/property-amenities';

type PropertyAmenitiesSectionProps = {
  amenities?: string[] | null;
  attributes?: Record<string, unknown> | null;
  /** Light background pages (booking / quick view) */
  variant?: 'light' | 'dark';
  className?: string;
};

export default function PropertyAmenitiesSection({
  amenities: amenitiesProp,
  attributes,
  variant = 'light',
  className = '',
}: PropertyAmenitiesSectionProps) {
  const amenities = sortAmenitiesForDisplay(
    amenitiesProp?.length
      ? amenitiesProp
      : extractAmenitiesFromAttributes(attributes)
  );

  if (amenities.length === 0) return null;

  const isDark = variant === 'dark';

  return (
    <section className={className} aria-labelledby="property-amenities-heading">
      <div className="mb-6 sm:mb-8">
        <h2
          id="property-amenities-heading"
          className={`font-display text-xl font-semibold tracking-tight sm:text-2xl ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Amenities
        </h2>
        <p
          className={`mt-2 text-sm sm:text-base ${
            isDark ? 'text-white/60' : 'text-gray-600'
          }`}
        >
          Everything included for a comfortable stay.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {amenities.map((label, index) => {
          const Icon = getAmenityIcon(label);
          const accent = getAmenityAccentClass(label);

          return (
            <li
              key={`${label}-${index}`}
              className={`group relative overflow-hidden rounded-2xl border p-4 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 sm:p-5 ${
                isDark
                  ? `border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-lg shadow-black/20 ${accent}`
                  : 'border-gray-200/80 bg-gradient-to-br from-white to-right-stay-50/30 shadow-sm hover:border-right-stay-300/50 hover:shadow-md'
              }`}
            >
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-300 sm:h-11 sm:w-11 ${
                  isDark
                    ? 'border-white/10 bg-white/5'
                    : 'border-right-stay-200/60 bg-right-stay-50/80 group-hover:border-right-stay-400/40 group-hover:bg-right-stay-100/80'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isDark ? 'text-right-stay-300' : 'text-right-stay-600'
                  }`}
                  strokeWidth={1.5}
                  aria-hidden
                />
              </div>
              <span
                className={`block text-sm font-medium leading-snug sm:text-[0.9375rem] ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
