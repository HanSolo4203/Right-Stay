'use client';

import { useState, useEffect } from 'react';
import { Settings, Building2, Map, Menu, X, Calendar, Link, LogOut, Loader2, User, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import SiteSettings from '@/components/admin/SiteSettings';
import PropertySettings from '@/components/admin/PropertySettings';
import TourPackageSettings from '@/components/admin/TourPackageSettings';
import BookingManagement from '@/components/admin/BookingManagement';
import PropertyMapping from '@/components/admin/PropertyMapping';
import MatrixBackground from '@/components/admin/MatrixBackground';

type TabType = 'site' | 'properties' | 'tours' | 'bookings' | 'mapping' | 'reviews';

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
      <div className="min-h-screen bg-black flex items-center justify-center relative">
        <MatrixBackground />
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin relative z-10" />
      </div>
    );
  }

  const tabs = [
    { id: 'site' as TabType, name: 'Site Settings', icon: Settings },
    { id: 'properties' as TabType, name: 'Properties', icon: Building2 },
    { id: 'tours' as TabType, name: 'Tour Packages', icon: Map },
    { id: 'bookings' as TabType, name: 'Bookings', icon: Calendar },
    { id: 'mapping' as TabType, name: 'Property Mapping', icon: Link },
    { id: 'reviews' as TabType, name: 'Import Reviews', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-black relative">
      <MatrixBackground />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-lg border-b border-gray-800/50 shadow-lg relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Branding */}
            <div className="flex items-center space-x-4 min-w-0 flex-shrink-0">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Settings className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white tracking-tight truncate">Admin Dashboard</h1>
                <p className="text-xs text-gray-400 font-medium">Right Stay Africa</p>
              </div>
            </div>

            {/* Center: Navigation - Desktop */}
            <nav className="hidden lg:flex items-center space-x-1 mx-8 flex-1 justify-center">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'bg-white/10 text-white shadow-md shadow-white/5'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right: User Profile & Actions - Desktop */}
            <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
              {/* User Profile */}
              <div className="flex items-center space-x-3 px-4 py-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all cursor-default">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-white truncate max-w-[200px]">{userEmail}</p>
                  <p className="text-xs text-gray-400 font-medium">Administrator</p>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg border border-red-500/30 transition-all duration-200 font-medium text-sm"
              >
                <LogOut className="w-4 h-4" strokeWidth={2} />
                <span>Sign Out</span>
              </button>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" strokeWidth={2} /> : <Menu className="w-6 h-6" strokeWidth={2} />}
            </button>
          </div>

          {/* Mobile navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden py-4 border-t border-gray-800/50">
              {/* Mobile Navigation Tabs */}
              <div className="space-y-1 mb-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all font-medium ${
                        activeTab === tab.id
                          ? 'bg-white/10 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={2} />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>
              
              {/* Mobile user info and sign out */}
              <div className="pt-4 border-t border-gray-800/50">
                <div className="flex items-center space-x-3 px-4 py-3 mb-3 bg-white/5 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{userEmail}</p>
                    <p className="text-xs text-gray-400 font-medium">Administrator</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg border border-red-500/30 transition-all font-medium"
                >
                  <LogOut className="w-5 h-5" strokeWidth={2} />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          {activeTab === 'site' && <SiteSettings />}
          {activeTab === 'properties' && <PropertySettings />}
          {activeTab === 'tours' && <TourPackageSettings />}
          {activeTab === 'bookings' && <BookingManagement />}
          {activeTab === 'mapping' && <PropertyMapping />}
          {activeTab === 'reviews' && (
            <div className="p-6">
              <div className="bg-white/5 rounded-lg border border-white/10 p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <h2 className="text-xl font-semibold mb-2">Import Reviews</h2>
                <p className="text-gray-400 mb-6">
                  Bulk import guest reviews from a markdown file
                </p>
                <button
                  onClick={() => router.push('/admin/reviews/import')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
                >
                  Go to Import Page
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
