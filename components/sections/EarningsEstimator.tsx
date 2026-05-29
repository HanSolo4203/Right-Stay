"use client";

import { useState } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Calculator, TrendingUp, ChevronDown } from 'lucide-react';
import PremiumSectionBackground from '@/components/premium/PremiumSectionBackground';

type Currency = {
  code: string;
  name: string;
  flag: string;
  locale: string;
};

const currencies: Currency[] = [
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', locale: 'en-ZA' },
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', locale: 'de-DE' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', locale: 'en-GB' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', locale: 'en-AU' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', locale: 'en-CA' },
];

export default function EarningsEstimator() {
  useScrollAnimation();

  const [currency, setCurrency] = useState<Currency>(currencies[0]); // Default to ZAR
  const [adr, setAdr] = useState<number>(150);
  const [occupancy, setOccupancy] = useState<number>(65);
  const [avgLengthOfStay, setAvgLengthOfStay] = useState<number>(3);
  const [cleaningFee, setCleaningFee] = useState<number>(50);
  const managementFee = 20; // Fixed at 20%
  const [maintenanceBuffer, setMaintenanceBuffer] = useState<number>(0);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState<boolean>(false);

  const calculateEarnings = () => {
    const bookedNights = Math.round(30 * (occupancy / 100));
    const estimatedStays = Math.round(bookedNights / avgLengthOfStay);
    const grossRevenue = bookedNights * adr;
    const cleaningCosts = estimatedStays * cleaningFee;
    const managementFeeAmount = grossRevenue * (managementFee / 100);
    const estimatedNet = grossRevenue - cleaningCosts - managementFeeAmount - maintenanceBuffer;

    return {
      bookedNights,
      estimatedStays,
      grossRevenue,
      cleaningCosts,
      managementFeeAmount,
      estimatedNet,
      totalCosts: cleaningCosts + managementFeeAmount + maintenanceBuffer
    };
  };

  const results = calculateEarnings();

  const occupancyPresets = [55, 65, 75];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCurrencySymbol = () => {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0).replace(/[\d.,\s]/g, '');
  };

  const inputClass =
    "w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-right-stay-400/50 focus:ring-2 focus:ring-right-stay-500/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
  const panelClass =
    "rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 sm:p-8 backdrop-blur-xl shadow-xl";

  return (
    <PremiumSectionBackground id="earnings-estimator" className="!py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-white/10 bg-white/5 mb-6 animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.1s both' }}>
            <Calculator className="h-8 w-8 text-right-stay-300" strokeWidth={1.5} />
          </div>
          <h2 
            className="sm:text-5xl lg:text-6xl text-4xl font-medium text-white tracking-tight animate-on-scroll font-display"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both' }}
          >
            Earnings Estimator
          </h2>
          <p 
            className="sm:text-xl text-lg leading-relaxed text-white/60 max-w-3xl mx-auto mt-6 animate-on-scroll"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.3s both' }}
          >
            Estimate your potential monthly earnings based on your property details
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Inputs */}
          <div className="space-y-6 animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.4s both' }}>
            <div className={panelClass}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-white font-display">Property Details</h3>
                {/* Currency Selector */}
                <div className="relative z-30">
                  <button
                    type="button"
                    onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-xl">{currency.flag}</span>
                    <span className="text-sm font-medium text-white/90">{currency.code}</span>
                    <ChevronDown className={`h-4 w-4 text-white/50 transition-transform ${currencyDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {currencyDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-20" 
                        onClick={() => setCurrencyDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-lg border border-white/15 bg-[#1a211e] shadow-xl z-30 max-h-64 overflow-y-auto">
                        {currencies.map((curr) => (
                          <button
                            key={curr.code}
                            type="button"
                            onClick={() => {
                              setCurrency(curr);
                              setCurrencyDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                              currency.code === curr.code ? 'bg-right-stay-500/20' : ''
                            }`}
                          >
                            <span className="text-xl">{curr.flag}</span>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">{curr.code}</div>
                              <div className="text-xs text-white/50">{curr.name}</div>
                            </div>
                            {currency.code === curr.code && (
                              <span className="text-right-stay-500 font-semibold">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    ADR (Average Daily Rate) - {getCurrencySymbol()}
                  </label>
                  <input
                    type="number"
                    value={adr}
                    onChange={(e) => setAdr(Number(e.target.value))}
                    className={inputClass}
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Occupancy % - {occupancy}%
                  </label>
                  <div className="mb-3">
                    <input
                      type="range"
                      value={occupancy}
                      onChange={(e) => setOccupancy(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-right-stay-500"
                      style={{
                        background: `linear-gradient(to right, rgb(51, 126, 47) 0%, rgb(51, 126, 47) ${occupancy}%, rgba(255,255,255,0.1) ${occupancy}%, rgba(255,255,255,0.1) 100%)`
                      }}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="flex gap-3">
                    {occupancyPresets.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setOccupancy(preset)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          occupancy === preset
                            ? 'bg-right-stay-500 text-white shadow-[0_0_20px_rgba(51,126,47,0.35)]'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Average Length of Stay (nights)
                  </label>
                  <input
                    type="number"
                    value={avgLengthOfStay}
                    onChange={(e) => setAvgLengthOfStay(Number(e.target.value))}
                    className={inputClass}
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Cleaning Fee per Stay - {getCurrencySymbol()}
                  </label>
                  <input
                    type="number"
                    value={cleaningFee}
                    onChange={(e) => setCleaningFee(Number(e.target.value))}
                    className={inputClass}
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Management Fee
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-white/10 bg-white/5">
                    <span className="text-lg font-semibold text-white">{managementFee}%</span>
                    <span className="text-sm text-white/50">(Fixed)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Maintenance Buffer (optional) - {getCurrencySymbol()}
                  </label>
                  <input
                    type="number"
                    value={maintenanceBuffer}
                    onChange={(e) => setMaintenanceBuffer(Number(e.target.value))}
                    className={inputClass}
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6 animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.5s both' }}>
            <div className={panelClass}>
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="h-6 w-6 text-right-stay-300" strokeWidth={1.5} />
                <h3 className="text-2xl font-semibold text-white font-display">Estimated Monthly Earnings</h3>
              </div>

              <div className="space-y-6">
                <div className="pb-6 border-b border-white/10">
                  <div className="text-sm text-white/50 mb-1">Booked Nights</div>
                  <div className="text-3xl font-bold text-white font-display">{results.bookedNights} nights</div>
                </div>

                <div className="pb-6 border-b border-white/10">
                  <div className="text-sm text-white/50 mb-1">Estimated Stays</div>
                  <div className="text-3xl font-bold text-white font-display">{results.estimatedStays} stays</div>
                </div>

                <div className="pb-6 border-b border-white/10">
                  <div className="text-sm text-white/50 mb-1">Gross Revenue</div>
                  <div className="text-3xl font-bold text-right-stay-300">{formatCurrency(results.grossRevenue)}</div>
                </div>

                <div className="pb-6 border-b border-white/10">
                  <div className="text-sm font-medium text-white/70 mb-3">Total Costs</div>
                  <div className="space-y-2 pl-4">
                    <div className="flex justify-between text-sm text-white/60">
                      <span>Cleaning Costs</span>
                      <span>{formatCurrency(results.cleaningCosts)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-white/60">
                      <span>Management Fee</span>
                      <span>{formatCurrency(results.managementFeeAmount)}</span>
                    </div>
                    {maintenanceBuffer > 0 && (
                      <div className="flex justify-between text-sm text-white/60">
                        <span>Maintenance Buffer</span>
                        <span>{formatCurrency(maintenanceBuffer)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-semibold text-white pt-2 border-t border-white/10">
                      <span>Total Costs</span>
                      <span>{formatCurrency(results.totalCosts)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-right-stay-400/30 bg-gradient-to-br from-right-stay-500/25 to-right-stay-600/10 p-6 shadow-[0_0_40px_rgba(51,126,47,0.15)]">
                  <div className="text-sm font-medium text-white/70 mb-1">Estimated Net Income</div>
                  <div className="text-4xl font-bold text-white font-display">{formatCurrency(results.estimatedNet)}</div>
                  <div className="text-sm text-white/50 mt-2">per month</div>
                </div>

                <div className="pt-4">
                  <p className="text-xs text-white/40 leading-relaxed">
                    * Estimates vary by season, events, and property quality. This is an approximation based on the inputs provided.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PremiumSectionBackground>
  );
}
