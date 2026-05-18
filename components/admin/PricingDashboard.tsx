'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, DollarSign, Calendar, Search } from 'lucide-react';

interface PropertyPricing {
  propertyId: string;
  minPrice: number | null;
  basePrice: number | null;
  maxPrice: number | null;
  pricingEnabled: boolean;
  cleaningFee: number | null;
  serviceFeePercent: number | null;
  createdAt?: string;
  updatedAt?: string;
}

interface Property {
  id: string;
  uplisting_id: string;
  name: string;
  type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  currency: string;
  pricing: PropertyPricing | null;
  pricelabsMapping?: {
    pricelabsListingId: string;
    pricelabsPms: string;
    syncEnabled: boolean;
    lastSyncedAt: string | null;
    lastSyncStatus: string | null;
    lastSyncError: string | null;
  } | null;
}

export default function PricingDashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  const fetchProperties = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/properties');
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleReviewPrices = (property: Property) => {
    router.push(`/admin/pricing/${property.uplisting_id}`);
  };

  const handleToggleSync = async (property: Property) => {
    if (!property.pricing) return;
    setTogglingId(property.id);
    try {
      const response = await fetch(`/api/admin/properties?id=${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pricingEnabled: !property.pricing.pricingEnabled,
          minPrice: property.pricing.minPrice,
          basePrice: property.pricing.basePrice,
          maxPrice: property.pricing.maxPrice,
        }),
      });
      if (response.ok) {
        await fetchProperties();
      }
    } catch (error) {
      console.error('Error toggling pricing:', error);
    } finally {
      setTogglingId(null);
    }
  };

  const handleSyncPrices = async (property?: Property) => {
    if (property) {
      setSyncingId(property.id);
    } else {
      setSyncingAll(true);
    }
    try {
      const response = await fetch('/api/admin/pricing/sync-pricelabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(property ? { propertyId: property.uplisting_id } : {}),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setSyncMessage({
          type: 'error',
          text: result?.error || 'Failed to sync PriceLabs pricing.',
        });
        return;
      }

      await fetchProperties();

      if ((result?.requestedMappings || 0) === 0) {
        setSyncMessage({
          type: 'warning',
          text: 'No PriceLabs mappings found. Open each property in Property Management and add PriceLabs Listing ID + PMS first.',
        });
        return;
      }

      const errorCount = Array.isArray(result?.errors) ? result.errors.length : 0;
      setSyncMessage({
        type: errorCount > 0 ? 'warning' : 'success',
        text:
          errorCount > 0
            ? `Sync completed with issues. Synced ${result?.syncedProperties || 0}/${result?.requestedMappings || 0} mapped properties.`
            : `Sync successful. Synced ${result?.syncedProperties || 0} properties and ${result?.syncedDays || 0} day prices.`,
      });
    } catch (error) {
      console.error('Error syncing PriceLabs prices:', error);
      setSyncMessage({
        type: 'error',
        text: 'Unexpected error while syncing PriceLabs pricing.',
      });
    } finally {
      setSyncingId(null);
      setSyncingAll(false);
    }
  };

  const filteredProperties = properties.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.uplisting_id.includes(search) ||
      p.type.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (value: number | null, currency: string) => {
    if (value == null) return '—';
    const prefix = currency === 'ZAR' ? 'R' : currency;
    return `${prefix}${value.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-right-stay-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Search */}
      <div className="mb-6">
        <div className="flex justify-end mb-3">
          <button
            onClick={() => handleSyncPrices()}
            disabled={syncingAll}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium disabled:opacity-50"
          >
            {syncingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            Sync all from PriceLabs
          </button>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search listings, IDs, cities, types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500"
          />
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-4">
        Showing {filteredProperties.length}/{properties.length} listings
      </p>

      {syncMessage && (
        <div
          className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
            syncMessage.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : syncMessage.type === 'warning'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {syncMessage.text}
        </div>
      )}

      {/* Table - scroll horizontally on small screens */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Listings</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Calendar</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">PriceLabs</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Sync Price</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Min Price</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Base Price</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Max Price</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Cleaning Fee</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Service Fee %</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Currency</th>
            </tr>
          </thead>
          <tbody>
            {filteredProperties.map((property) => {
              const p = property.pricing;
              const currency = property.currency || 'ZAR';
              return (
                <tr
                  key={property.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-slate-900">{property.name}</div>
                      <div className="text-xs text-slate-500">
                        {property.bedrooms ?? '—'} BR · {property.type} · Uplisting (ID: {property.uplisting_id})
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleReviewPrices(property)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-right-stay-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Review Prices
                    </button>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600">
                    {property.pricelabsMapping ? (
                      <div className="space-y-1">
                        <div>ID {property.pricelabsMapping.pricelabsListingId}</div>
                        <div>PMS {property.pricelabsMapping.pricelabsPms}</div>
                        {property.pricelabsMapping.lastSyncedAt && (
                          <div className="text-slate-500">
                            {new Date(property.pricelabsMapping.lastSyncedAt).toLocaleString()}
                          </div>
                        )}
                        {property.pricelabsMapping.lastSyncError && (
                          <div className="text-red-300">{property.pricelabsMapping.lastSyncError}</div>
                        )}
                        <button
                          onClick={() => handleSyncPrices(property)}
                          disabled={syncingId === property.id}
                          className="mt-1 inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 disabled:opacity-50"
                        >
                          {syncingId === property.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Calendar className="w-3 h-3" />
                          )}
                          Sync now
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500">Not mapped</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {p ? (
                      <button
                        onClick={() => handleToggleSync(property)}
                        disabled={togglingId === property.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          p.pricingEnabled ? 'bg-emerald-500' : 'bg-gray-600'
                        } ${togglingId === property.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-pressed={p.pricingEnabled}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                            p.pricingEnabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    ) : (
                      <span className="text-slate-500 text-sm">Not set</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {p ? formatPrice(p.minPrice, currency) : '—'}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {p ? formatPrice(p.basePrice, currency) : '—'}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {p ? formatPrice(p.maxPrice, currency) : '—'}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {p ? formatPrice(p.cleaningFee, currency) : '—'}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {p?.serviceFeePercent != null ? `${p.serviceFeePercent.toFixed(2)}%` : '—'}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-500">{currency}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No properties found. Add properties in the Properties tab to manage pricing.</p>
        </div>
      )}
    </div>
  );
}
