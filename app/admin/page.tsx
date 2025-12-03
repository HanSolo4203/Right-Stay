'use client';

import { useState, useEffect } from 'react';
import { Settings, Building2, Map, Menu, X, Calendar, Link, LogOut, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import SiteSettings from '@/components/admin/SiteSettings';
import PropertySettings from '@/components/admin/PropertySettings';
import TourPackageSettings from '@/components/admin/TourPackageSettings';
import BookingManagement from '@/components/admin/BookingManagement';
import PropertyMapping from '@/components/admin/PropertyMapping';

type TabType = 'site' | 'properties' | 'tours' | 'bookings' | 'mapping';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('site');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          setLoading(false);
          router.push('/admin/login');
          return;
        }
        
        if (!session) {
          router.push('/admin/login');
        } else {
          setUserEmail(session.user.email || null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setLoading(false);
        router.push('/admin/login');
      }
    };

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth check timeout, redirecting to login');
        setLoading(false);
        router.push('/admin/login');
      }
    }, 5000);

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/admin/login');
      } else if (session) {
        setUserEmail(session.user.email || null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [router, loading]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'site' as TabType, name: 'Site Settings', icon: Settings },
    { id: 'properties' as TabType, name: 'Properties', icon: Building2 },
    { id: 'tours' as TabType, name: 'Tour Packages', icon: Map },
    { id: 'bookings' as TabType, name: 'Bookings', icon: Calendar },
    { id: 'mapping' as TabType, name: 'Property Mapping', icon: Link },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-xs text-gray-400">Right Stay Africa</p>
              </div>
            </div>

            {/* User info and sign out - Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-white">{userEmail}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Mobile navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden py-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-2 w-full px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
              
              {/* Mobile user info and sign out */}
              <div className="pt-4 border-t border-white/10">
                <div className="px-4 py-2 mb-2">
                  <p className="text-sm text-white">{userEmail}</p>
                  <p className="text-xs text-gray-400">Administrator</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          {activeTab === 'site' && <SiteSettings />}
          {activeTab === 'properties' && <PropertySettings />}
          {activeTab === 'tours' && <TourPackageSettings />}
          {activeTab === 'bookings' && <BookingManagement />}
          {activeTab === 'mapping' && <PropertyMapping />}
        </div>
      </main>
    </div>
  );
}

