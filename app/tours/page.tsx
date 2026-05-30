import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Header from "@/components/sections/Header";
import ToursHero from "@/components/sections/ToursHero";
import PremiumBackgroundProvider from "@/components/premium/PremiumBackgroundProvider";
import PremiumPageBackdrop from "@/components/premium/PremiumPageBackdrop";
import Footer from "@/components/sections/Footer";

const ToursWhySection = dynamic(() => import("@/components/sections/ToursWhySection"));
const ToursExperiencesSection = dynamic(
  () => import("@/components/sections/ToursExperiencesSection"),
);
const ToursDestinationsSection = dynamic(
  () => import("@/components/sections/ToursDestinationsSection"),
);
const ToursProcessSection = dynamic(() => import("@/components/sections/ToursProcessSection"));
const ToursTestimonialSection = dynamic(
  () => import("@/components/sections/ToursTestimonialSection"),
);
const ToursCTASection = dynamic(() => import("@/components/sections/ToursCTASection"));

export const metadata: Metadata = {
  title: "Tours & Experiences — Right Stay Africa",
  description:
    "Discover curated African experiences — safaris, cultural encounters, wine tours and bespoke journeys designed to create unforgettable memories.",
};

export default function ToursPage() {
  return (
    <>
      <section className="isolate relative z-[1] min-h-[720px] overflow-x-hidden overflow-y-visible">
        <Header />
        <ToursHero />
      </section>

      <PremiumPageBackdrop />
      <PremiumBackgroundProvider className="premium-content-stack">
        <ToursWhySection />
        <ToursExperiencesSection />
        <ToursDestinationsSection />
        <ToursProcessSection />
        <ToursTestimonialSection />
        <ToursCTASection />
      </PremiumBackgroundProvider>

      <Footer />
    </>
  );
}
