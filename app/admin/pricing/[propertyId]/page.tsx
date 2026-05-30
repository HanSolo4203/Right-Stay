'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  ArrowLeft,
  Save,
  Info,
  Eye,
  Settings,
  X,
} from 'lucide-react';

interface Property {
  id: string;
  uplisting_id: string;
  name: string;
  type: string;
  bedrooms: number | null;
  currency: string;
}

interface CalendarData {
  pricing: {
    minPrice: number | null;
    basePrice: number | null;
    maxPrice: number | null;
    pricingEnabled: boolean;
    updatedAt: string | null;
  };
  dailyPrices: Record<string, number>;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function PricingCalendarPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.propertyId as string;

  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [property, setProperty] = useState<Property | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [minPrice, setMinPrice] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [priceSyncEnabled, setPriceSyncEnabled] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);
  const [customOverridesExpanded, setCustomOverridesExpanded] = useState(false);

  const [editModal, setEditModal] = useState<{ date: string; price: number } | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [savingDaily, setSavingDaily] = useState(false);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        router.push('/admin/login');
      } else {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, [router]);

  const fetchProperties = useCallback(async () => {
    const res = await fetch('/api/admin/properties');
    if (res.ok) {
      const data = await res.json();
      setProperties(data);
      const current = data.find((p: Property) => p.uplisting_id === propertyId);
      setProperty(current || null);
    }
  }, [propertyId]);

  const fetchCalendarData = useCallback(async () => {
    if (!propertyId) return;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const res = await fetch(
      `/api/admin/pricing/calendar?propertyId=${propertyId}&year=${year}&month=${month}`
    );
    if (res.ok) {
      const data = await res.json();
      setCalendarData(data);
      if (data.pricing) {
        setMinPrice(data.pricing.minPrice != null ? String(data.pricing.minPrice) : '');
        setBasePrice(data.pricing.basePrice != null ? String(data.pricing.basePrice) : '');
        setMaxPrice(data.pricing.maxPrice != null ? String(data.pricing.maxPrice) : '');
        setPriceSyncEnabled(!!data.pricing.pricingEnabled);
      }
    }
  }, [propertyId, currentMonth]);

  useEffect(() => {
    if (!authChecked || !propertyId) return;
    const load = async () => {
      setLoading(true);
      await fetchProperties();
      await fetchCalendarData();
      setLoading(false);
    };
    load();
  }, [authChecked, propertyId, fetchProperties, fetchCalendarData]);

  const handleSavePricing = async (pricingEnabledOverride?: boolean) => {
    if (!property) return;
    setSavingPricing(true);
    try {
      const enabled = pricingEnabledOverride ?? priceSyncEnabled;
      const res = await fetch(`/api/admin/properties?id=${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minPrice: minPrice ? parseFloat(minPrice) : null,
          basePrice: basePrice ? parseFloat(basePrice) : null,
          maxPrice: maxPrice ? parseFloat(maxPrice) : null,
          pricingEnabled: enabled,
        }),
      });
      if (res.ok) {
        setPriceSyncEnabled(enabled);
        await fetchCalendarData();
      }
    } finally {
      setSavingPricing(false);
    }
  };

  const getPriceForDate = (dateStr: string): number => {
    if (!calendarData) return 0;
    const custom = calendarData.dailyPrices[dateStr];
    if (custom != null) return custom;
    const base = calendarData.pricing?.basePrice;
    return base != null ? base : 1500;
  };

  const getCellColor = (price: number): string => {
    const base = calendarData?.pricing?.basePrice ?? 1500;
    const min = calendarData?.pricing?.minPrice ?? base * 0.7;
    const max = calendarData?.pricing?.maxPrice ?? base * 1.5;
    const range = max - min || 1;
    const pct = (price - min) / range;
    if (pct >= 0.8) return 'bg-emerald-500/30 text-emerald-100';
    if (pct >= 0.4) return 'bg-yellow-500/30 text-yellow-100';
    return 'bg-orange-500/30 text-orange-100';
  };

  const openEditModal = (dateStr: string) => {
    const price = getPriceForDate(dateStr);
    setEditModal({ date: dateStr, price });
    setEditPrice(String(price));
  };

  const handleSaveDailyPrice = async () => {
    if (!editModal || !propertyId) return;
    const price = parseFloat(editPrice);
    if (isNaN(price) || price < 0) return;
    setSavingDaily(true);
    try {
      const res = await fetch('/api/admin/pricing/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, date: editModal.date, price }),
      });
      if (res.ok) {
        await fetchCalendarData();
        setEditModal(null);
      }
    } finally {
      setSavingDaily(false);
    }
  };

  const handleClearCustom = async () => {
    if (!editModal || !propertyId) return;
    setSavingDaily(true);
    try {
      const res = await fetch(
        `/api/admin/pricing/daily?propertyId=${propertyId}&date=${editModal.date}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        await fetchCalendarData();
        setEditModal(null);
      }
    } finally {
      setSavingDaily(false);
    }
  };

  const customDates = calendarData?.dailyPrices
    ? Object.entries(calendarData.dailyPrices)
        .map(([date, price]) => ({ date, price }))
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const firstDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-right-stay-500 animate-spin" />
      </div>
    );
  }

  const currencyPrefix = property?.currency === 'ZAR' ? 'R' : property?.currency || 'R';

  return (
    <div className="min-h-screen bg-slate-50 text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Admin
          </button>
          <h1 className="text-lg font-semibold">Dynamic Pricing</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-[1800px] mx-auto">
        {/* Left Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">
                {property?.name || 'Loading...'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-sm text-slate-500">
              {property?.bedrooms ?? '—'} Bedroom · {property?.type || '—'} · Uplisting (ID: {propertyId})
            </p>

            {/* Unit selector */}
            <select
              value={propertyId}
              onChange={(e) => router.push(`/admin/pricing/${e.target.value}`)}
              className="mt-3 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.uplisting_id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Configure Prices */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              Configure Prices
              <Info className="w-4 h-4 text-slate-500" />
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Minimum</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="988"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Base</label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="1288"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Maximum</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="2488"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">All prices in {property?.currency || 'ZAR'}</p>
            <button
              onClick={() => void handleSavePricing()}
              disabled={savingPricing}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-medium disabled:opacity-50"
            >
              {savingPricing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save & Refresh
            </button>
            {calendarData?.pricing?.updatedAt && (
              <p className="text-xs text-slate-500 mt-2">
                Last refreshed {new Date(calendarData.pricing.updatedAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Applied Customizations */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setCustomOverridesExpanded(!customOverridesExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
            >
              <span className="font-medium">
                ▸ Applied Customizations
              </span>
              <span className="text-sm text-slate-500">Edit</span>
            </button>
            {customOverridesExpanded && (
              <div className="border-t border-slate-200 p-4 max-h-48 overflow-y-auto">
                {customDates.length === 0 ? (
                  <p className="text-sm text-slate-500">No custom prices set</p>
                ) : (
                  <ul className="space-y-2">
                    {customDates.map(({ date, price }) => (
                      <li
                        key={date}
                        className="flex justify-between text-sm"
                      >
                        <span>{new Date(date).toLocaleDateString()}</span>
                        <span>{currencyPrefix}{price.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center Calendar */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 rounded-lg hover:bg-slate-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold min-w-[140px] text-center">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 rounded-lg hover:bg-slate-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="text-sm text-right-stay-600 hover:text-blue-300"
            >
              Today
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-slate-500 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay(currentMonth) }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth(currentMonth) }).map((_, i) => {
              const day = i + 1;
              const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const dateStr = formatDate(d);
              const price = getPriceForDate(dateStr);
              const isCustom = !!calendarData?.dailyPrices[dateStr];
              return (
                <button
                  key={dateStr}
                  onClick={() => openEditModal(dateStr)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-colors hover:ring-2 hover:ring-blue-500 ${getCellColor(price)}`}
                >
                  <span>{day}</span>
                  <span className="font-semibold">{Math.round(price)}</span>
                  {isCustom && <span className="text-[10px] opacity-80">custom</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Enable Price Sync</span>
              <button
                onClick={() => void handleSavePricing(!priceSyncEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  priceSyncEnabled ? 'bg-emerald-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    priceSyncEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {calendarData?.pricing?.updatedAt && (
              <p className="text-xs text-slate-500 mt-2">Last synced {new Date(calendarData.pricing.updatedAt).toLocaleString()}</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Date Overrides
              </span>
              <Settings className="w-4 h-4 text-slate-500" />
            </div>
            <div className="border-t border-slate-200 p-4">
              <p className="text-sm text-slate-500">{customDates.length} custom price(s) set</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white rounded-xl border border-slate-200 p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">
                Set price for {new Date(editModal.date).toLocaleDateString()}
              </h3>
              <button
                onClick={() => setEditModal(null)}
                className="p-1 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 mb-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500"
              placeholder="Price"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveDailyPrice}
                disabled={savingDaily}
                className="flex-1 py-2 bg-right-stay-500 hover:bg-right-stay-600 rounded-lg font-medium disabled:opacity-50"
              >
                {savingDaily ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}
              </button>
              <button
                onClick={handleClearCustom}
                disabled={savingDaily || !calendarData?.dailyPrices[editModal.date]}
                className="py-2 px-4 border border-white/20 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear custom
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
