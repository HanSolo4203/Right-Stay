import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | Right Stay Africa',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root min-h-screen bg-slate-50 text-slate-900 antialiased">{children}</div>;
}
