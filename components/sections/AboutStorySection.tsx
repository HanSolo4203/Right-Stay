"use client";

import PremiumSectionBackground from "@/components/premium/PremiumSectionBackground";
import AboutStoryCollage from "./AboutStoryCollage";

export default function AboutStorySection() {
  return (
    <PremiumSectionBackground>
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="lg:pr-4">
            <p
              className="animate-on-scroll text-xs font-medium uppercase tracking-[0.28em] text-right-stay-400/90"
              style={{ animation: "fadeSlideIn 0.8s ease-out 0.05s both" }}
            >
              Our Story
            </p>

            <h2
              className="animate-on-scroll mt-4 font-display text-3xl font-medium leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-5xl"
              style={{ animation: "fadeSlideIn 0.9s ease-out 0.12s both" }}
            >
              Born From Ownership. Built on Trust.
            </h2>

            <div className="mt-8 space-y-5">
              {[
                "Right Stay Africa started with a frustration shared by property owners across the continent — great assets, underwhelming management, and guests who deserved more than the industry standard.",
                "Our founders weren't consultants or outsiders. They were owners who had managed their own properties, lived the late-night guest calls, and seen what happens when transparency is treated as optional.",
                "So they built something different: a hospitality and asset management company that treats every property as if it were their own — with clear reporting, premium guest experiences, and a long-term view on quality over volume.",
                "Today, we manage a growing portfolio across Africa — from luxury city apartments to safari lodges and coastal retreats — united by one belief: exceptional is always possible when the details are handled with care.",
              ].map((paragraph, index) => (
                <p
                  key={paragraph.slice(0, 32)}
                  className="animate-on-scroll text-base leading-relaxed text-white/65 sm:text-lg"
                  style={{ animation: `fadeSlideIn 0.8s ease-out ${0.18 + index * 0.06}s both` }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <AboutStoryCollage />
        </div>
      </div>
    </PremiumSectionBackground>
  );
}
