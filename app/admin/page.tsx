'use client';

import { useState, useEffect, useRef, Suspense, type ComponentType, type ReactElement } from 'react';
import dynamic from 'next/dynamic';
import {
  Settings,
  Building2,
  Map,
  Menu,
  X,
  Calendar,
  Inbox,
  Link,
  LogOut,
  Loader2,
  User,
  MessageSquare,
  DollarSign,
  Mail,
  PanelLeft,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  SiteSettingsSkeleton,
  PropertySettingsSkeleton,
  PricingDashboardSkeleton,
  TourPackageSettingsSkeleton,
  BookingManagementSkeleton,
  BookingRequestManagementSkeleton,
  ContactSubmissionManagementSkeleton,
  PropertyMappingSkeleton,
} from '@/components/admin/AdminTabSkeletons';

const dynamicTab = (
  loader: () => Promise<{ default: ComponentType }>,
  loading: () => ReactElement
) => dynamic(loader, { loading, ssr: false });

const SiteSettings = dynamicTab(
  () => import('@/components/admin/SiteSettings'),
  SiteSettingsSkeleton
);
const PropertySettings = dynamicTab(
  () => import('@/components/admin/PropertySettings'),
  PropertySettingsSkeleton
);
const PricingDashboard = dynamicTab(
  () => import('@/components/admin/PricingDashboard'),
  PricingDashboardSkeleton
);
const TourPackageSettings = dynamicTab(
  () => import('@/components/admin/TourPackageSettings'),
  TourPackageSettingsSkeleton
);
const BookingManagement = dynamicTab(
  () => import('@/components/admin/BookingManagement'),
  BookingManagementSkeleton
);
const BookingRequestManagement = dynamicTab(
  () => import('@/components/admin/BookingRequestManagement'),
  BookingRequestManagementSkeleton
);
const ContactSubmissionManagement = dynamicTab(
  () => import('@/components/admin/ContactSubmissionManagement'),
  ContactSubmissionManagementSkeleton
);
const PropertyMapping = dynamicTab(
  () => import('@/components/admin/PropertyMapping'),
  PropertyMappingSkeleton
);

type TabType =
  | 'site'
  | 'properties'
  | 'pricing'
  | 'tours'
  | 'bookings'
  | 'booking-requests'
  | 'contact-submissions'
  | 'mapping'
  | 'reviews';

const VALID_TABS: TabType[] = [
  'site',
  'properties',
  'pricing',
  'tours',
  'bookings',
  'booking-requests',
  'contact-submissions',
  'mapping',
  'reviews',
];

const TAB_META: Record<TabType, { title: string; description: string }> = {
  site: {
    title: 'Site Settings',
    description: 'Manage your website’s global configuration',
  },
  properties: {
    title: 'Properties',
    description: 'Manage listings, photos, and property details',
  },
  pricing: {
    title: 'Dynamic Pricing',
    description: 'Configure rates and pricing rules per property',
  },
  tours: {
    title: 'Tour Packages',
    description: 'Create and edit tour offerings',
  },
  bookings: {
    title: 'Bookings',
    description: 'View and manage all property bookings',
  },
  'booking-requests': {
    title: 'Booking Requests',
    description: 'Review and respond to pending direct website booking requests',
  },
  'contact-submissions': {
    title: 'Contact Enquiries',
    description: 'View Get In Touch form submissions and property listing requests',
  },
  mapping: {
    title: 'Property Mapping',
    description: 'Link Uplisting properties to apartments',
  },
  reviews: {
    title: 'Import Reviews',
    description: 'Bulk import guest reviews from a markdown file',
  },
};

function parseTab(value: string | null): TabType {
  if (value && VALID_TABS.includes(value as TabType)) {
    return value as TabType;
  }
  return 'site';
}

function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>(() => parseTab(searchParams.get('tab')));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const finishLoading = () => {
    loadingRef.current = false;
    setLoading(false);
  };

  useEffect(() => {
    setActiveTab(parseTab(searchParams.get('tab')));
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    router.replace(`/admin?tab=${tab}`, { scroll: false });
    setMobileNavOpen(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth error:', error);
          finishLoading();
          router.push('/admin/login');
          return;
        }

        if (!session) {
          router.push('/admin/login');
        } else {
          setUserEmail(session.user.email || null);
          finishLoading();
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        finishLoading();
        router.push('/admin/login');
      }
    };

    const timeout = setTimeout(() => {
      if (loadingRef.current) {
        console.warn('Auth check timeout, redirecting to login');
        finishLoading();
        router.push('/admin/login');
      }
    }, 5000);

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/admin/login');
      } else if (session) {
        setUserEmail(session.user.email || null);
        finishLoading();
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-right-stay-500 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'site' as TabType, name: 'Site Settings', shortName: 'Site', icon: Settings },
    { id: 'properties' as TabType, name: 'Properties', shortName: 'Properties', icon: Building2 },
    { id: 'pricing' as TabType, name: 'Dynamic Pricing', shortName: 'Pricing', icon: DollarSign },
    { id: 'tours' as TabType, name: 'Tour Packages', shortName: 'Tours', icon: Map },
    { id: 'bookings' as TabType, name: 'Bookings', shortName: 'Bookings', icon: Calendar },
    {
      id: 'booking-requests' as TabType,
      name: 'Booking Requests',
      shortName: 'Requests',
      icon: Inbox,
    },
    {
      id: 'contact-submissions' as TabType,
      name: 'Contact Enquiries',
      shortName: 'Contact',
      icon: Mail,
    },
    { id: 'mapping' as TabType, name: 'Property Mapping', shortName: 'Mapping', icon: Link },
    { id: 'reviews' as TabType, name: 'Import Reviews', shortName: 'Reviews', icon: MessageSquare },
  ];

  const meta = TAB_META[activeTab];

  const NavButton = ({
    tab,
    compact = false,
  }: {
    tab: (typeof tabs)[0];
    compact?: boolean;
  }) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    return (
      <button
        type="button"
        onClick={() => handleTabChange(tab.id)}
        className={cn(
          'flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-right-stay-50 text-right-stay-700 border border-right-stay-200'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent',
          compact && 'flex-col gap-1 px-2 py-2 text-[10px] leading-tight min-w-0 flex-1'
        )}
      >
        <Icon className={cn('shrink-0', compact ? 'w-5 h-5' : 'w-4 h-4')} strokeWidth={2} />
        <span className={cn(compact ? 'truncate w-full text-center' : 'truncate')}>
          {compact ? tab.shortName : tab.name}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col border-r border-slate-200 bg-white shadow-sm">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5 bg-gradient-to-r from-right-stay-50 to-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-right-stay-500 text-white font-bold text-sm shadow-sm shadow-right-stay-500/30">
            RS
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">Right Stay Africa</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {tabs.map((tab) => (
            <NavButton key={tab.id} tab={tab} />
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5 border border-slate-100">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-right-stay-100 text-right-stay-700">
              <User className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 truncate">{userEmail}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile slide-out */}
      {mobileNavOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-50 bg-slate-900/40 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(100%,20rem)] flex-col bg-white shadow-xl lg:hidden">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 bg-gradient-to-r from-right-stay-50 to-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-right-stay-500 text-white font-bold text-sm shadow-sm">
                  RS
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Right Stay Africa</p>
                  <p className="text-xs text-slate-500">Admin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {tabs.map((tab) => (
                <NavButton key={tab.id} tab={tab} />
              ))}
            </nav>
            <div className="border-t border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-right-stay-100 text-right-stay-700">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{userEmail}</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 text-sm font-medium text-red-700"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </aside>
        </>
      )}

      <div className="lg:pl-64 flex flex-col min-h-screen pb-[4.5rem] lg:pb-0">
        {/* Sticky header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-slate-900 truncate">{meta.title}</h1>
                <p className="text-xs text-slate-500 hidden sm:block truncate">{meta.description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 lg:hidden"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {activeTab === 'site' && <SiteSettings />}
            {activeTab === 'properties' && <PropertySettings />}
            {activeTab === 'pricing' && <PricingDashboard />}
            {activeTab === 'tours' && <TourPackageSettings />}
            {activeTab === 'bookings' && <BookingManagement />}
            {activeTab === 'booking-requests' && <BookingRequestManagement />}
            {activeTab === 'contact-submissions' && <ContactSubmissionManagement />}
            {activeTab === 'mapping' && <PropertyMapping />}
            {activeTab === 'reviews' && (
              <div className="p-6 lg:p-8">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center max-w-lg mx-auto">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-right-stay-100">
                    <MessageSquare className="w-7 h-7 text-right-stay-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Import Reviews</h2>
                  <p className="text-slate-500 mb-6 text-sm">
                    Bulk import guest reviews from a markdown file
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push('/admin/reviews/import')}
                    className="inline-flex items-center justify-center px-6 py-3 bg-right-stay-500 hover:bg-right-stay-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Go to Import Page
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md safe-area-pb"
        aria-label="Primary"
      >
        <div className="flex items-stretch justify-between gap-0.5 px-1 py-1.5 max-w-lg mx-auto sm:max-w-none">
          {tabs.slice(0, 5).map((tab) => (
            <NavButton key={tab.id} tab={tab} compact />
          ))}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 flex-1 min-w-0 rounded-lg px-2 py-2 text-[10px] font-medium transition-colors',
              ['booking-requests', 'contact-submissions', 'mapping', 'reviews'].includes(activeTab)
                ? 'text-right-stay-700 bg-right-stay-50'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <PanelLeft className="w-5 h-5 shrink-0" />
            <span className="truncate w-full text-center">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 text-right-stay-500 animate-spin" />
        </div>
      }
    >
      <AdminDashboard />
    </Suspense>
  );
}
