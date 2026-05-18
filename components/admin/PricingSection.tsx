import React from 'react';
import type { PropertyFormValues } from '@/types/property';

interface PricingErrors {
  minPrice?: string;
  basePrice?: string;
  maxPrice?: string;
  cleaningFee?: string;
  serviceFeePercent?: string;
}

interface PricingSectionProps {
  values: Pick<
    PropertyFormValues,
    'pricingEnabled' | 'minPrice' | 'basePrice' | 'maxPrice' | 'cleaningFee' | 'serviceFeePercent'
  >;
  currency: string;
  errors?: PricingErrors;
  onChange: (field: keyof PricingSectionProps['values'], value: string | boolean) => void;
}

export function PricingSection({ values, currency, errors, onChange }: PricingSectionProps) {
  const { pricingEnabled, minPrice, basePrice, maxPrice, cleaningFee, serviceFeePercent } = values;

  const parsedMin = parseFloat(minPrice || '');
  const parsedBase = parseFloat(basePrice || '');
  const parsedMax = parseFloat(maxPrice || '');

  const hasValidRange =
    !Number.isNaN(parsedMin) &&
    !Number.isNaN(parsedBase) &&
    !Number.isNaN(parsedMax) &&
    parsedMax > parsedMin;

  const range = hasValidRange ? parsedMax - parsedMin : 0;
  const baseOffset = hasValidRange ? ((parsedBase - parsedMin) / range) * 100 : 50;

  return (
    <section className="mt-6 border-t border-slate-200 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-semibold text-slate-900">Dynamic Pricing</h4>
            <span
              className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-white/10 text-slate-600 cursor-default"
              title="Configure minimum, base, and maximum nightly prices for this property."
            >
              i
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Control your pricing range for low, normal, and high demand periods.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onChange('pricingEnabled', !pricingEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            pricingEnabled ? 'bg-emerald-500' : 'bg-gray-600'
          }`}
          aria-pressed={pricingEnabled}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              pricingEnabled ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div
        className={`grid gap-4 md:grid-cols-3 rounded-xl border px-4 py-4 ${
          pricingEnabled ? 'border-slate-200 bg-slate-50' : 'border-slate-100 bg-slate-100 opacity-60'
        }`}
      >
        <PricingInput
          label="Minimum Price"
          description="Lowest price the system can use during low demand."
          colorClass="text-orange-700"
          prefix={currency === 'ZAR' ? 'R' : currency}
          name="minPrice"
          value={minPrice}
          onChange={value => onChange('minPrice', value)}
          disabled={!pricingEnabled}
          error={errors?.minPrice}
        />
        <PricingInput
          label="Base Price"
          description="Typical nightly price under normal demand."
          colorClass="text-amber-700"
          prefix={currency === 'ZAR' ? 'R' : currency}
          name="basePrice"
          value={basePrice}
          onChange={value => onChange('basePrice', value)}
          disabled={!pricingEnabled}
          error={errors?.basePrice}
        />
        <PricingInput
          label="Maximum Price"
          description="Highest price allowed during peak demand."
          colorClass="text-emerald-400"
          prefix={currency === 'ZAR' ? 'R' : currency}
          name="maxPrice"
          value={maxPrice}
          onChange={value => onChange('maxPrice', value)}
          disabled={!pricingEnabled}
          error={errors?.maxPrice}
        />
      </div>

      {/* Visual price range indicator */}
      <div className="mt-4 space-y-2">
        <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500" />

        <div className="relative flex justify-between text-[11px] text-slate-600">
          <span className="text-orange-300">Low Demand</span>
          <span className="text-yellow-300">Normal</span>
          <span className="text-green-300">High Demand</span>
        </div>

        {hasValidRange && (
          <div className="relative mt-2 h-5">
            <PriceMarker
              label="Min"
              value={parsedMin}
              position={0}
              colorClass="bg-orange-400"
              currency={currency}
            />
            <PriceMarker
              label="Base"
              value={parsedBase}
              position={baseOffset}
              colorClass="bg-yellow-400"
              currency={currency}
            />
            <PriceMarker
              label="Max"
              value={parsedMax}
              position={100}
              colorClass="bg-green-400"
              currency={currency}
            />
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <PricingInput
          label="Cleaning Fee"
          description="Flat fee added once per booking."
          colorClass="text-sky-400"
          prefix={currency === 'ZAR' ? 'R' : currency}
          name="cleaningFee"
          value={cleaningFee}
          onChange={value => onChange('cleaningFee', value)}
          disabled={!pricingEnabled}
          error={errors?.cleaningFee}
        />
        <PricingInput
          label="Service Fee %"
          description="Percentage applied to accommodation subtotal."
          colorClass="text-violet-400"
          prefix="%"
          name="serviceFeePercent"
          value={serviceFeePercent}
          onChange={value => onChange('serviceFeePercent', value)}
          disabled={!pricingEnabled}
          error={errors?.serviceFeePercent}
        />
      </div>
    </section>
  );
}

interface PricingInputProps {
  label: string;
  description: string;
  colorClass: string;
  prefix: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

function PricingInput({
  label,
  description,
  colorClass,
  prefix,
  name,
  value,
  onChange,
  disabled,
  error,
}: PricingInputProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-200">
        <span className={colorClass}>{label}</span>
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-500">
          {prefix}
        </span>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          name={name}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full rounded-lg border px-8 py-2 text-sm text-slate-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            error ? 'border-red-500 bg-red-500/10' : 'border-gray-700 bg-[#1a1f2e]'
          } ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
          placeholder="0.00"
        />
      </div>
      <p className="text-xs text-slate-500">{description}</p>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}

interface PriceMarkerProps {
  label: string;
  value: number;
  position: number;
  colorClass: string;
  currency: string;
}

function PriceMarker({ label, value, position, colorClass, currency }: PriceMarkerProps) {
  const clamped = Math.min(100, Math.max(0, position));
  const offsetStyle = { left: `${clamped}%`, transform: 'translateX(-50%)' as const };
  const prefix = currency === 'ZAR' ? 'R' : currency;

  return (
    <div
      className="absolute top-0 flex -translate-y-1/2 flex-col items-center"
      style={offsetStyle}
      title={`${label}: ${prefix}${value.toFixed(2)}`}
    >
      <div className={`h-3 w-3 rounded-full border border-slate-300 ${colorClass}`} />
      <span className="mt-1 text-[10px] text-gray-200">{label}</span>
    </div>
  );
}

