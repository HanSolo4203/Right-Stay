"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import PremiumContentBlock from "@/components/premium/PremiumContentBlock";
import { TOUR_EXPERIENCES } from "@/lib/tours-content";

const spanClasses: Record<(typeof TOUR_EXPERIENCES)[number]["span"], string> = {
  large: "col-span-1 row-span-2 min-h-[280px] sm:min-h-[320px] lg:min-h-0 lg:row-span-2",
  medium: "col-span-1 row-span-1 min-h-[240px] sm:min-h-[260px]",
  small: "col-span-1 row-span-1 min-h-[220px] sm:min-h-[240px]",
};

export default function ToursExperiencesSection() {
  return (
    <PremiumContentBlock
      id="experiences"
      eyebrow="Featured Experiences"
      title="Curated Journeys Across the Continent"
      subtitle="From wildlife encounters to coastal retreats — each experience is designed to reveal Africa at its most extraordinary."
      centered
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:grid-rows-2 lg:gap-6">
        {TOUR_EXPERIENCES.map((experience, index) => (
          <article
            key={experience.id}
            className={`group relative overflow-hidden rounded-2xl border border-white/10 animate-on-scroll ${spanClasses[experience.span]}`}
            style={{ animation: `fadeSlideIn 0.7s ease-out ${0.1 + index * 0.06}s both` }}
          >
            <Image
              src={experience.image}
              alt={experience.imageAlt}
              fill
              sizes={
                experience.span === "large"
                  ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 640px"
                  : IMAGE_SIZES.gridThird
              }
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-500 group-hover:from-black/95 group-hover:via-black/55" />

            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
              <h3 className="font-display text-xl font-semibold tracking-tight text-white sm:text-2xl lg:text-3xl">
                {experience.title}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70 transition-all duration-500 sm:text-base lg:mt-3 lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:group-hover:max-h-24 lg:group-hover:opacity-100">
                {experience.description}
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-right-stay-300 opacity-100 transition-all duration-300 hover:gap-3 hover:text-right-stay-200 lg:mt-0 lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:group-hover:mt-4 lg:group-hover:max-h-12 lg:group-hover:opacity-100"
              >
                View Experience
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/0 transition-all duration-500 group-hover:ring-white/20" />
          </article>
        ))}
      </div>
    </PremiumContentBlock>
  );
}
