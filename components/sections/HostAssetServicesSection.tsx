"use client";

import { Calendar, Users, Shield, DollarSign, BarChart3, TrendingUp } from "lucide-react";
import PremiumContentBlock from "@/components/premium/PremiumContentBlock";
import PremiumFeatureCard from "@/components/premium/PremiumFeatureCard";

const services = [
  {
    icon: Calendar,
    title: "Booking Management",
    description:
      "Full calendar management across Airbnb, Booking.com and direct bookings, with pricing strategies tuned to your asset.",
  },
  {
    icon: Users,
    title: "Guest Services",
    description:
      "Professional guest communication, check-in coordination and support. Every stay reflects your standards.",
  },
  {
    icon: Shield,
    title: "Property Maintenance",
    description:
      "Regular inspections, preventative maintenance and emergency repairs — your property stays guest-ready, year round.",
  },
  {
    icon: DollarSign,
    title: "Financial Management",
    description:
      "Detailed reporting, expense tracking and transparent accounting so you always know how your asset is performing.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Data-driven insights on occupancy, revenue trends and market positioning to inform confident decisions.",
  },
  {
    icon: TrendingUp,
    title: "Revenue Optimisation",
    description:
      "Dynamic pricing, seasonal adjustments and campaigns designed to maximise returns without compromising quality.",
  },
];

export default function HostAssetServicesSection() {
  return (
    <PremiumContentBlock
      eyebrow="Full-Service Management"
      title="Full-Service Property & Asset Management"
      subtitle="Right Stay Africa is your end-to-end partner — from listings and bookings to maintenance, reporting and guest care. One team, one standard, zero oversight gaps."
      centered
      variant="darker"
    >
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide lg:hidden">
        {services.map((service, index) => (
          <PremiumFeatureCard
            key={service.title}
            {...service}
            index={index}
            className="snap-center"
          />
        ))}
      </div>
      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
        {services.map((service, index) => (
          <PremiumFeatureCard key={service.title} {...service} index={index} />
        ))}
      </div>
      <div className="hidden sm:grid sm:grid-cols-2 sm:gap-5 lg:hidden">
        {services.map((service, index) => (
          <PremiumFeatureCard key={service.title} {...service} index={index} className="!w-full" />
        ))}
      </div>
    </PremiumContentBlock>
  );
}
