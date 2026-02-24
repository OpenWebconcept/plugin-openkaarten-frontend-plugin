import L from 'leaflet';

if (!window.openkaarten) window.openkaarten = {};

window.openkaarten.maps = window.openkaarten.maps || {};

window.openkaarten.registerMap = function(mapId, mapInstance) {
  if (!mapId || !mapInstance) return;
  window.openkaarten.maps[mapId] = mapInstance;
};

window.openkaarten.addMarker = function(mapId, options = {}) {
  const map = window.openkaarten.maps[mapId];
  if (!map) return;
  const {
	lat,
	lng,
	popup,
	markerOptions = {},
	flyTo = true,
	flyToOptions = {},
	onAdd
  } = options;
  if (typeof lat !== 'number' || typeof lng !== 'number') return;

  const marker = L.marker([lat, lng], markerOptions).addTo(map);

  if (popup) marker.bindPopup(popup);
  if (flyTo) map.flyTo([lat, lng], flyToOptions.zoom || 15, { animate: true, duration: 1, ...flyToOptions });
  if (typeof onAdd === 'function') onAdd(marker, map);
};
