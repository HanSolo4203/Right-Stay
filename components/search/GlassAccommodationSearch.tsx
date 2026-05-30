"use client";

import { FormEvent } from "react";
import GlassSearchDateRange from "@/components/ui/GlassSearchDateRange";
import type { AccommodationSearchForm } from "@/lib/accommodation-search";
import { isValidAccommodationDateRange } from "@/lib/accommodation-search";
import {
  calculateNightsBetween,
  DEFAULT_MINIMUM_STAY_NIGHTS,
} from "@/lib/pricing";
import { glassFrostInput, glassFrostPanel } from "@/lib/glass-styles";
import { AlertCircle, ChevronDown, MapPin, Search, Users } from "lucide-react";

type GlassAccommodationSearchProps = {
  formData: AccommodationSearchForm;
  onFormDataChange: (updates: Partial<AccommodationSearchForm>) => void;
  locations: string[];
  loadingLocations: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  showTabs?: boolean;
  className?: string;
};

export default function GlassAccommodationSearch({
  formData,
  onFormDataChange,
  locations,
  loadingLocations,
  onSubmit,
  showTabs = true,
  className = "",
}: GlassAccommodationSearchProps) {
  const minimumStayError =
    formData.checkIn &&
    formData.checkOut &&
    isValidAccommodationDateRange(formData.checkIn, formData.checkOut) &&
    calculateNightsBetween(formData.checkIn, formData.checkOut) <
      DEFAULT_MINIMUM_STAY_NIGHTS
      ? `Minimum stay is ${DEFAULT_MINIMUM_STAY_NIGHTS} nights.`
      : null;

  return (
    <div
      className={`w-full min-w-0 rounded-3xl p-4 sm:p-8 overflow-visible ${glassFrostPanel} ${className}`.trim()}
    >
      {showTabs && (
        <p className="leading-relaxed text-lg font-normal text-white/90 tracking-tight mb-6">
          Accommodations<span className="text-white/60 mx-2">•</span>Tours & Experiences
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-4 min-w-0">
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
          <select
            value={formData.location}
            onChange={(e) => onFormDataChange({ location: e.target.value })}
            required
            className={`w-full pl-12 pr-10 py-4 appearance-none cursor-pointer ${glassFrostInput}`}
            style={{ color: formData.location ? "white" : "rgba(255, 255, 255, 0.6)" }}
          >
            <option value="" className="bg-gray-800 text-white">
              {loadingLocations ? "Loading locations..." : "Where are you going?"}
            </option>
            {locations.map((location) => (
              <option key={location} value={location} className="bg-gray-800 text-white">
                {location}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none" />
        </div>

        <div className="space-y-2">
          <GlassSearchDateRange
            checkIn={formData.checkIn}
            checkOut={formData.checkOut}
            onDatesChange={(checkIn, checkOut) => onFormDataChange({ checkIn, checkOut })}
          />
          {minimumStayError && (
            <div
              className="flex items-start gap-3 rounded-xl border-2 border-red-400/80 bg-red-500/30 px-4 py-3 text-base font-semibold text-white shadow-[0_0_24px_rgba(239,68,68,0.35)]"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-100" aria-hidden />
              <p>{minimumStayError}</p>
            </div>
          )}
        </div>

        <div className="relative">
          <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
          <select
            value={formData.guests}
            onChange={(e) => onFormDataChange({ guests: e.target.value })}
            required
            className={`w-full pl-12 pr-10 py-4 appearance-none cursor-pointer ${glassFrostInput}`}
            style={{ color: formData.guests ? "white" : "rgba(255, 255, 255, 0.6)" }}
          >
            <option value="" className="bg-gray-800 text-white">
              Guests
            </option>
            <option value="1" className="bg-gray-800 text-white">
              1 Guest
            </option>
            <option value="2" className="bg-gray-800 text-white">
              2 Guests
            </option>
            <option value="3" className="bg-gray-800 text-white">
              3 Guests
            </option>
            <option value="4" className="bg-gray-800 text-white">
              4 Guests
            </option>
            <option value="5" className="bg-gray-800 text-white">
              5 Guests
            </option>
            <option value="6" className="bg-gray-800 text-white">
              6+ Guests
            </option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none" />
        </div>

        <button
          type="submit"
          className="w-full bg-white text-black font-semibold py-4 px-6 rounded-2xl hover:bg-white/90 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Search className="h-5 w-5" />
          Search Accommodations
        </button>
      </form>
    </div>
  );
}
