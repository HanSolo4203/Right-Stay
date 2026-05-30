import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email preview (dev)',
  robots: { index: false, follow: false },
};

export default function DevEmailPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
