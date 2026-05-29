"use client";

import {
  TrendingUp,
  Building2,
  ShieldCheck,
  Sparkles,
  BarChart3,
  MapPin,
} from "lucide-react";
import PremiumWhySection from "@/components/premium/PremiumWhySection";

const HOST_STATS = [
  { value: "R58M+", label: "Assets Under Management", note: "Portfolio value" },
  { value: "10+", label: "Managed Properties", note: "Premium portfolio" },
  { value: "4.8★", label: "Guest Satisfaction", note: "Verified reviews" },
  { value: "95%+", label: "Average Occupancy Performance", note: "Consistent performance" },
  { value: "100%", label: "Transparent Reporting", note: "Owner accountability" },
  { value: "24/7", label: "Guest Support", note: "Always available" },
];

const HOST_FEATURES = [
  {
    icon: TrendingUp,
    title: "Revenue Optimisation",
    description:
      "Dynamic pricing and channel management designed to maximise earnings.",
  },
  {
    icon: Building2,
    title: "Complete Asset Management",
    description:
      "Cleaning, maintenance, guest communication and reporting managed under one roof.",
  },
  {
    icon: ShieldCheck,
    title: "Client Protection",
    description:
      "Full transparency, detailed reporting and accountability at every stage.",
  },
  {
    icon: Sparkles,
    title: "Premium Guest Experience",
    description:
      "Luxury hospitality standards that generate better reviews and repeat bookings.",
  },
  {
    icon: BarChart3,
    title: "Data Driven Decisions",
    description:
      "Real-time analytics and performance tracking across every property.",
  },
  {
    icon: MapPin,
    title: "Local Expertise",
    description:
      "A team that understands African tourism, hospitality and property operations.",
  },
];

export default function HostWhyPartner() {
  return (
    <PremiumWhySection
      eyebrow="Property & Asset Management"
      headline="Because We Know What You Want. But We Deliver What You Need."
      supportingText="We don't just manage properties. We manage experiences, protect assets and create returns through systems designed to perform."
      ctaLabel="Partner With Us"
      ctaHref="/contact"
      features={HOST_FEATURES}
      stats={HOST_STATS}
      statsEyebrow="Proven Results"
      statsTitle="Our Track Record"
      statsSubtitle="Real numbers from a growing portfolio — managed with transparency and care."
      collageBadge="Portfolio Performance"
      collageBadgeValue="R58M+ AUM"
    />
  );
}
