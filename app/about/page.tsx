import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Header from "@/components/sections/Header";
import AboutHero from "@/components/sections/AboutHero";
import PremiumBackgroundProvider from "@/components/premium/PremiumBackgroundProvider";
import PremiumPageBackdrop from "@/components/premium/PremiumPageBackdrop";
import Footer from "@/components/sections/Footer";

const AboutStorySection = dynamic(() => import("@/components/sections/AboutStorySection"));
const AboutDifferentSection = dynamic(() => import("@/components/sections/AboutDifferentSection"));
const AboutPhilosophySection = dynamic(() => import("@/components/sections/AboutPhilosophySection"));
const AboutTodaySection = dynamic(() => import("@/components/sections/AboutTodaySection"));
const AboutCTASection = dynamic(() => import("@/components/sections/AboutCTASection"));

export const metadata: Metadata = {
  title: "About Us — Right Stay Africa",
  description:
    "Discover the founder story behind Right Stay Africa — premium hospitality, transparent asset management and exceptional guest experiences across the continent.",
};

export default function AboutPage() {
  return (
    <>
      <section className="isolate relative z-[1] min-h-[720px] overflow-x-hidden overflow-y-visible">
        <Header />
        <AboutHero />
      </section>

      <PremiumPageBackdrop />
      <PremiumBackgroundProvider className="premium-content-stack">
        <AboutStorySection />
        <AboutDifferentSection />
        <AboutPhilosophySection />
        <AboutTodaySection />
        <AboutCTASection />
      </PremiumBackgroundProvider>

      <Footer />
    </>
  );
}
