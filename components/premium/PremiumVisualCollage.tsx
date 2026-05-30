"use client";

import Image from "next/image";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { MARKETING_IMAGES } from "@/lib/marketing-images";

const COLLAGE_IMAGES = [
  {
    src: MARKETING_IMAGES.coastalVilla,
    alt: "Premium accommodation interior",
    className: "col-span-2 row-span-2",
  },
  {
    src: MARKETING_IMAGES.wineEstate,
    alt: "Luxury property exterior",
    className: "col-span-1 row-span-1",
  },
  {
    src: MARKETING_IMAGES.safariLodge,
    alt: "African destination experience",
    className: "col-span-1 row-span-1",
  },
];

type PremiumVisualCollageProps = {
  badge?: string;
  badgeValue?: string;
};

export default function PremiumVisualCollage({
  badge = "Portfolio Performance",
  badgeValue = "R58M+ AUM",
}: PremiumVisualCollageProps) {
  return (
    <div
      className="relative h-[420px] sm:h-[480px] lg:h-[560px] animate-on-scroll"
      style={{ animation: "fadeSlideIn 1s ease-out 0.35s both" }}
    >
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-right-stay-500/20 to-transparent blur-2xl" />

      <div className="relative grid h-full grid-cols-2 grid-rows-2 gap-3 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <div className={`relative ${COLLAGE_IMAGES[0].className} overflow-hidden`}>
          <Image
            src={COLLAGE_IMAGES[0].src}
            alt={COLLAGE_IMAGES[0].alt}
            fill
            sizes={IMAGE_SIZES.half}
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {COLLAGE_IMAGES.slice(1).map((img) => (
          <div key={img.src} className={`relative ${img.className} overflow-hidden`}>
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 50vw, 280px"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ))}
      </div>

      {/* Glass dashboard mockup overlay */}
      <div className="absolute -bottom-4 -left-4 right-8 sm:right-12 rounded-xl border border-white/15 bg-black/60 p-4 backdrop-blur-xl shadow-xl animate-on-scroll sm:p-5"
        style={{ animation: "fadeSlideIn 1s ease-out 0.55s both" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">{badge}</p>
            <p className="font-display mt-1 text-xl font-semibold text-white sm:text-2xl">{badgeValue}</p>
          </div>
          <div className="hidden sm:flex gap-1.5">
            {[72, 85, 91].map((h, i) => (
              <div
                key={i}
                className="w-2 rounded-full bg-right-stay-400/80"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-right-stay-500 to-right-stay-300" />
        </div>
      </div>
    </div>
  );
}
