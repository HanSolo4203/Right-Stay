'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, MapPin, Search } from 'lucide-react';

export type AddressSearchResult = {
  address: string;
  lat: string;
  lng: string;
  name?: string;
  googlePlaceId?: string;
  shortDescription?: string;
  description?: string;
  websiteUrl?: string;
  phone?: string;
  priceLevel?: 'free' | '$' | '$$' | '$$$';
  photoCount?: number;
};

type Suggestion = {
  id: string;
  primary: string;
  secondary: string;
  lat?: number;
  lng?: number;
  address?: string;
};

type AddressSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onResolved: (result: AddressSearchResult) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  enrichPlace?: boolean;
};

function newSessionToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatCoord(value: number) {
  return value.toFixed(6);
}

function placeFieldsFromResolved(data: Record<string, unknown>): Partial<AddressSearchResult> {
  const priceLevel = data.priceLevel;
  return {
    googlePlaceId: typeof data.googlePlaceId === 'string' ? data.googlePlaceId : undefined,
    shortDescription: typeof data.shortDescription === 'string' ? data.shortDescription : undefined,
    description: typeof data.description === 'string' ? data.description : undefined,
    websiteUrl: typeof data.websiteUrl === 'string' ? data.websiteUrl : undefined,
    phone: typeof data.phone === 'string' ? data.phone : undefined,
    photoCount: typeof data.photoCount === 'number' ? data.photoCount : undefined,
    priceLevel:
      priceLevel === 'free' || priceLevel === '$' || priceLevel === '$$' || priceLevel === '$$$'
        ? priceLevel
        : undefined,
  };
}

export default function AddressSearchInput({
  value,
  onChange,
  onResolved,
  placeholder = 'Search an address',
  className,
  inputClassName,
  enrichPlace = false,
}: AddressSearchInputProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sessionTokenRef = useRef(newSessionToken());
  const skipNextSearchRef = useRef(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState('');
  const [menuRect, setMenuRect] = useState<{ top: number; left: number; width: number } | null>(
    null
  );

  const updateMenuRect = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    const rect = input.getBoundingClientRect();
    setMenuRect({
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateMenuRect();
    const onReposition = () => updateMenuRect();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, updateMenuRect]);

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      abortRef.current?.abort();
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      setError('');
      return;
    }

    const query = value.trim();
    if (query.length < 2) {
      abortRef.current?.abort();
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      setError('');
      return;
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          q: query,
          suggest: '1',
          sessionToken: sessionTokenRef.current,
        });
        const response = await fetch(`/api/admin/geocode?${params}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Address search failed.');
        }
        const next = Array.isArray(data.suggestions) ? (data.suggestions as Suggestion[]) : [];
        setSuggestions(next);
        setActiveIndex(next.length > 0 ? 0 : -1);
        setOpen(true);
      } catch (err) {
        if (controller.signal.aborted) return;
        setSuggestions([]);
        setOpen(true);
        setError(err instanceof Error ? err.message : 'Address search failed.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 280);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  const resolveSuggestion = useCallback(
    async (suggestion: Suggestion) => {
      setResolving(true);
      setError('');
      try {
        if (
          typeof suggestion.lat === 'number' &&
          typeof suggestion.lng === 'number' &&
          Number.isFinite(suggestion.lat) &&
          Number.isFinite(suggestion.lng)
        ) {
          const address = suggestion.address || [suggestion.primary, suggestion.secondary].filter(Boolean).join(', ');
          skipNextSearchRef.current = true;
          onChange(address);
          onResolved({
            address,
            lat: formatCoord(suggestion.lat),
            lng: formatCoord(suggestion.lng),
            name: suggestion.primary,
          });
        } else {
          const params = new URLSearchParams({
            placeId: suggestion.id,
            sessionToken: sessionTokenRef.current,
          });
          if (enrichPlace) params.set('profile', '1');
          const response = await fetch(`/api/admin/geocode?${params}`);
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Could not find that address.');
          }
          const address = data.displayName || [suggestion.primary, suggestion.secondary].filter(Boolean).join(', ');
          skipNextSearchRef.current = true;
          onChange(address);
          onResolved({
            address,
            lat: formatCoord(Number(data.lat)),
            lng: formatCoord(Number(data.lng)),
            name: data.name || suggestion.primary,
            ...placeFieldsFromResolved(data),
          });
        }
        sessionTokenRef.current = newSessionToken();
        setOpen(false);
        setSuggestions([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not find that address.');
      } finally {
        setResolving(false);
      }
    },
    [enrichPlace, onChange, onResolved]
  );

  const resolveTypedAddress = useCallback(async () => {
    const query = value.trim();
    if (query.length < 3) {
      setError('Enter at least 3 characters to search.');
      setOpen(true);
      return;
    }

    setResolving(true);
    setError('');
    try {
      const params = new URLSearchParams({ q: query });
      if (enrichPlace) params.set('profile', '1');
      const response = await fetch(`/api/admin/geocode?${params}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not find that address.');
      }
      const address = data.displayName || query;
      skipNextSearchRef.current = true;
      onChange(address);
      onResolved({
        address,
        lat: formatCoord(Number(data.lat)),
        lng: formatCoord(Number(data.lng)),
        name: data.name,
        ...placeFieldsFromResolved(data),
      });
      sessionTokenRef.current = newSessionToken();
      setOpen(false);
      setSuggestions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not find that address.');
      setOpen(true);
    } finally {
      setResolving(false);
    }
  }, [enrichPlace, onChange, onResolved, value]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      if (!open && suggestions.length) setOpen(true);
      if (!suggestions.length) return;
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      if (!suggestions.length) return;
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
      return;
    }

    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (open && activeIndex >= 0 && suggestions[activeIndex]) {
        void resolveSuggestion(suggestions[activeIndex]);
        return;
      }
      void resolveTypedAddress();
    }
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (inputRef.current?.contains(target)) return;
      const menu = document.getElementById(listboxId);
      if (menu?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [listboxId, open]);

  const showMenu = open && (loading || resolving || Boolean(error) || suggestions.length > 0);
  const busy = loading || resolving;

  return (
    <div className={className || 'relative'}>
      <div className="relative">
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => {
            if (value.trim().length >= 2 && (suggestions.length > 0 || error)) {
              setOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={showMenu}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            showMenu && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
          }
          className={`${inputClassName || ''} pr-10 [&::-webkit-search-cancel-button]:hidden`.trim()}
          placeholder={placeholder}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </span>
      </div>

      {showMenu &&
        menuRect &&
        typeof document !== 'undefined' &&
        createPortal(
          <ul
            id={listboxId}
            role="listbox"
            className="fixed z-[80] max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
            style={{ top: menuRect.top, left: menuRect.left, width: menuRect.width }}
          >
            {error ? (
              <li className="px-3 py-2 text-sm text-red-600">{error}</li>
            ) : suggestions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">
                {busy ? 'Searching addresses…' : 'No matching addresses'}
              </li>
            ) : (
              suggestions.map((suggestion, index) => {
                const active = index === activeIndex;
                return (
                  <li key={suggestion.id} role="option" aria-selected={active} id={`${listboxId}-${index}`}>
                    <button
                      type="button"
                      className={`flex w-full items-start gap-2 px-3 py-2 text-left ${
                        active ? 'bg-right-stay-50' : 'hover:bg-slate-50'
                      }`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => void resolveSuggestion(suggestion)}
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-900">
                          {suggestion.primary}
                        </span>
                        {suggestion.secondary ? (
                          <span className="block truncate text-xs text-slate-500">
                            {suggestion.secondary}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>,
          document.body
        )}
    </div>
  );
}
