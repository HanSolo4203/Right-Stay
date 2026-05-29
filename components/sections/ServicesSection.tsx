"use client";

import Image from "next/image";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import Link from "next/link";
import { Home, Compass, TrendingUp, ArrowRight } from "lucide-react";
import PremiumContentBlock from "@/components/premium/PremiumContentBlock";

export default function ServicesSection() {
  const services = [
    {
      icon: Home,
      title: "Premium Accommodation",
      description:
        "Experience premium short-term rentals across Africa's most vibrant cities. Each property ensuring comfort, style and authentic local experiences.",
      link: "/stay-with-us",
      linkText: "Browse Properties",
      image: "/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg",
    },
    {
      icon: Compass,
      title: "Experiences",
      description:
        "Discover what Africa has to offer with our expertly managed tours. From cultural experiences to adventure excursions, we create unforgettable journeys.",
      link: "/tours",
      linkText: "Explore Tours",
      image: "/images/6d30fe29-43aa-4fc2-a513-6aa41d38a7d0_800w_1.jpg",
    },
    {
      icon: TrendingUp,
      title: "Asset Management",
      description:
        "Comprehensive management covering bookings, cleaning, maintenance and reporting delivered with complete transparency and zero oversight gaps.",
      link: "/host-with-us",
      linkText: "Learn More",
      image: "/images/d953ad7f-2dd7-42f7-8f74-593d55181036_800w_1.jpg",
    },
  ];

  return (
    <PremiumContentBlock
      eyebrow="What We Offer"
      title="Three Ways to Experience Africa, Done Right"
      subtitle="From premium stays to curated experiences and full asset management — end-to-end solutions from one trusted partner."
      centered
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        {services.map((service, index) => (
          <article
            key={service.title}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-right-stay-400/25 animate-on-scroll"
            style={{ animation: `fadeSlideIn 0.9s ease-out ${0.2 + index * 0.1}s both` }}
          >
            <div className="relative h-56 overflow-hidden sm:h-64">
              <Image
                src={service.image}
                alt={service.title}
                fill
                sizes={IMAGE_SIZES.gridThird}
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1210] via-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md">
                <service.icon className="h-5 w-5 text-white" strokeWidth={1.5} />
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <h3 className="font-display text-xl font-semibold text-white sm:text-2xl">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60 sm:text-base">
                {service.description}
              </p>
              <Link
                href={service.link}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-right-stay-300 transition-all duration-200 hover:gap-3 hover:text-right-stay-200"
              >
                {service.linkText}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div
        className="mt-12 text-center animate-on-scroll"
        style={{ animation: "fadeSlideIn 0.9s ease-out 0.5s both" }}
      >
        <p className="text-white/55 text-base sm:text-lg">
          Can&apos;t find what you&apos;re looking for? We&apos;re here to help create your perfect
          experience.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-right-stay-400/40 hover:bg-white/10"
        >
          Get in Touch
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </PremiumContentBlock>
  );
}
