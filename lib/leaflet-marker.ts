import L from 'leaflet';

let markerIconConfigured = false;

export function getPropertyMarkerIcon(): L.DivIcon {
  if (!markerIconConfigured) {
    markerIconConfigured = true;
  }

  return L.divIcon({
    className: 'property-map-marker',
    html: `<span class="property-map-marker-pin" aria-hidden="true"></span>`,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40],
  });
}
