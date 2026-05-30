import type { LucideIcon } from 'lucide-react';
import {
  Wifi,
  Wind,
  Car,
  Waves,
  Dumbbell,
  WashingMachine,
  ChefHat,
  Tv,
  Home,
  Mountain,
  Briefcase,
  ArrowUpDown,
  Shield,
  BatteryCharging,
  BedDouble,
  Bath,
  Sparkles,
  CircleDot,
} from 'lucide-react';

/** Preset amenities selectable in admin (order preserved for UI). */
export const PRESET_PROPERTY_AMENITIES = [
  'WiFi',
  'Air Conditioning',
  'Parking',
  'Swimming Pool',
  'Gym',
  'Washing Machine',
  'Kitchen',
  'TV',
  'Balcony',
  'Sea View',
  'Mountain View',
  'Workspace',
  'Lift Access',
  'Security',
  'Loadshedding Backup',
  'Linen Provided',
  'Towels Provided',
] as const;

export type PresetPropertyAmenity = (typeof PRESET_PROPERTY_AMENITIES)[number];

const PRESET_SET = new Set<string>(PRESET_PROPERTY_AMENITIES);

function normalizeLabel(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/** Parse and dedupe amenity labels from API / form input. */
export function normalizePropertyAmenities(input: unknown): string[] {
  if (!input) return [];

  const raw: string[] = Array.isArray(input)
    ? input.map((item) =>
        typeof item === 'string' ? item : typeof item === 'object' && item && 'name' in item
          ? String((item as { name: unknown }).name)
          : String(item)
      )
    : typeof input === 'string'
      ? input.split(',')
      : [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of raw) {
    const label = normalizeLabel(item);
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(label);
  }

  return result;
}

export function extractAmenitiesFromAttributes(
  attributes?: Record<string, unknown> | null
): string[] {
  if (!attributes) return [];
  return normalizePropertyAmenities(attributes.amenities);
}

export function amenitiesForAttributes(
  body: Record<string, unknown>
): { amenities: string[] } {
  return { amenities: normalizePropertyAmenities(body.amenities) };
}

/** Keep admin-selected amenities when Uplisting sync does not provide them. */
export function mergePreservedAmenityAttributes(
  incoming: Record<string, unknown>,
  existing: Record<string, unknown>
): Record<string, unknown> {
  const merged = { ...incoming };
  const existingAmenities = extractAmenitiesFromAttributes(existing);
  const incomingAmenities = extractAmenitiesFromAttributes(incoming);

  if (existingAmenities.length > 0 && incomingAmenities.length === 0) {
    merged.amenities = existingAmenities;
  } else if (incomingAmenities.length > 0) {
    merged.amenities = incomingAmenities;
  }

  return merged;
}

const AMENITY_ICON_MAP: Record<string, LucideIcon> = {
  wifi: Wifi,
  'air conditioning': Wind,
  parking: Car,
  'swimming pool': Waves,
  pool: Waves,
  gym: Dumbbell,
  'washing machine': WashingMachine,
  kitchen: ChefHat,
  tv: Tv,
  television: Tv,
  balcony: Home,
  'sea view': Waves,
  'ocean view': Waves,
  'mountain view': Mountain,
  'mountain views': Mountain,
  workspace: Briefcase,
  'lift access': ArrowUpDown,
  elevator: ArrowUpDown,
  security: Shield,
  'loadshedding backup': BatteryCharging,
  'linen provided': BedDouble,
  'towels provided': Bath,
};

export function getAmenityIcon(label: string): LucideIcon {
  const key = normalizeLabel(label).toLowerCase();
  return AMENITY_ICON_MAP[key] ?? Sparkles;
}

export function isPresetAmenity(label: string): boolean {
  return PRESET_SET.has(normalizeLabel(label));
}

export function sortAmenitiesForDisplay(amenities: string[]): string[] {
  return [...amenities].sort((a, b) => {
    const aPreset = PRESET_PROPERTY_AMENITIES.indexOf(a as PresetPropertyAmenity);
    const bPreset = PRESET_PROPERTY_AMENITIES.indexOf(b as PresetPropertyAmenity);
    if (aPreset !== -1 && bPreset !== -1) return aPreset - bPreset;
    if (aPreset !== -1) return -1;
    if (bPreset !== -1) return 1;
    return a.localeCompare(b);
  });
}

export function getAmenityAccentClass(label: string): string {
  const key = normalizeLabel(label).toLowerCase();
  if (key.includes('view') || key.includes('sea') || key.includes('ocean')) {
    return 'group-hover:border-sky-400/35 group-hover:bg-sky-500/15';
  }
  if (key.includes('wifi') || key.includes('workspace')) {
    return 'group-hover:border-right-stay-400/40 group-hover:bg-right-stay-500/20';
  }
  return 'group-hover:border-white/25 group-hover:bg-white/10';
}
