import Header from '@/components/sections/Header';
import HeroSection from '@/components/sections/HeroSection';
import SecondHero from '@/components/sections/SecondHero';
import StatsSection from '@/components/sections/StatsSection';
import ServicesSection from '@/components/sections/ServicesSection';
import WhyChooseSection from '@/components/sections/WhyChooseSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import TrustSection from '@/components/sections/TrustSection';
import AccommodationCards from '@/components/sections/AccommodationCards';
import TestimonialSection from '@/components/sections/TestimonialSection';
import CTASection from '@/components/sections/CTASection';
import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <>
      <section className="isolate min-h-[800px] overflow-hidden relative">
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

