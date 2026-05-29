"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import PremiumSectionBackground from "./PremiumSectionBackground";
import PremiumFeatureCardGrid from "./PremiumFeatureCardGrid";
import PremiumStatsStrip, { type PremiumStat } from "./PremiumStatsStrip";
import PremiumVisualCollage from "./PremiumVisualCollage";

export type PremiumFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type PremiumWhySectionProps = {
  headline: string;
  supportingText: string;
  ctaLabel: string;
  ctaHref: string;
  features: PremiumFeature[];
  stats?: PremiumStat[];
  collageBadge?: string;
  collageBadgeValue?: string;
  eyebrow?: string;
  statsEyebrow?: string;
  statsTitle?: string;
  statsSubtitle?: string;
};

export default function PremiumWhySection({
  headline,
  supportingText,
  ctaLabel,
  ctaHref,
  features,
  stats,
  collageBadge,
  collageBadgeValue,
  eyebrow = "Right Stay Africa",
  statsEyebrow,
  statsTitle,
  statsSubtitle,
}: PremiumWhySectionProps) {
  useScrollAnimation();

  return (
    <PremiumSectionBackground>
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        {/* Split hero */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="lg:pr-4">
            <p
              className="animate-on-scroll text-xs font-medium uppercase tracking-[0.28em] text-right-stay-400/90"
              style={{ animation: "fadeSlideIn 0.8s ease-out 0.05s both" }}
            >
              {eyebrow}
            </p>
            <h2
              className="animate-on-scroll mt-4 font-display text-3xl font-medium leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-[3.25rem]"
              style={{ animation: "fadeSlideIn 0.9s ease-out 0.12s both" }}
            >
              {headline}
            </h2>
            <p
              className="animate-on-scroll mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg"
              style={{ animation: "fadeSlideIn 0.9s ease-out 0.2s both" }}
            >
              {supportingText}
            </p>
            <div
              className="animate-on-scroll mt-8 sm:mt-10"
              style={{ animation: "fadeSlideIn 0.9s ease-out 0.28s both" }}
            >
              <Link
                href={ctaHref}
                className="group inline-flex items-center gap-2.5 rounded-full bg-right-stay-500 px-8 py-4 text-sm font-semibold text-white shadow-[0_0_40px_rgba(51,126,47,0.35)] transition-all duration-300 hover:bg-right-stay-400 hover:shadow-[0_0_50px_rgba(51,126,47,0.45)] hover:-translate-y-0.5"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <PremiumVisualCollage badge={collageBadge} badgeValue={collageBadgeValue} />
        </div>

        {stats && stats.length > 0 && (
          <>
            {(statsEyebrow || statsTitle || statsSubtitle) && (
              <div className="mt-16 sm:mt-20 text-center max-w-2xl mx-auto">
                {statsEyebrow && (
                  <p
                    className="animate-on-scroll text-xs font-medium uppercase tracking-[0.28em] text-right-stay-400/90"
                    style={{ animation: "fadeSlideIn 0.8s ease-out 0.05s both" }}
                  >
                    {statsEyebrow}
                  </p>
                )}
                {statsTitle && (
                  <h3
                    className={`animate-on-scroll font-display text-2xl font-medium tracking-tight text-white sm:text-3xl lg:text-4xl ${statsEyebrow ? "mt-3" : ""}`}
                    style={{ animation: "fadeSlideIn 0.9s ease-out 0.1s both" }}
                  >
                    {statsTitle}
                  </h3>
                )}
                {statsSubtitle && (
                  <p
                    className="animate-on-scroll mt-3 text-base leading-relaxed text-white/60 sm:text-lg"
                    style={{ animation: "fadeSlideIn 0.9s ease-out 0.15s both" }}
                  >
                    {statsSubtitle}
                  </p>
                )}
              </div>
            )}
            <PremiumStatsStrip
              stats={stats}
              className={statsTitle || statsSubtitle ? "!mt-8 sm:!mt-10" : undefined}
            />
          </>
        )}

        {/* Feature cards */}
        <div className="mt-16 sm:mt-20">
          <p
            className="animate-on-scroll mb-8 text-center text-xs font-medium uppercase tracking-[0.22em] text-white/40"
            style={{ animation: "fadeSlideIn 0.8s ease-out 0.1s both" }}
          >
            How we deliver
          </p>

          <PremiumFeatureCardGrid features={features} />
        </div>
      </div>
    </PremiumSectionBackground>
  );
}
