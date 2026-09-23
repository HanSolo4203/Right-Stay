'use client';

import { Component, useMemo, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AlertCircle, Compass, Home, List, Map as MapIcon, MapPin, Star } from 'lucide-react';
import ListingImage from '@/components/ui/ListingImage';
import GuideItemDetailPanel from '@/components/guide/GuideItemDetailPanel';
import { GuideMapPaneSkeleton } from '@/components/guide/GuideExplorerSkeletons';
import { GuideEmptyState, GuideMapUnavailable } from '@/components/guide/GuideStates';
import { getGuideCategoryIcon } from '@/lib/guide-category-icons';
import { googleMapsDirectionsUrl } from '@/lib/guide-links';
import { GUIDE_PROPERTY_MAP_ZOOM } from '@/lib/map-config';
import { formatDistanceAway, haversineDistanceKm } from '@/lib/property-location';
import type { GuideMapItem, GuideMapProperty } from '@/components/maps/GuideMapDisplay';
import type { GuideCategory, GuidePlace, GuidePropertyPin } from '@/types/guide';

const GuideMapDisplay = dynamic(() => import('@/components/maps/GuideMapDisplay'), {
  ssr: false,
  loading: () => <GuideMapPaneSkeleton className="h-full min-h-[50vh] w-full lg:min-h-0" />,
});

type ThingsToDoExplorerProps = {
  categories: GuideCategory[];
  places: GuidePlace[];
  properties: GuidePropertyPin[];
  activeProperty?: GuidePropertyPin | null;
  loadError?: string | null;
};

type MobilePane = 'list' | 'map';

class GuideMapBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function priceLabel(place: GuidePlace): string | null {
  if (!place.price_level) return null;
  return place.price_level === 'free' ? 'Free' : place.price_level;
}

function toMapItem(place: GuidePlace): GuideMapItem {
  return {
    id: place.id,
    name: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
    category_id: place.category_id,
    is_featured: place.is_featured,
    primary_photo_url: place.primary_photo_url,
    short_description: place.short_description,
    category: {
      icon: place.category.icon,
      color: place.category.color,
      name: place.category.name,
    },
  };
}

const EMPTY_ACTION_CLASS =
  'inline-flex min-h-11 items-center justify-center rounded-xl bg-right-stay-500 px-4 text-sm font-semibold text-white transition hover:bg-right-stay-600';

export default function ThingsToDoExplorer({
  categories,
  places,
  properties,
  activeProperty = null,
  loadError = null,
}: ThingsToDoExplorerProps) {
  const router = useRouter();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [showStays, setShowStays] = useState(true);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<MobilePane>('list');
  const [mapBoundaryKey, setMapBoundaryKey] = useState(0);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());

  const distanceByPlaceId = useMemo(() => {
    if (!activeProperty) return null;
    const distances = new Map<string, number>();
    for (const place of places) {
      distances.set(
        place.id,
        haversineDistanceKm(
          activeProperty.latitude,
          activeProperty.longitude,
          place.latitude,
          place.longitude
        )
      );
    }
    return distances;
  }, [activeProperty, places]);

  const filteredPlaces = useMemo(() => {
    const subset =
      selectedCategoryIds.length === 0
        ? places
        : places.filter((place) => selectedCategoryIds.includes(place.category_id));

    if (!distanceByPlaceId) return subset;

    return [...subset].sort((a, b) => {
      const distanceA = distanceByPlaceId.get(a.id) ?? Number.POSITIVE_INFINITY;
      const distanceB = distanceByPlaceId.get(b.id) ?? Number.POSITIVE_INFINITY;
      return distanceA - distanceB;
    });
  }, [distanceByPlaceId, places, selectedCategoryIds]);

  const mapItems = useMemo(() => filteredPlaces.map(toMapItem), [filteredPlaces]);
  const mapProperties = useMemo((): GuideMapProperty[] => {
    if (!activeProperty) {
      return showStays ? properties : [];
    }

    const pins = showStays
      ? properties
      : properties.filter((property) => property.id === activeProperty.id);

    return pins.map((property) =>
      property.id === activeProperty.id
        ? { ...property, isActiveStay: true, label: "You're staying here" }
        : property
    );
  }, [activeProperty, properties, showStays]);
  const selectedPlace = places.find((place) => place.id === selectedItemId) ?? null;
  const allSelected = selectedCategoryIds.length === 0;

  const openPlace = (placeId: string) => {
    setHoveredItemId(null);
    setSelectedItemId(placeId);
    setDetailOpen(true);
    const card = cardRefs.current.get(placeId);
    card?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  };

  const retryLoad = () => {
    router.refresh();
  };

  const selectedCategoryNames = categories
    .filter((category) => selectedCategoryIds.includes(category.id))
    .map((category) => category.name);

  let emptyState: ReactNode = null;
  if (loadError && places.length === 0) {
    emptyState = (
      <GuideEmptyState
        icon={AlertCircle}
        title="The guide couldn’t load"
        body={loadError}
        action={
          <button type="button" onClick={retryLoad} className={EMPTY_ACTION_CLASS}>
            Try again
          </button>
        }
      />
    );
  } else if (categories.length === 0) {
    emptyState = (
      <GuideEmptyState
        icon={Compass}
        title="No categories are live yet"
        body="When the host publishes categories, they’ll show up here as filters for the Cape Town shortlist."
      />
    );
  } else if (places.length === 0) {
    emptyState = (
      <GuideEmptyState
        icon={MapPin}
        title="No places published yet"
        body="The Cape Town shortlist is being put together. Check back soon."
      />
    );
  } else if (filteredPlaces.length === 0) {
    const singleName = selectedCategoryNames.length === 1 ? selectedCategoryNames[0] : null;
    emptyState = (
      <GuideEmptyState
        icon={MapPin}
        title={singleName ? `Nothing in ${singleName} yet` : 'No places in these categories'}
        body="Try another category, or tap All to see every place."
        action={
          <button
            type="button"
            onClick={() => setSelectedCategoryIds([])}
            className={EMPTY_ACTION_CLASS}
          >
            Show all places
          </button>
        }
      />
    );
  }

  return (
    <div className="flex h-[calc(100dvh-var(--site-header-height))] flex-col bg-[#121816] text-white">
      <header className="shrink-0 border-b border-white/10 px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-right-stay-400/90">
          Cape Town guide
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Things To Do in Cape Town
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
          Eat, swim, wander, and find the good spots near where you&apos;re staying.
        </p>

        {activeProperty && (
          <div
            className="mt-3 inline-flex max-w-full items-center gap-2 rounded-xl border border-right-stay-400/40 bg-right-stay-500/15 px-3 py-2 text-sm text-right-stay-100"
            role="status"
          >
            <Home className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span className="min-w-0">
              Showing places near{' '}
              <span className="font-semibold text-white">{activeProperty.name}</span>
            </span>
          </div>
        )}

        {loadError && places.length > 0 && (
          <div
            className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100"
            role="status"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1">{loadError}</span>
            <button
              type="button"
              onClick={retryLoad}
              className="inline-flex min-h-10 items-center font-medium text-white underline-offset-2 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div
            className="guide-filter-scroller -mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
            role="group"
            aria-label="Filter places by category"
          >
            <button
              type="button"
              aria-pressed={allSelected}
              onClick={() => setSelectedCategoryIds([])}
              className={`inline-flex shrink-0 snap-start items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                allSelected
                  ? 'border-right-stay-400/70 bg-right-stay-500 text-white'
                  : 'border-white/15 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10'
              }`}
            >
              All
            </button>

            {categories.map((category) => {
              const pressed = selectedCategoryIds.includes(category.id);
              const Icon = getGuideCategoryIcon(category.icon);
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => toggleCategory(category.id)}
                  className={`inline-flex shrink-0 snap-start items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                    pressed
                      ? 'border-transparent text-white'
                      : 'border-white/15 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10'
                  }`}
                  style={
                    pressed
                      ? { background: category.color, borderColor: category.color }
                      : { boxShadow: `inset 3px 0 0 ${category.color}` }
                  }
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  {category.name}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            aria-pressed={showStays}
            onClick={() => setShowStays((value) => !value)}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition lg:ml-auto ${
              showStays
                ? 'border-right-stay-400/80 bg-right-stay-500/20 text-right-stay-100'
                : 'border-white/15 bg-white/5 text-white/75 hover:border-white/30'
            }`}
          >
            <Home className="h-4 w-4" strokeWidth={1.75} />
            Where You&apos;re Staying
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section
          id="guide-places"
          aria-label="Places to do"
          className={`min-h-0 overflow-y-auto px-4 py-4 sm:px-6 lg:block lg:px-6 ${
            mobilePane === 'list' ? 'block' : 'hidden'
          }`}
        >
          <p className="sr-only" aria-live="polite">
            {filteredPlaces.length === 1
              ? '1 place shown'
              : `${filteredPlaces.length} places shown`}
          </p>

          {emptyState ? (
            emptyState
          ) : (
            <ul className="flex flex-col gap-3 pb-6">
              {filteredPlaces.map((place) => {
                const Icon = getGuideCategoryIcon(place.category.icon);
                const price = priceLabel(place);
                const distanceKm = distanceByPlaceId?.get(place.id);
                const distanceLabel =
                  distanceKm != null ? formatDistanceAway(distanceKm) : null;
                const selected = selectedItemId === place.id;
                const hovered = hoveredItemId === place.id;
                return (
                  <li key={place.id}>
                    <article
                      ref={(node) => {
                        if (node) cardRefs.current.set(place.id, node);
                        else cardRefs.current.delete(place.id);
                      }}
                      className={`overflow-hidden rounded-2xl border transition ${
                        selected
                          ? 'border-right-stay-400/70 bg-white/[0.08] ring-1 ring-right-stay-400/40'
                          : hovered
                            ? 'border-white/25 bg-white/[0.07]'
                            : 'border-white/10 bg-white/[0.04] hover:border-white/20'
                      }`}
                    >
                      <button
                        type="button"
                        className="flex w-full flex-col text-left sm:flex-row"
                        onMouseEnter={() => setHoveredItemId(place.id)}
                        onMouseLeave={() => setHoveredItemId(null)}
                        onFocus={() => setHoveredItemId(place.id)}
                        onBlur={() => setHoveredItemId(null)}
                        onClick={() => openPlace(place.id)}
                        aria-pressed={selected}
                        aria-label={`${place.name}, ${place.category.name}${
                          distanceLabel ? `, ${distanceLabel}` : ''
                        }`}
                      >
                        <div className="relative aspect-[16/10] w-full shrink-0 self-stretch bg-[#2a241c] sm:aspect-auto sm:min-h-[10rem] sm:w-44 lg:w-40">
                          {place.primary_photo_url ? (
                            <ListingImage
                              src={place.primary_photo_url}
                              alt=""
                              variant="card"
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, 176px"
                            />
                          ) : (
                            <div
                              className="flex h-full min-h-[8.5rem] w-full items-center justify-center sm:min-h-full"
                              style={{ background: place.category.color }}
                            >
                              <Icon className="h-8 w-8 text-white" strokeWidth={1.5} />
                            </div>
                          )}
                          {place.is_featured && (
                            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[11px] font-medium text-white">
                              <Star className="h-3 w-3 fill-current" />
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                              style={{ background: place.category.color }}
                            >
                              <Icon className="h-3 w-3" strokeWidth={2} />
                              {place.category.name}
                            </span>
                            {price && (
                              <span className="text-xs font-medium text-white/55">{price}</span>
                            )}
                            {distanceLabel && (
                              <span className="text-xs font-medium text-white/55">
                                {distanceLabel}
                              </span>
                            )}
                          </div>
                          <h2 className="font-display text-lg font-semibold leading-snug tracking-tight">
                            {place.name}
                          </h2>
                          <p className="line-clamp-2 text-sm leading-relaxed text-white/65">
                            {place.short_description}
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center justify-end border-t border-white/10 px-4 py-2">
                        <a
                          href={googleMapsDirectionsUrl(place.latitude, place.longitude)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-10 items-center text-sm font-medium text-right-stay-300 hover:text-right-stay-200"
                        >
                          Directions
                        </a>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section
          aria-label="Cape Town map"
          className={`min-h-0 p-3 lg:sticky lg:top-0 lg:block lg:h-full lg:p-4 ${
            mobilePane === 'map' ? 'block h-full' : 'hidden'
          }`}
        >
          <GuideMapBoundary
            key={mapBoundaryKey}
            fallback={
              <div className="guide-map-shell h-full min-h-[50vh] w-full lg:min-h-0">
                <div className="guide-map-frame h-full min-h-0 overflow-hidden">
                  <GuideMapUnavailable onRetry={() => setMapBoundaryKey((key) => key + 1)} />
                </div>
              </div>
            }
          >
            <GuideMapDisplay
              items={mapItems}
              properties={mapProperties}
              activePropertyId={activeProperty?.id ?? null}
              initialCenter={
                activeProperty
                  ? [activeProperty.latitude, activeProperty.longitude]
                  : undefined
              }
              initialZoom={activeProperty ? GUIDE_PROPERTY_MAP_ZOOM : undefined}
              activeCategoryIds={allSelected ? null : selectedCategoryIds}
              hoveredItemId={hoveredItemId}
              selectedItemId={selectedItemId}
              onHoverItem={setHoveredItemId}
              onSelectItem={openPlace}
              className="h-full min-h-[50vh] w-full lg:min-h-0"
            />
          </GuideMapBoundary>
        </section>
      </div>

      <div className="shrink-0 border-t border-white/10 px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
        <div
          className="grid w-full grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1"
          role="tablist"
          aria-label="List or map"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mobilePane === 'list'}
            onClick={() => setMobilePane('list')}
            className={`inline-flex min-h-12 touch-manipulation items-center justify-center gap-2 rounded-lg text-sm font-medium ${
              mobilePane === 'list' ? 'bg-white text-[#121816]' : 'text-white/75'
            }`}
          >
            <List className="h-4 w-4" />
            List
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobilePane === 'map'}
            onClick={() => setMobilePane('map')}
            className={`inline-flex min-h-12 touch-manipulation items-center justify-center gap-2 rounded-lg text-sm font-medium ${
              mobilePane === 'map' ? 'bg-white text-[#121816]' : 'text-white/75'
            }`}
          >
            <MapIcon className="h-4 w-4" />
            Map
          </button>
        </div>
      </div>

      <GuideItemDetailPanel
        place={detailOpen ? selectedPlace : null}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
