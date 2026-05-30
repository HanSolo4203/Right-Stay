"use client";

import Image from "next/image";
import PremiumSectionBackground from "@/components/premium/PremiumSectionBackground";

type PartnerLogo = {
  name: string;
  src: string;
  width: number;
  height: number;
  imageClassName?: string;
};

const PLATFORM_LOGOS: PartnerLogo[] = [
  { name: "Airbnb", src: "/partners/Airbnb_Logo.png", width: 128, height: 40 },
  { name: "Booking.com", src: "/partners/booking-com.svg", width: 160, height: 28 },
  { name: "Expedia", src: "/partners/expedia.svg", width: 140, height: 40 },
  {
    name: "Right Stay Direct",
    src: "/partners/right-stay-direct.svg",
    width: 240,
    height: 48,
  },
];

function PartnerLogoImage({ logo, className }: { logo: PartnerLogo; className?: string }) {
  return (
    <Image
      src={logo.src}
      alt={logo.name}
      width={logo.width}
      height={logo.height}
      className={[className, logo.imageClassName].filter(Boolean).join(" ")}
      style={{ width: "auto", height: "100%", maxWidth: "100%" }}
    />
  );
}

export default function LogoStripSection() {
  return (
    <PremiumSectionBackground className="!pt-[calc(var(--premium-hero-overlap)+2rem)] !pb-14 sm:!pt-[calc(var(--premium-hero-overlap)+2.5rem)] sm:!pb-16">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center mb-10">
          <p
            className="animate-on-scroll text-xs font-medium uppercase tracking-[0.28em] text-right-stay-400/90"
            style={{ animation: "fadeSlideIn 0.8s ease-out 0.05s both" }}
          >
            API Connected
          </p>
          <h2
            className="animate-on-scroll mt-3 font-display text-2xl font-medium tracking-tight text-white sm:text-3xl lg:text-4xl"
            style={{ animation: "fadeSlideIn 0.9s ease-out 0.12s both" }}
          >
            Connected to the World&apos;s Leading Booking Platforms
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 items-center justify-items-center md:grid-cols-4">
          {PLATFORM_LOGOS.map((logo, index) => (
            <div
              key={logo.name}
              className="flex h-10 sm:h-12 w-full max-w-[200px] items-center justify-center opacity-90 transition-opacity duration-300 hover:opacity-100 animate-on-scroll"
              style={{ animation: `fadeSlideIn 0.8s ease-out ${0.2 + index * 0.08}s both` }}
            >
              <PartnerLogoImage
                logo={logo}
                className="object-contain object-center h-8 sm:h-10 w-full"
              />
            </div>
          ))}
        </div>
      </div>
    </PremiumSectionBackground>
  );
}
