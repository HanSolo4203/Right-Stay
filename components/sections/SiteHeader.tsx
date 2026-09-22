import Header from '@/components/sections/Header';
import { isGuideEnabled, isToursEnabled } from '@/lib/public-site-settings';

export default async function SiteHeader() {
  const [toursEnabled, guideEnabled] = await Promise.all([
    isToursEnabled(),
    isGuideEnabled(),
  ]);
  return <Header toursEnabled={toursEnabled} guideEnabled={guideEnabled} />;
}
