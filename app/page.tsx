import dynamic from 'next/dynamic';
import Header from '@/components/sections/Header';
import HeroSection from '@/components/sections/HeroSection';
import PremiumBackgroundProvider from '@/components/premium/PremiumBackgroundProvider';
import PremiumPageBackdrop from '@/components/premium/PremiumPageBackdrop';
import { getCachedProperties, getCachedPropertyLocations } from '@/lib/properties-data';

const SecondHero = dynamic(() => import('@/components/sections/SecondHero'));
const ServicesSection = dynamic(() => import('@/components/sections/ServicesSection'));
const WhyChooseSection = dynamic(() => import('@/components/sections/WhyChooseSection'));
const TrustSection = dynamic(() => import('@/components/sections/TrustSection'));
const AccommodationCards = dynamic(
  () => import('@/components/sections/AccommodationCards'),
  {
    loading: () => (
      <div className="py-16 text-center text-white/70">Loading accommodations…</div>
    ),
  }
);
const TestimonialSection = dynamic(() => import('@/components/sections/TestimonialSection'));
const CTASection = dynamic(() => import('@/components/sections/CTASection'));
const Footer = dynamic(() => import('@/components/sections/Footer'));

export default async function Home() {
  const [initialLocations, initialProperties] = await Promise.all([
    getCachedPropertyLocations(),
    getCachedProperties(),
  ]);

  return (
    <>
      <section className="isolate relative z-[1] min-h-screen overflow-x-hidden overflow-y-visible">
        <Header />
        <HeroSection initialLocations={initialLocations} />
      </section>
      <PremiumPageBackdrop />
      <PremiumBackgroundProvider className="premium-content-stack">
        <SecondHero />
        <ServicesSection />
        <WhyChooseSection />
        <TrustSection />
        <AccommodationCards initialProperties={initialProperties} />
        <TestimonialSection />
        <CTASection />
      </PremiumBackgroundProvider>
      <div className="relative z-[1]">
        <Footer />
      </div>
    </>
  );
}
