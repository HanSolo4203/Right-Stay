"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import PremiumContentBlock from "@/components/premium/PremiumContentBlock";
import { TOUR_DESTINATIONS } from "@/lib/tours-content";

const tileClasses: Record<(typeof TOUR_DESTINATIONS)[number]["span"], string> = {
  hero: "col-span-1 row-span-2 min-h-[320px] sm:col-span-2 sm:min-h-[400px] lg:col-span-2 lg:row-span-2",
  wide: "col-span-1 min-h-[240px] sm:col-span-2 sm:min-h-[260px]",
  tall: "col-span-1 row-span-2 min-h-[320px] sm:min-h-[360px]",
  standard: "col-span-1 min-h-[220px] sm:min-h-[240px]",
};

export default function ToursDestinationsSection() {
  return (
    <PremiumContentBlock
      id="destinations"
      eyebrow="Destinations"
      title="Explore Africa's Most Remarkable Destinations"
      subtitle="From iconic landmarks to hidden wilderness — discover where your journey could take you."
      centered
      variant="darker"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {TOUR_DESTINATIONS.map((destination, index) => (
          <article
            key={destination.id}
            className={`group relative overflow-hidden rounded-2xl border border-white/10 animate-on-scroll ${tileClasses[destination.span]}`}
            style={{ animation: `fadeSlideIn 0.7s ease-out ${0.08 + index * 0.05}s both` }}
          >
            <Image
              src={destination.image}
              alt={destination.imageAlt}
              fill
              sizes={
                destination.span === "hero" || destination.span === "wide"
                  ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 640px"
                  : IMAGE_SIZES.gridThird
              }
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-all duration-500 group-hover:from-black/90 group-hover:via-black/50" />

            <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-right-stay-400/90">
                <MapPin className="h-3 w-3" strokeWidth={2} />
                {destination.region}
              </div>
              <h3 className="font-display mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {destination.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65 transition-all duration-500 sm:text-base lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:group-hover:max-h-20 lg:group-hover:opacity-100">
                {destination.highlight}
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-right-stay-300 transition-all duration-300 hover:gap-3 hover:text-right-stay-200 lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:group-hover:mt-4 lg:group-hover:max-h-12 lg:group-hover:opacity-100"
              >
                Plan This Trip
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/0 transition-all duration-500 group-hover:ring-right-stay-400/30" />
          </article>
        ))}
      </div>
    </PremiumContentBlock>
  );
}
