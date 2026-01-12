import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import HostHero from '@/components/sections/HostHero';
import LogoStripSection from '@/components/sections/LogoStripSection';
import HostWhyPartner from '@/components/sections/HostWhyPartner';
import ChannelPartnersSection from '@/components/sections/ChannelPartnersSection';
import HostBenefitsSection from '@/components/sections/HostBenefitsSection';
import EarningsEstimator from '@/components/sections/EarningsEstimator';
import HostCTASection from '@/components/sections/HostCTASection';

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
