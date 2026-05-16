import dynamic from 'next/dynamic';
import Header from '@/components/sections/Header';
import HeroSection from '@/components/sections/HeroSection';

const SecondHero = dynamic(() => import('@/components/sections/SecondHero'));
const StatsSection = dynamic(() => import('@/components/sections/StatsSection'));
const ServicesSection = dynamic(() => import('@/components/sections/ServicesSection'));
const WhyChooseSection = dynamic(() => import('@/components/sections/WhyChooseSection'));
const HowItWorksSection = dynamic(() => import('@/components/sections/HowItWorksSection'));
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

export default function Home() {
  return (
    <>
      <section className="isolate h-screen overflow-hidden relative">
        <Header />
        <HeroSection />
      </section>
      <SecondHero />
      <StatsSection />
      <ServicesSection />
      <WhyChooseSection />
      <HowItWorksSection />
      <TrustSection />
      <AccommodationCards />
      <TestimonialSection />
      <CTASection />
      <Footer />
    </>
  );
}
