"use client";

import type { LucideIcon } from "lucide-react";
import { BarChart3, Building2, Compass, Globe2, Sparkles } from "lucide-react";
import PremiumContentBlock from "@/components/premium/PremiumContentBlock";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

type AboutMetric = {
  icon: LucideIcon;
  value: string;
  label: string;
  animate?: boolean;
};

const METRICS: AboutMetric[] = [
  {
    icon: Building2,
    value: "R58M+",
    label: "Assets Under Management",
    animate: true,
  },
  {
    icon: Globe2,
    value: "Premium",
    label: "Accommodation Across Africa",
  },
  {
    icon: BarChart3,
    value: "End-to-End",
    label: "Asset Management",
  },
  {
    icon: Sparkles,
    value: "Guest",
    label: "Experiences & Tours",
  },
  {
    icon: Compass,
    value: "Transparent",
    label: "Reporting",
  },
];

function MetricCard({ metric, index }: { metric: AboutMetric; index: number }) {
  const { display, ref } = useAnimatedCounter(metric.animate ? metric.value : "");
  const Icon = metric.icon;

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 backdrop-blur-xl transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-right-stay-400/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] animate-on-scroll sm:p-7"
      style={{ animation: `fadeSlideIn 0.7s ease-out ${0.1 + index * 0.07}s both` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-right-stay-500/0 to-right-stay-500/0 transition-all duration-500 group-hover:from-right-stay-500/10 group-hover:to-transparent" />

      <div className="relative">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors duration-300 group-hover:border-right-stay-400/40 group-hover:bg-right-stay-500/20">
          <Icon className="h-5 w-5 text-right-stay-300" strokeWidth={1.5} />
        </div>

        <p className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {metric.animate ? (
            <span ref={ref} className="tabular-nums">
              {display}
            </span>
          ) : (
            metric.value
          )}
        </p>

        <p className="mt-2 text-sm leading-snug text-white/60 sm:text-base">{metric.label}</p>
      </div>
    </article>
  );
}

export default function AboutTodaySection() {
  return (
    <PremiumContentBlock
      eyebrow="Right Stay Africa Today"
      title="A Portfolio Built on Performance and Care"
      subtitle="From premium stays to end-to-end asset management — we deliver hospitality that earns trust on both sides of the door."
      centered
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((metric, index) => (
          <MetricCard key={metric.label} metric={metric} index={index} />
        ))}
      </div>
    </PremiumContentBlock>
  );
}
