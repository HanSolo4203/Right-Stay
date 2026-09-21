import dynamic from 'next/dynamic';
import SiteHeader from '@/components/sections/SiteHeader';
import HostHero from '@/components/sections/HostHero';
import PremiumBackgroundProvider from '@/components/premium/PremiumBackgroundProvider';
import PremiumPageBackdrop from '@/components/premium/PremiumPageBackdrop';

const LogoStripSection = dynamic(() => import('@/components/sections/LogoStripSection'));
const HostWhyPartner = dynamic(() => import('@/components/sections/HostWhyPartner'));
const HostAssetServicesSection = dynamic(() => import('@/components/sections/HostAssetServicesSection'));
const ChannelPartnersSection = dynamic(() => import('@/components/sections/ChannelPartnersSection'));
const HostBenefitsSection = dynamic(() => import('@/components/sections/HostBenefitsSection'));
const HostCTASection = dynamic(() => import('@/components/sections/HostCTASection'));
const Footer = dynamic(() => import('@/components/sections/Footer'));

export default function HostWithUsPage() {
  return (
    <>
      <section className="isolate relative z-[1] min-h-svh overflow-x-clip">
        <SiteHeader />
        <HostHero />
      </section>
      <PremiumPageBackdrop />
      <PremiumBackgroundProvider className="premium-content-stack">
        <LogoStripSection />
        <HostWhyPartner />
        <HostAssetServicesSection />
        <ChannelPartnersSection />
        <HostBenefitsSection />
        <HostCTASection />
      </PremiumBackgroundProvider>
      <Footer />
    </>
  );
}
