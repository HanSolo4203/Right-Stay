'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import {
  PRESET_PROPERTY_AMENITIES,
  getAmenityIcon,
  isPresetAmenity,
  normalizePropertyAmenities,
} from '@/lib/property-amenities';

type PropertyAmenitiesEditorProps = {
  value: string[];
  onChange: (amenities: string[]) => void;
};

export default function PropertyAmenitiesEditor({
  value,
  onChange,
}: PropertyAmenitiesEditorProps) {
  const [customInput, setCustomInput] = useState('');
  const selected = normalizePropertyAmenities(value);
  const selectedKeys = new Set(selected.map((a) => a.toLowerCase()));
  const customAmenities = selected.filter((a) => !isPresetAmenity(a));

  const togglePreset = (label: string) => {
    const key = label.toLowerCase();
    if (selectedKeys.has(key)) {
      onChange(selected.filter((a) => a.toLowerCase() !== key));
    } else {
      onChange([...selected, label]);
    }
  };

  const removeAmenity = (label: string) => {
    const key = label.toLowerCase();
    onChange(selected.filter((a) => a.toLowerCase() !== key));
  };

  const addCustomAmenity = () => {
    const next = normalizePropertyAmenities([...selected, customInput]);
    if (next.length === selected.length) {
      setCustomInput('');
      return;
    }
    onChange(next);
    setCustomInput('');
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Amenities</h3>
        <p className="mt-1 text-xs text-slate-500">
          Select common amenities or add custom labels. Shown on the public property details page.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {PRESET_PROPERTY_AMENITIES.map((label) => {
          const checked = selectedKeys.has(label.toLowerCase());
          const Icon = getAmenityIcon(label);
          return (
            <label
              key={label}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                checked
                  ? 'border-right-stay-500/50 bg-right-stay-50 ring-1 ring-right-stay-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => togglePreset(label)}
                className="h-4 w-4 rounded border-slate-300 text-right-stay-600 focus:ring-right-stay-500/30"
              />
              <Icon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <span className="text-sm text-slate-800">{label}</span>
            </label>
          );
        })}
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-slate-600">
          Custom amenity
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomAmenity();
              }
            }}
            placeholder="e.g. Rooftop terrace"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-right-stay-500 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25"
          />
          <button
            type="button"
            onClick={addCustomAmenity}
            disabled={!customInput.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {customAmenities.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-slate-600">Custom selections</p>
          <div className="flex flex-wrap gap-2">
            {customAmenities.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white py-1 pl-2.5 pr-1 text-xs text-slate-700"
              >
                {label}
                <button
                  type="button"
                  onClick={() => removeAmenity(label)}
                  className="rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={`Remove ${label}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <p className="text-xs text-slate-500">
          {selected.length} amenit{selected.length === 1 ? 'y' : 'ies'} selected
        </p>
      )}
    </div>
  );
}
