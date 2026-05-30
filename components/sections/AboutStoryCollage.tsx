"use client";

import Image from "next/image";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { MARKETING_IMAGES } from "@/lib/marketing-images";

const COLLAGE_IMAGES = [
  {
    src: MARKETING_IMAGES.coastalVilla,
    alt: "Premium accommodation interior",
    label: "Premium Stays",
    className: "col-span-1 row-span-2",
  },
  {
    src: MARKETING_IMAGES.wineEstate,
    alt: "Luxury property management",
    label: "Asset Care",
    className: "col-span-1 row-span-1",
  },
  {
    src: MARKETING_IMAGES.safariLodge,
    alt: "African destination experience",
    label: "Destinations",
    className: "col-span-1 row-span-1",
  },
  {
    src: MARKETING_IMAGES.gardenRoute,
    alt: "Unforgettable guest experiences",
    label: "Experiences",
    className: "col-span-2 row-span-1",
  },
];

export default function AboutStoryCollage() {
  return (
    <div
      className="relative h-[480px] animate-on-scroll sm:h-[540px] lg:h-[620px]"
      style={{ animation: "fadeSlideIn 1s ease-out 0.25s both" }}
    >
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-right-stay-500/20 via-transparent to-right-stay-400/10 md:blur-2xl" />

      <div className="relative grid h-full grid-cols-2 grid-rows-[1fr_1fr_0.75fr] gap-2.5 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40 sm:gap-3">
        {COLLAGE_IMAGES.map((img) => (
          <div key={img.src} className={`group relative overflow-hidden ${img.className}`}>
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes={img.className.includes("col-span-2") ? IMAGE_SIZES.half : "280px"}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm sm:bottom-4 sm:left-4 sm:text-xs">
              {img.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
