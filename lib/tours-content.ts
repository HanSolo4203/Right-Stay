import {
  CalendarCheck,
  Compass,
  Eye,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import { MARKETING_IMAGES } from "@/lib/marketing-images";

export type TourFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type TourExperience = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  span: "large" | "medium" | "small";
};

export type TourDestination = {
  id: string;
  name: string;
  region: string;
  highlight: string;
  image: string;
  imageAlt: string;
  span: "hero" | "wide" | "tall" | "standard";
};

export type TourProcessStep = {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type TourTestimonial = {
  id: string;
  guestName: string;
  locationVisited: string;
  review: string;
  rating: number;
  initials: string;
};

export const TOUR_WHY_FEATURES: TourFeature[] = [
  {
    icon: MapPin,
    title: "Local Expertise",
    description: "Guides and partners who know the land, culture and hidden gems intimately.",
  },
  {
    icon: Sparkles,
    title: "Curated Experiences",
    description: "Every itinerary is hand-selected — never mass-market or one-size-fits-all.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Partners",
    description: "Vetted lodges, operators and hosts across the continent you can rely on.",
  },
  {
    icon: CalendarCheck,
    title: "Seamless Planning",
    description: "From transfers to reservations, we handle the details so you don't have to.",
  },
  {
    icon: Star,
    title: "Premium Service",
    description: "White-glove support before, during and after your journey.",
  },
  {
    icon: Users,
    title: "Small Groups & Private Tours",
    description: "Intimate experiences tailored to your pace, interests and travel style.",
  },
];

export const TOUR_EXPERIENCES: TourExperience[] = [
  {
    id: "safari",
    title: "Safari Adventures",
    description: "Track the Big Five across pristine wilderness with expert rangers and luxury lodges.",
    image: MARKETING_IMAGES.safariLodge,
    imageAlt: "Safari wildlife experience in African bush",
    span: "large",
  },
  {
    id: "city",
    title: "City Experiences",
    description: "Discover vibrant urban culture, architecture and cuisine in Africa's great cities.",
    image: MARKETING_IMAGES.heroCapeTown,
    imageAlt: "Cape Town cityscape at sunset",
    span: "medium",
  },
  {
    id: "wine-food",
    title: "Wine & Food Tours",
    description: "Savour world-class wines, farm-to-table dining and culinary traditions.",
    image: MARKETING_IMAGES.wineEstate,
    imageAlt: "Wine estate in the Cape Winelands",
    span: "medium",
  },
  {
    id: "cultural",
    title: "Cultural Experiences",
    description: "Connect with communities, heritage sites and living traditions across the continent.",
    image: MARKETING_IMAGES.coastalVilla,
    imageAlt: "Authentic African cultural experience",
    span: "small",
  },
  {
    id: "adventure",
    title: "Adventure Activities",
    description: "Hiking, diving, hot air balloons and adrenaline experiences in stunning settings.",
    image: MARKETING_IMAGES.gardenRoute,
    imageAlt: "Adventure along the Garden Route coastline",
    span: "small",
  },
  {
    id: "beach",
    title: "Beach Escapes",
    description: "Pristine coastlines, island retreats and turquoise waters for pure relaxation.",
    image: "/images/6b428a64-0de1-4837-bab2-9729ce2e28c2_3840w_1.jpg",
    imageAlt: "Coastal beach escape in Southern Africa",
    span: "small",
  },
];

export const TOUR_DESTINATIONS: TourDestination[] = [
  {
    id: "cape-town",
    name: "Cape Town",
    region: "South Africa",
    highlight: "Table Mountain, wine lands and coastal beauty",
    image: MARKETING_IMAGES.heroCapeTown,
    imageAlt: "Cape Town with Table Mountain",
    span: "hero",
  },
  {
    id: "kruger",
    name: "Kruger National Park",
    region: "South Africa",
    highlight: "Premier Big Five safari destination",
    image: MARKETING_IMAGES.safariLodge,
    imageAlt: "Kruger National Park safari",
    span: "wide",
  },
  {
    id: "garden-route",
    name: "Garden Route",
    region: "South Africa",
    highlight: "Forests, lagoons and dramatic coastline",
    image: MARKETING_IMAGES.gardenRoute,
    imageAlt: "Garden Route scenic landscape",
    span: "tall",
  },
  {
    id: "victoria-falls",
    name: "Victoria Falls",
    region: "Zimbabwe & Zambia",
    highlight: "One of the world's greatest natural wonders",
    image: "/images/6d30fe29-43aa-4fc2-a513-6aa41d38a7d0_3840w_1.jpg",
    imageAlt: "Victoria Falls mist and rainforest",
    span: "standard",
  },
  {
    id: "lake-malawi",
    name: "Lake Malawi",
    region: "Malawi",
    highlight: "Crystal-clear waters and lakeside serenity",
    image: "/images/d953ad7f-2dd7-42f7-8f74-593d55181036_3840w_1.jpg",
    imageAlt: "Lake Malawi shoreline",
    span: "standard",
  },
  {
    id: "zanzibar",
    name: "Zanzibar",
    region: "Tanzania",
    highlight: "Spice islands, white sand and Swahili culture",
    image: "/images/6b428a64-0de1-4837-bab2-9729ce2e28c2_3840w_1.jpg",
    imageAlt: "Zanzibar tropical coastline",
    span: "standard",
  },
  {
    id: "botswana",
    name: "Botswana",
    region: "Southern Africa",
    highlight: "Okavango Delta and exclusive wilderness",
    image: MARKETING_IMAGES.safariLodge,
    imageAlt: "Botswana wilderness safari",
    span: "standard",
  },
  {
    id: "namibia",
    name: "Namibia",
    region: "Southern Africa",
    highlight: "Desert dunes, wildlife and otherworldly landscapes",
    image: "/images/6d30fe29-43aa-4fc2-a513-6aa41d38a7d0_800w_1.jpg",
    imageAlt: "Namibia desert landscape",
    span: "wide",
  },
];

export const TOUR_PROCESS_STEPS: TourProcessStep[] = [
  {
    number: "01",
    title: "Tell Us What You Want",
    description:
      "Share your interests, travel dates and dream experiences. We'll listen carefully to what matters most to you.",
    icon: MessageSquare,
  },
  {
    number: "02",
    title: "We Curate Your Journey",
    description:
      "Our team designs a bespoke itinerary with hand-picked experiences, accommodations and local experts.",
    icon: Compass,
  },
  {
    number: "03",
    title: "We Handle The Logistics",
    description:
      "Transfers, bookings, permits and every detail — managed seamlessly so you can focus on the adventure.",
    icon: CalendarCheck,
  },
  {
    number: "04",
    title: "You Experience Africa",
    description:
      "Arrive ready to immerse yourself. Our support continues throughout your journey for total peace of mind.",
    icon: Eye,
  },
];

export const TOUR_TESTIMONIALS: TourTestimonial[] = [
  {
    id: "1",
    guestName: "James & Catherine M.",
    locationVisited: "Kruger Safari & Cape Town",
    review:
      "Right Stay crafted the most incredible two-week journey for us. From our private safari drives to a sunset dinner on the V&A Waterfront — every moment felt personal and perfectly timed.",
    rating: 5,
    initials: "JM",
  },
  {
    id: "2",
    guestName: "Sarah Okonkwo",
    locationVisited: "Garden Route & Winelands",
    review:
      "I've travelled extensively across Africa, but this was something else. The attention to detail, the local guides, the hidden spots we'd never have found alone — absolutely world-class.",
    rating: 5,
    initials: "SO",
  },
  {
    id: "3",
    guestName: "David & Emma Larsen",
    locationVisited: "Victoria Falls & Botswana",
    review:
      "Planning a multi-country trip felt overwhelming until we found Right Stay. They handled everything flawlessly. The helicopter flight over the Falls was the highlight of our lives.",
    rating: 5,
    initials: "DL",
  },
  {
    id: "4",
    guestName: "Priya Sharma",
    locationVisited: "Zanzibar & Lake Malawi",
    review:
      "A perfect blend of adventure and relaxation. Small group sizes meant authentic connections with local communities. We felt like travellers, not tourists.",
    rating: 5,
    initials: "PS",
  },
];

export const TOUR_WHY_COLLAGE = [
  { src: MARKETING_IMAGES.safariLodge, alt: "Safari experience", className: "col-span-2 row-span-2" },
  { src: MARKETING_IMAGES.heroCapeTown, alt: "Cape Town destination", className: "col-span-1 row-span-1" },
  { src: MARKETING_IMAGES.wineEstate, alt: "Wine tour experience", className: "col-span-1 row-span-1" },
] as const;
