"use client";

import { Eye, Home, Sparkles, Target } from "lucide-react";
import PremiumContentBlock from "@/components/premium/PremiumContentBlock";
import PremiumFeatureCard from "@/components/premium/PremiumFeatureCard";

const differentiators = [
  {
    icon: Home,
    title: "Owner First",
    description: "We manage every property as if it were our own.",
  },
  {
    icon: Eye,
    title: "Transparency Always",
    description: "Clear reporting, honest communication and zero surprises.",
  },
  {
    icon: Target,
    title: "Intentional Growth",
    description: "We prioritise quality partnerships over rapid expansion.",
  },
  {
    icon: Sparkles,
    title: "Experience Obsessed",
    description: "Exceptional guest experiences create exceptional returns.",
  },
];

export default function AboutDifferentSection() {
  return (
    <PremiumContentBlock
      eyebrow="What Makes Us Different"
      title="Standards You Can Feel. Results You Can Measure."
      subtitle="Four principles that guide every property, every guest stay, and every owner relationship."
      centered
    >
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
        {differentiators.map((item, index) => (
          <PremiumFeatureCard key={item.title} {...item} index={index} variant="grid" />
        ))}
      </div>
    </PremiumContentBlock>
  );
}
