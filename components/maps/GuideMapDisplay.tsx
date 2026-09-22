'use client';

/**
 * Interactive Things To Do map. Import from a server page with
 * `next/dynamic(..., { ssr: false })` — same pattern as PropertyMap.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  MAPLIBRE_BOOKING_STYLE_URL,
} from '@/lib/map-config';
import { applyGuideMapTheme, GUIDE_MAP } from '@/lib/maplibre-guide-theme';
import { GuideMapUnavailable } from '@/components/guide/GuideStates';
import {
  createGuideMarkerElement,
  createGuidePopupHTML,
  createPropertyMarkerElement,
  createPropertyPopupHTML,
} from '@/lib/maplibre-guide-markers';
import { hasValidMapCoordinates } from '@/lib/property-location';
import 'maplibre-gl/dist/maplibre-gl.css';

/** Leaflet-style [lat, lng] → MapLibre [lng, lat]. */
const GUIDE_OVERVIEW_CENTER: [number, number] = [DEFAULT_MAP_CENTER[1], DEFAULT_MAP_CENTER[0]];

const SELECTED_PLACE_ZOOM = 15.35;
const FLY_TO_DURATION_MS = 800;
const CLUSTER_THRESHOLD = 40;
const CLUSTER_HYSTERESIS = 32;
const CLUSTER_RADIUS = 50;
const OVERVIEW_PADDING = { top: 56, bottom: 56, left: 40, right: 40 } as const;
const GUIDE_MAP_PADDING = { top: 72, bottom: 100, left: 48, right: 48 } as const;

const CLUSTER_SOURCE_ID = 'guide-items';
const CLUSTER_LAYER_ID = 'guide-item-clusters';
const CLUSTER_COUNT_LAYER_ID = 'guide-item-cluster-count';

export interface GuideMapItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category_id: string;
  is_featured?: boolean;
  primary_photo_url?: string | null;
  short_description?: string | null;
  category: {
    icon: string;
    color: string;
    name: string;
  };
}

export interface GuideMapProperty {
  id?: string;
  latitude: number;
  longitude: number;
  label?: string;
  name?: string;
  isActiveStay?: boolean;
}

export interface GuideMapDisplayProps {
  items: GuideMapItem[];
  properties?: GuideMapProperty[];
  activePropertyId?: string | null;
  /** Leaflet-style [lat, lng] used for the first camera position. */
  initialCenter?: [number, number];
  initialZoom?: number;
  activeCategoryIds?: string[] | null;
  hoveredItemId?: string | null;
  selectedItemId?: string | null;
  onHoverItem?: (itemId: string | null) => void;
  onSelectItem?: (itemId: string) => void;
  className?: string;
}

type MarkerEntry = {
  marker: maplibregl.Marker;
  element: HTMLDivElement;
};

function lngLatOf(lat: number, lng: number): [number, number] {
  return [lng, lat];
}

function propertyKey(property: GuideMapProperty, index: number): string {
  return property.id ?? `property-${index}-${property.latitude}-${property.longitude}`;
}

function propertyPopupKey(property: GuideMapProperty, index: number): string {
  return `property:${propertyKey(property, index)}`;
}

function resolveLabelFont(map: maplibregl.Map): string[] {
  for (const layer of map.getStyle()?.layers ?? []) {
    if (layer.type !== 'symbol') continue;
    try {
      const font = map.getLayoutProperty(layer.id, 'text-font');
      if (Array.isArray(font) && font.length > 0) {
        return font as string[];
      }
    } catch {
      // Layer may not expose text-font.
    }
  }
  return ['Noto Sans Regular'];
}

function itemsToGeoJSON(items: GuideMapItem[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: items.map((item) => ({
      type: 'Feature',
      properties: { id: item.id },
      geometry: {
        type: 'Point',
        coordinates: [item.longitude, item.latitude],
      },
    })),
  };
}

export default function GuideMapDisplay({
  items,
  properties = [],
  activePropertyId = null,
  initialCenter,
  initialZoom,
  activeCategoryIds = null,
  hoveredItemId = null,
  selectedItemId = null,
  onHoverItem,
  onSelectItem,
  className = '',
}: GuideMapDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapReadyRef = useRef(false);
  const placeMarkersRef = useRef<Map<string, MarkerEntry>>(new Map());
  const propertyMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const popupItemIdRef = useRef<string | null>(null);
  const clusteringRef = useRef(false);
  const itemsByIdRef = useRef<Map<string, GuideMapItem>>(new Map());
  const hoveredItemIdRef = useRef(hoveredItemId);
  const selectedItemIdRef = useRef(selectedItemId);
  const onHoverItemRef = useRef(onHoverItem);
  const onSelectItemRef = useRef(onSelectItem);
  const lastFlownIdRef = useRef<string | null>(null);
  const initialViewRef = useRef({
    center: initialCenter,
    zoom: initialZoom,
  });
  const clusterHandlersRef = useRef<{
    click?: (event: maplibregl.MapLayerMouseEvent) => void;
    enter?: () => void;
    leave?: () => void;
    render?: () => void;
  }>({});
  const rafRef = useRef<number | null>(null);
  const [mapEpoch, setMapEpoch] = useState(0);
  const [mapFailed, setMapFailed] = useState(false);
  const [styleReady, setStyleReady] = useState(false);
  const [remountKey, setRemountKey] = useState(0);
  const [clustered, setClustered] = useState(() => items.length > CLUSTER_THRESHOLD);

  onHoverItemRef.current = onHoverItem;
  onSelectItemRef.current = onSelectItem;
  hoveredItemIdRef.current = hoveredItemId;
  selectedItemIdRef.current = selectedItemId;

  const mappableItems = useMemo(() => {
    const withCoords = items.filter((item) => hasValidMapCoordinates(item.latitude, item.longitude));
    if (activeCategoryIds == null) return withCoords;
    const allowed = new Set(activeCategoryIds);
    return withCoords.filter((item) => allowed.has(item.category_id));
  }, [items, activeCategoryIds]);

  const mappableProperties = useMemo(
    () => properties.filter((property) => hasValidMapCoordinates(property.latitude, property.longitude)),
    [properties]
  );

  itemsByIdRef.current = new Map(mappableItems.map((item) => [item.id, item]));

  const selectedItem = useMemo(
    () => mappableItems.find((item) => item.id === selectedItemId) ?? null,
    [mappableItems, selectedItemId]
  );

  const getPopup = useCallback(() => {
    if (!popupRef.current) {
      popupRef.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 22,
        maxWidth: '320px',
        className: 'guide-map-popup',
        anchor: 'bottom',
      });
    }
    return popupRef.current;
  }, []);

  const hidePopup = useCallback(() => {
    popupRef.current?.remove();
    popupItemIdRef.current = null;
  }, []);

  const showItemPopup = useCallback(
    (item: GuideMapItem) => {
      const map = mapRef.current;
      if (!map) return;
      getPopup()
        .setOffset(22)
        .setLngLat(lngLatOf(item.latitude, item.longitude))
        .setHTML(
          createGuidePopupHTML({
            name: item.name,
            photoUrl: item.primary_photo_url,
            description: item.short_description,
            category: item.category,
          })
        )
        .addTo(map);
      popupItemIdRef.current = item.id;
    },
    [getPopup]
  );

  const showPropertyPopup = useCallback(
    (property: GuideMapProperty, index: number) => {
      const map = mapRef.current;
      if (!map) return;
      const name = property.name?.trim() || property.label?.trim() || "You're staying here";
      getPopup()
        .setOffset(36)
        .setLngLat(lngLatOf(property.latitude, property.longitude))
        .setHTML(
          createPropertyPopupHTML({
            name,
            isActiveStay: Boolean(property.isActiveStay),
          })
        )
        .addTo(map);
      popupItemIdRef.current = propertyPopupKey(property, index);
    },
    [getPopup]
  );

  const flyToItem = useCallback((item: GuideMapItem, force = false) => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;
    if (!force && lastFlownIdRef.current === item.id) return;
    lastFlownIdRef.current = item.id;

    map.flyTo({
      center: lngLatOf(item.latitude, item.longitude),
      zoom: Math.max(map.getZoom(), SELECTED_PLACE_ZOOM),
      bearing: 0,
      pitch: 0,
      padding: GUIDE_MAP_PADDING,
      duration: FLY_TO_DURATION_MS,
      easing: (t) => 1 - (1 - t) ** 3,
      essential: true,
    });
  }, []);

  const applyHighlight = useCallback(
    (hoveredId: string | null, selectedId: string | null) => {
      placeMarkersRef.current.forEach((entry, id) => {
        const hovered = id === hoveredId;
        const selected = id === selectedId;
        entry.element.classList.toggle('is-hovered', hovered && !selected);
        entry.element.classList.toggle('is-selected', selected);
        const button = entry.element.querySelector('.guide-map-marker-hit');
        if (button instanceof HTMLButtonElement) {
          button.setAttribute('aria-pressed', selected ? 'true' : 'false');
        }
        entry.element.style.zIndex = selected ? '24' : hovered ? '22' : entry.element.classList.contains('is-featured') ? '12' : '2';
      });

      const popupId = hoveredId ?? selectedId;
      if (!popupId) {
        hidePopup();
        return;
      }
      const item = itemsByIdRef.current.get(popupId);
      if (!item) {
        hidePopup();
        return;
      }
      if (popupItemIdRef.current !== popupId) {
        showItemPopup(item);
      }
    },
    [hidePopup, showItemPopup]
  );

  const bindGuideMarker = useCallback((item: GuideMapItem, element: HTMLDivElement) => {
    const hit = element.querySelector('.guide-map-marker-hit');
    if (!(hit instanceof HTMLButtonElement)) return;

    hit.addEventListener('mouseenter', () => {
      onHoverItemRef.current?.(item.id);
      showItemPopup(item);
      applyHighlight(item.id, selectedItemIdRef.current ?? null);
    });
    hit.addEventListener('mouseleave', () => {
      onHoverItemRef.current?.(null);
      applyHighlight(null, selectedItemIdRef.current ?? null);
    });
    hit.addEventListener('click', (event) => {
      event.stopPropagation();
      onSelectItemRef.current?.(item.id);
      flyToItem(item, true);
    });
  }, [applyHighlight, flyToItem, showItemPopup]);

  const createPlaceMarker = useCallback(
    (map: maplibregl.Map, item: GuideMapItem, index: number) => {
      const element = createGuideMarkerElement(item.category, {
        isFeatured: item.is_featured,
        label: item.name,
        appearDelayMs: clusteringRef.current ? 0 : Math.min(index * 28, 420),
        showLabel: false,
      });
      element.style.zIndex = item.is_featured ? '12' : '2';
      bindGuideMarker(item, element);

      const marker = new maplibregl.Marker({ element, anchor: 'bottom', pitchAlignment: 'viewport' })
        .setLngLat(lngLatOf(item.latitude, item.longitude))
        .addTo(map);

      placeMarkersRef.current.set(item.id, { marker, element });
    },
    [bindGuideMarker]
  );

  const clearPlaceMarkers = useCallback(() => {
    placeMarkersRef.current.forEach(({ marker }) => marker.remove());
    placeMarkersRef.current.clear();
  }, []);

  const clearPropertyMarkers = useCallback(() => {
    propertyMarkersRef.current.forEach((marker) => marker.remove());
    propertyMarkersRef.current.clear();
  }, []);

  const detachClusterHandlers = useCallback((map: maplibregl.Map) => {
    const handlers = clusterHandlersRef.current;
    if (handlers.click) map.off('click', CLUSTER_LAYER_ID, handlers.click);
    if (handlers.enter) map.off('mouseenter', CLUSTER_LAYER_ID, handlers.enter);
    if (handlers.leave) map.off('mouseleave', CLUSTER_LAYER_ID, handlers.leave);
    if (handlers.render) map.off('render', handlers.render);
    clusterHandlersRef.current = {};
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const teardownClusters = useCallback(
    (map: maplibregl.Map) => {
      detachClusterHandlers(map);
      if (map.getLayer(CLUSTER_COUNT_LAYER_ID)) map.removeLayer(CLUSTER_COUNT_LAYER_ID);
      if (map.getLayer(CLUSTER_LAYER_ID)) map.removeLayer(CLUSTER_LAYER_ID);
      if (map.getSource(CLUSTER_SOURCE_ID)) map.removeSource(CLUSTER_SOURCE_ID);
      clusteringRef.current = false;
    },
    [detachClusterHandlers]
  );

  const syncUnclusteredMarkers = useCallback(
    (map: maplibregl.Map) => {
      if (!map.getSource(CLUSTER_SOURCE_ID) || !map.isSourceLoaded(CLUSTER_SOURCE_ID)) return;

      const features = map.querySourceFeatures(CLUSTER_SOURCE_ID);
      const visibleIds = new Set<string>();
      let created = 0;

      for (const feature of features) {
        const props = feature.properties;
        if (!props || props.cluster || props.point_count) continue;
        const id = typeof props.id === 'string' ? props.id : null;
        if (!id || visibleIds.has(id)) continue;
        visibleIds.add(id);

        if (placeMarkersRef.current.has(id)) continue;
        const item = itemsByIdRef.current.get(id);
        if (!item) continue;
        createPlaceMarker(map, item, created);
        created += 1;
      }

      placeMarkersRef.current.forEach((entry, id) => {
        if (visibleIds.has(id)) return;
        entry.marker.remove();
        placeMarkersRef.current.delete(id);
        if (popupItemIdRef.current === id) {
          popupItemIdRef.current = null;
        }
      });

      applyHighlight(hoveredItemIdRef.current ?? null, selectedItemIdRef.current ?? null);
    },
    [applyHighlight, createPlaceMarker]
  );

  const setupClusters = useCallback(
    (map: maplibregl.Map, clusteredItems: GuideMapItem[]) => {
      teardownClusters(map);
      clusteringRef.current = true;

      map.addSource(CLUSTER_SOURCE_ID, {
        type: 'geojson',
        data: itemsToGeoJSON(clusteredItems),
        cluster: true,
        clusterRadius: CLUSTER_RADIUS,
        clusterMaxZoom: 16,
      });

      map.addLayer({
        id: CLUSTER_LAYER_ID,
        type: 'circle',
        source: CLUSTER_SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            GUIDE_MAP.clusterSmall,
            8,
            GUIDE_MAP.clusterMedium,
            20,
            GUIDE_MAP.clusterLarge,
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            18,
            8,
            24,
            20,
            32,
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': GUIDE_MAP.clusterStroke,
          'circle-opacity': 0.94,
        },
      });

      map.addLayer({
        id: CLUSTER_COUNT_LAYER_ID,
        type: 'symbol',
        source: CLUSTER_SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': resolveLabelFont(map),
          'text-size': 13,
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': GUIDE_MAP.clusterText,
          'text-halo-color': 'rgba(63, 52, 40, 0.22)',
          'text-halo-width': 0.6,
        },
      });

      const onClusterClick = (event: maplibregl.MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== 'Point') return;
        const clusterId = feature.properties?.cluster_id;
        if (typeof clusterId !== 'number') return;

        const source = map.getSource(CLUSTER_SOURCE_ID);
        if (!source || !('getClusterExpansionZoom' in source)) return;

        const coordinates = feature.geometry.coordinates as [number, number];
        void (source as maplibregl.GeoJSONSource)
          .getClusterExpansionZoom(clusterId)
          .then((zoom) => {
            map.easeTo({
              center: coordinates,
              zoom,
              duration: FLY_TO_DURATION_MS,
              easing: (t) => 1 - (1 - t) ** 3,
            });
          })
          .catch(() => {
            map.easeTo({
              center: coordinates,
              zoom: Math.min(map.getZoom() + 2, 16.5),
              duration: FLY_TO_DURATION_MS,
            });
          });
      };

      const onClusterEnter = () => {
        map.getCanvas().style.cursor = 'pointer';
      };
      const onClusterLeave = () => {
        map.getCanvas().style.cursor = '';
      };
      const onRender = () => {
        if (rafRef.current != null) return;
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          if (!clusteringRef.current || !mapRef.current) return;
          syncUnclusteredMarkers(mapRef.current);
        });
      };

      clusterHandlersRef.current = {
        click: onClusterClick,
        enter: onClusterEnter,
        leave: onClusterLeave,
        render: onRender,
      };

      map.on('click', CLUSTER_LAYER_ID, onClusterClick);
      map.on('mouseenter', CLUSTER_LAYER_ID, onClusterEnter);
      map.on('mouseleave', CLUSTER_LAYER_ID, onClusterLeave);
      map.on('render', onRender);
    },
    [syncUnclusteredMarkers, teardownClusters]
  );

  const syncPropertyMarkers = useCallback(
    (map: maplibregl.Map) => {
      clearPropertyMarkers();
      const showStayPopups = Boolean(activePropertyId);

      mappableProperties.forEach((property, index) => {
        const isActiveStay = Boolean(
          property.isActiveStay || (activePropertyId && property.id === activePropertyId)
        );
        const element = createPropertyMarkerElement({
          label: isActiveStay ? "You're staying here" : property.label ?? "You're staying here",
          isActiveStay,
        });
        element.style.zIndex = isActiveStay ? '20' : '18';

        if (showStayPopups) {
          element.classList.add('is-popup-enabled');
          const hit = element.querySelector('.guide-map-property-hit');
          if (hit instanceof HTMLButtonElement) {
            hit.addEventListener('mouseenter', () => {
              showPropertyPopup({ ...property, isActiveStay }, index);
            });
            hit.addEventListener('mouseleave', () => {
              hidePopup();
              applyHighlight(hoveredItemIdRef.current ?? null, selectedItemIdRef.current ?? null);
            });
            hit.addEventListener('focus', () => {
              showPropertyPopup({ ...property, isActiveStay }, index);
            });
            hit.addEventListener('blur', () => {
              hidePopup();
              applyHighlight(hoveredItemIdRef.current ?? null, selectedItemIdRef.current ?? null);
            });
          }
        }

        const marker = new maplibregl.Marker({
          element,
          anchor: 'bottom',
          pitchAlignment: 'viewport',
        })
          .setLngLat(lngLatOf(property.latitude, property.longitude))
          .addTo(map);
        propertyMarkersRef.current.set(propertyKey(property, index), marker);
      });
    },
    [activePropertyId, applyHighlight, clearPropertyMarkers, hidePopup, mappableProperties, showPropertyPopup]
  );

  const countVisibleItems = useCallback((map: maplibregl.Map, places: GuideMapItem[]) => {
    const bounds = map.getBounds();
    return places.reduce((count, item) => {
      return bounds.contains(lngLatOf(item.latitude, item.longitude)) ? count + 1 : count;
    }, 0);
  }, []);

  const syncGuideMarkers = useCallback(
    (map: maplibregl.Map, useClustering: boolean) => {
      hidePopup();
      teardownClusters(map);
      clearPlaceMarkers();

      clusteringRef.current = useClustering;

      if (useClustering) {
        setupClusters(map, mappableItems);
        syncUnclusteredMarkers(map);
      } else {
        mappableItems.forEach((item, index) => {
          createPlaceMarker(map, item, index);
        });
      }

      applyHighlight(hoveredItemIdRef.current ?? null, selectedItemIdRef.current ?? null);
    },
    [
      applyHighlight,
      clearPlaceMarkers,
      createPlaceMarker,
      hidePopup,
      mappableItems,
      setupClusters,
      syncUnclusteredMarkers,
      teardownClusters,
    ]
  );

  const retryMap = useCallback(() => {
    setMapFailed(false);
    setStyleReady(false);
    mapReadyRef.current = false;
    setRemountKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const startCenter = initialViewRef.current.center
      ? lngLatOf(initialViewRef.current.center[0], initialViewRef.current.center[1])
      : GUIDE_OVERVIEW_CENTER;
    const startZoom = initialViewRef.current.zoom ?? DEFAULT_MAP_ZOOM;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container,
        style: MAPLIBRE_BOOKING_STYLE_URL,
        center: startCenter,
        zoom: startZoom,
        pitch: 0,
        bearing: 0,
        minZoom: 10.5,
        maxZoom: 17.5,
        scrollZoom: true,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: { compact: true },
      });
    } catch (error) {
      console.error('Guide map failed to initialise:', error);
      setMapFailed(true);
      return;
    }

    mapRef.current = map;
    map.setPadding(OVERVIEW_PADDING);

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }),
      'top-right'
    );

    applyGuideMapTheme(map);

    const onMapClick = (event: maplibregl.MapMouseEvent) => {
      const target = event.originalEvent.target;
      if (target instanceof Element && target.closest('.guide-map-marker, .guide-map-property-marker')) {
        return;
      }
      onHoverItemRef.current?.(null);
    };
    map.on('click', onMapClick);

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(container);

    let cancelled = false;
    const ready = () => {
      if (cancelled) return;
      mapReadyRef.current = true;
      setMapFailed(false);
      setStyleReady(true);
      map.resize();
      setMapEpoch((value) => value + 1);
    };

    const failIfNotReady = (reason?: unknown) => {
      if (cancelled || mapReadyRef.current) return;
      if (reason) console.error('Guide map failed to load:', reason);
      setMapFailed(true);
    };

    const onError = (event: { error?: { message?: string } | Error }) => {
      if (mapReadyRef.current || cancelled) return;
      const message = event.error instanceof Error ? event.error.message : event.error?.message ?? '';
      if (/failed to fetch|networkerror|load style|ajax|error loading/i.test(message)) {
        failIfNotReady(event.error);
      }
    };
    map.on('error', onError);

    const loadTimeout = window.setTimeout(() => {
      failIfNotReady('Timed out waiting for map style');
    }, 10000);

    if (map.isStyleLoaded()) {
      window.clearTimeout(loadTimeout);
      ready();
    } else {
      map.once('load', () => {
        window.clearTimeout(loadTimeout);
        ready();
      });
    }

    return () => {
      cancelled = true;
      window.clearTimeout(loadTimeout);
      map.off('load', ready);
      map.off('error', onError);
      resizeObserver.disconnect();
      map.off('click', onMapClick);
      detachClusterHandlers(map);
      clearPlaceMarkers();
      clearPropertyMarkers();
      popupRef.current?.remove();
      popupRef.current = null;
      popupItemIdRef.current = null;
      mapReadyRef.current = false;
      lastFlownIdRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // Recreate only on explicit retry; marker/camera sync happens in later effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remountKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;

    const updateClusterMode = () => {
      const visible = countVisibleItems(map, mappableItems);
      setClustered((currentlyClustered) => {
        if (currentlyClustered) return visible > CLUSTER_HYSTERESIS;
        return visible > CLUSTER_THRESHOLD;
      });
    };

    updateClusterMode();
    map.on('moveend', updateClusterMode);
    map.on('zoomend', updateClusterMode);
    return () => {
      map.off('moveend', updateClusterMode);
      map.off('zoomend', updateClusterMode);
    };
  }, [countVisibleItems, mapEpoch, mappableItems]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;
    syncGuideMarkers(map, clustered);
  }, [clustered, mapEpoch, syncGuideMarkers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;
    syncPropertyMarkers(map);
  }, [mapEpoch, syncPropertyMarkers]);

  useEffect(() => {
    if (!mapRef.current || !mapReadyRef.current) return;
    applyHighlight(hoveredItemId ?? null, selectedItemId ?? null);
  }, [applyHighlight, hoveredItemId, mapEpoch, selectedItemId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;

    if (!selectedItem) {
      lastFlownIdRef.current = null;
      return;
    }
    flyToItem(selectedItem);
  }, [flyToItem, mapEpoch, selectedItem]);

  return (
    <div className={`guide-map-shell h-full min-h-0 ${className}`}>
      <div
        className="guide-map-frame h-full min-h-0 overflow-hidden"
        style={{ background: GUIDE_MAP.background }}
      >
        <div
          ref={containerRef}
          className="guide-map-canvas h-full w-full"
          role="region"
          aria-label="Cape Town things to do map"
        />

        {mapFailed && (
          <div className="absolute inset-0 z-10">
            <GuideMapUnavailable onRetry={retryMap} />
          </div>
        )}

        {!styleReady && !mapFailed && (
          <div className="pointer-events-none absolute inset-0 z-[4]" aria-hidden="true">
            <div className="absolute left-[12%] top-[18%] h-24 w-36 animate-pulse rounded-full bg-[#dccdb3]/70" />
            <div className="absolute right-[18%] top-[28%] h-32 w-32 animate-pulse rounded-full bg-[#dccdb3]/50" />
            <div className="absolute bottom-[22%] left-[28%] h-20 w-48 animate-pulse rounded-full bg-[#dccdb3]/60" />
          </div>
        )}

        <div className="guide-map-kicker" aria-hidden="true">
          <span className="guide-map-kicker-mark">Cape Town</span>
          <span className="guide-map-kicker-sep">·</span>
          <span>Things to do</span>
        </div>

        <div className="guide-map-compass" aria-hidden="true">
          <svg viewBox="0 0 48 48" className="guide-map-compass-rose">
            <circle cx="24" cy="24" r="22.5" fill="rgba(248,241,227,0.92)" stroke="#d4c6b0" strokeWidth="1" />
            <path d="M24 8 L27.2 24 L24 21.4 L20.8 24 Z" fill="#337e2f" />
            <path d="M24 40 L20.8 24 L24 26.6 L27.2 24 Z" fill="#c4b49a" />
            <path d="M8 24 L24 20.8 L21.4 24 L24 27.2 Z" fill="#d8cbb6" />
            <path d="M40 24 L24 27.2 L26.6 24 L24 20.8 Z" fill="#d8cbb6" />
            <circle cx="24" cy="24" r="2.2" fill="#5c4e3d" />
          </svg>
          <span className="guide-map-compass-n">N</span>
        </div>
      </div>
    </div>
  );
}
