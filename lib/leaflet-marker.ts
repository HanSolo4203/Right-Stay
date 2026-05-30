import L from 'leaflet';

export type PropertyMarkerVariant = 'booking' | 'default';

export function getPropertyMarkerIcon(variant: PropertyMarkerVariant = 'default'): L.DivIcon {
  const pinClass =
    variant === 'booking' ? 'property-map-marker-pin property-map-marker-pin--booking' : 'property-map-marker-pin';

  return L.divIcon({
    className: `property-map-marker property-map-marker--${variant}`,
    html: `<span class="${pinClass}" aria-hidden="true"></span>`,
    iconSize: variant === 'booking' ? [40, 48] : [36, 44],
    iconAnchor: variant === 'booking' ? [20, 48] : [18, 44],
    popupAnchor: [0, -40],
  });
}
