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
}

export default function PricingDashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

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
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Dynamic Pricing</h2>
        <p className="text-gray-400">
          Review and manage nightly pricing for each property. Click Review Prices to open the calendar.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search listings, IDs, cities, types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Showing {filteredProperties.length}/{properties.length} listings
      </p>

      {/* Table - scroll horizontally on small screens */}
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Listings</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Calendar</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Sync Price</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Min Price</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Base Price</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Max Price</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Currency</th>
            </tr>
          </thead>
          <tbody>
            {filteredProperties.map((property) => {
              const p = property.pricing;
              const currency = property.currency || 'ZAR';
              return (
                <tr
                  key={property.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-white">{property.name}</div>
                      <div className="text-xs text-gray-400">
                        {property.bedrooms ?? '—'} BR · {property.type} · Uplisting (ID: {property.uplisting_id})
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleReviewPrices(property)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Review Prices
                    </button>
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
                      <span className="text-gray-500 text-sm">Not set</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {p ? formatPrice(p.minPrice, currency) : '—'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {p ? formatPrice(p.basePrice, currency) : '—'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {p ? formatPrice(p.maxPrice, currency) : '—'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">{currency}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No properties found. Add properties in the Properties tab to manage pricing.</p>
        </div>
      )}
    </div>
  );
}
