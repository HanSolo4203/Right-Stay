import Header from '@/components/sections/Header';
import { isToursEnabled } from '@/lib/public-site-settings';

export default async function SiteHeader() {
  const toursEnabled = await isToursEnabled();
  return <Header toursEnabled={toursEnabled} />;
}
