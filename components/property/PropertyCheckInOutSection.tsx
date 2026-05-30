'use client';

import { Clock, LogIn, LogOut } from 'lucide-react';
import { resolvePropertyCheckTimes } from '@/lib/property-times';

type PropertyCheckInOutSectionProps = {
  checkInTime?: number | null;
  checkOutTime?: number | null;
  attributes?: {
    check_in_time?: number | null;
    check_out_time?: number | null;
  } | null;
  variant?: 'light' | 'dark';
  className?: string;
};

export default function PropertyCheckInOutSection({
  checkInTime,
  checkOutTime,
  attributes,
  variant = 'light',
  className = '',
}: PropertyCheckInOutSectionProps) {
  const { checkIn, checkOut } = resolvePropertyCheckTimes({
    check_in_time: checkInTime ?? attributes?.check_in_time,
    check_out_time: checkOutTime ?? attributes?.check_out_time,
  });

  if (!checkIn && !checkOut) return null;

  const isDark = variant === 'dark';

  return (
    <section
      className={className}
      aria-labelledby="property-check-times-heading"
    >
      <div className="mb-5 sm:mb-6">
        <h2
          id="property-check-times-heading"
          className={`font-display text-xl font-semibold tracking-tight sm:text-2xl ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Check-in &amp; check-out
        </h2>
        <p
          className={`mt-2 text-sm sm:text-base ${
            isDark ? 'text-white/60' : 'text-gray-600'
          }`}
        >
          Plan your arrival and departure with ease.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {checkIn && (
          <div
            className={`group flex items-center gap-4 rounded-2xl border p-4 transition-[border-color,box-shadow] duration-300 sm:p-5 ${
              isDark
                ? 'border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-lg shadow-black/20 hover:border-right-stay-400/30'
                : 'border-gray-200/80 bg-gradient-to-br from-white to-right-stay-50/30 shadow-sm hover:border-right-stay-300/50 hover:shadow-md'
            }`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${
                isDark
                  ? 'border-white/10 bg-white/5 group-hover:border-right-stay-400/40 group-hover:bg-right-stay-500/20'
                  : 'border-right-stay-200/60 bg-right-stay-50/80 group-hover:border-right-stay-400/40'
              }`}
            >
              <LogIn
                className={`h-5 w-5 ${isDark ? 'text-right-stay-300' : 'text-right-stay-600'}`}
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
            <div className="min-w-0">
              <p
                className={`text-xs font-medium uppercase tracking-wide ${
                  isDark ? 'text-white/50' : 'text-gray-500'
                }`}
              >
                Check-in
              </p>
              <p
                className={`mt-0.5 text-lg font-semibold tabular-nums ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {checkIn}
              </p>
            </div>
          </div>
        )}

        {checkOut && (
          <div
            className={`group flex items-center gap-4 rounded-2xl border p-4 transition-[border-color,box-shadow] duration-300 sm:p-5 ${
              isDark
                ? 'border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-lg shadow-black/20 hover:border-right-stay-400/30'
                : 'border-gray-200/80 bg-gradient-to-br from-white to-right-stay-50/30 shadow-sm hover:border-right-stay-300/50 hover:shadow-md'
            }`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${
                isDark
                  ? 'border-white/10 bg-white/5 group-hover:border-right-stay-400/40 group-hover:bg-right-stay-500/20'
                  : 'border-right-stay-200/60 bg-right-stay-50/80 group-hover:border-right-stay-400/40'
              }`}
            >
              <LogOut
                className={`h-5 w-5 ${isDark ? 'text-right-stay-300' : 'text-right-stay-600'}`}
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
            <div className="min-w-0">
              <p
                className={`text-xs font-medium uppercase tracking-wide ${
                  isDark ? 'text-white/50' : 'text-gray-500'
                }`}
              >
                Check-out
              </p>
              <p
                className={`mt-0.5 text-lg font-semibold tabular-nums ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {checkOut}
              </p>
            </div>
          </div>
        )}
      </div>

      <p
        className={`mt-4 flex items-center gap-1.5 text-xs ${
          isDark ? 'text-white/45' : 'text-gray-500'
        }`}
      >
        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Times are local to the property
      </p>
    </section>
  );
}
