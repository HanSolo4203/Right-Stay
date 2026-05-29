"use client";

import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

export type PremiumStat = {
  value: string;
  label: string;
  note?: string;
};

function StatItem({ stat, index }: { stat: PremiumStat; index: number }) {
  const { display, ref } = useAnimatedCounter(stat.value);

  return (
    <div
      className="flex flex-col items-center text-center px-4 py-6 sm:px-6 animate-on-scroll min-w-[140px] sm:min-w-0"
      style={{ animation: `fadeSlideIn 0.8s ease-out ${0.1 + index * 0.06}s both` }}
    >
      <span
        ref={ref}
        className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white tabular-nums"
      >
        {display}
      </span>
      <span className="mt-2 text-xs sm:text-sm font-medium text-white/90">{stat.label}</span>
      {stat.note && (
        <span className="mt-0.5 text-[10px] sm:text-xs text-white/45">{stat.note}</span>
      )}
    </div>
  );
}

export default function PremiumStatsStrip({
  stats,
  className = "",
}: {
  stats: PremiumStat[];
  className?: string;
}) {
  const lgCols =
    stats.length <= 4
      ? "lg:grid-cols-4"
      : stats.length === 5
        ? "lg:grid-cols-5"
        : "lg:grid-cols-6";
  const smCols = stats.length <= 4 ? "sm:grid-cols-2" : "sm:grid-cols-3";

  return (
    <div className={`relative mt-16 sm:mt-20 ${className}`}>
      <div className="absolute inset-0 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md" />
      <div
        className={`relative grid grid-cols-2 gap-px ${smCols} ${lgCols} divide-white/5 overflow-hidden rounded-2xl`}
      >
        {stats.map((stat, index) => (
          <StatItem key={stat.label} stat={stat} index={index} />
        ))}
      </div>
    </div>
  );
}
