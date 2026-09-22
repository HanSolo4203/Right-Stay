import {
  Bike,
  Camera,
  Coffee,
  Compass,
  Martini,
  Mountain,
  Music,
  Palette,
  Ship,
  ShoppingBag,
  Sun,
  TreePine,
  Users,
  Utensils,
  Waves,
  type LucideIcon,
} from 'lucide-react';

export const GUIDE_CATEGORY_ICONS = {
  Utensils,
  Camera,
  Mountain,
  Waves,
  Martini,
  Users,
  ShoppingBag,
  TreePine,
  Sun,
  Compass,
  Palette,
  Music,
  Ship,
  Bike,
  Coffee,
} as const;

export type GuideCategoryIconName = keyof typeof GUIDE_CATEGORY_ICONS;

export function isGuideCategoryIconName(value: string): value is GuideCategoryIconName {
  return value in GUIDE_CATEGORY_ICONS;
}

export function getGuideCategoryIcon(name: string): LucideIcon {
  return isGuideCategoryIconName(name) ? GUIDE_CATEGORY_ICONS[name] : Compass;
}