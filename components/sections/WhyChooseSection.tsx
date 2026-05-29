"use client";

import { ShieldCheck, Star, MapPin, DollarSign, Zap, Heart } from "lucide-react";
import PremiumWhySection from "@/components/premium/PremiumWhySection";

const GUEST_STATS = [
  { value: "R58M+", label: "Assets Under Management", note: "Portfolio value" },
  { value: "500+", label: "Happy Guests", note: "Across our stays" },
  { value: "4.9/5", label: "Guest Rating", note: "Verified reviews" },
  { value: "~75%", label: "Avg. Occupancy", note: "Consistent performance" },
  { value: "100%", label: "Verified Properties", note: "Personally inspected" },
  { value: "24/7", label: "Guest Support", note: "Always available" },
];

const GUEST_FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified & Secure",
    description:
      "Every property is personally inspected and verified. Your safety and security are our top priorities.",
  },
  {
    icon: Star,
    title: "Premium Quality",
    description:
      "Handpicked accommodations that meet our high standards for comfort, cleanliness, and style.",
  },
  {
    icon: MapPin,
    title: "Prime Locations",
    description:
      "Properties strategically located in the heart of Africa's most vibrant and sought-after destinations.",
  },
  {
    icon: DollarSign,
    title: "Best Value",
    description:
      "Competitive pricing with transparent fees. No hidden charges, just exceptional value for money.",
  },
  {
    icon: Zap,
    title: "Instant Book",
    description: "Start your African adventure today with our seamless booking experience.",
  },
  {
    icon: Heart,
    title: "Genuine Hospitality",
    description:
      "Local expertise and warm service — every stay managed with care, not corporate checklist hospitality.",
  },
];

export default function WhyChooseSection() {
  return (
    <PremiumWhySection
      eyebrow="Premium Stays"
      headline="Because We Know What You Want. We Deliver What You Need."
      supportingText="We don't just book accommodation. We curate experiences, verify every property and deliver stays engineered for comfort, safety and unforgettable memories."
      ctaLabel="Explore Stays"
      ctaHref="/stay-with-us"
      features={GUEST_FEATURES}
      stats={GUEST_STATS}
      collageBadge="Guest Satisfaction"
      collageBadgeValue="4.9/5 Rating"
    />
  );
}
