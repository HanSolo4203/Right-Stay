import dynamic from 'next/dynamic';
import Header from '@/components/sections/Header';
import HostHero from '@/components/sections/HostHero';

const LogoStripSection = dynamic(() => import('@/components/sections/LogoStripSection'));
const HostWhyPartner = dynamic(() => import('@/components/sections/HostWhyPartner'));
const ChannelPartnersSection = dynamic(() => import('@/components/sections/ChannelPartnersSection'));
const HostBenefitsSection = dynamic(() => import('@/components/sections/HostBenefitsSection'));
const EarningsEstimator = dynamic(() => import('@/components/sections/EarningsEstimator'));
const HostCTASection = dynamic(() => import('@/components/sections/HostCTASection'));
const Footer = dynamic(() => import('@/components/sections/Footer'));

export default function HostWithUsPage() {
  return (
    <>
      <section className="isolate min-h-[800px] overflow-hidden relative">
        <Header />
        <HostHero />
      </section>
      <LogoStripSection />
      <HostWhyPartner />
      <ChannelPartnersSection />
      <HostBenefitsSection />
      <EarningsEstimator />
      <HostCTASection />
      <Footer />
    </>
  );
}
