import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Favicon preview (dev)',
  robots: { index: false, follow: false },
};

export default function FaviconPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
