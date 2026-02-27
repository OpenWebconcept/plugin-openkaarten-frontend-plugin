import L from 'leaflet';
import { fallbackMarkerSvg } from './make-marker-icon';

/**
 * Default marker icon – reuses the fallback SVG from make-marker-icon.js
 */
const defaultIcon = L.divIcon({
	html: `<div class="leaflet-svg fallback">${fallbackMarkerSvg}</div>`,
	className: 'leaflet-custom-icon--inline-svg',
	iconSize: [44, 44],
	iconAnchor: [12, 32],
	popupAnchor: [0, -28],
});

/**
 * Ensure global namespace exists
 */
if (!window.openkaarten) {
	window.openkaarten = {};
}

/**
 * Internal state container
 */
const state = {
	map: null,
	layers: new Map(),
};

/**
 * Registers the Leaflet map instance. Called from the Vue Map component.
 *
 * @param {L.Map} mapInstance
 */
window.openkaarten.registerMap = (mapInstance) => {
	if (!mapInstance) return;

	state.map = mapInstance;
	window.openkaarten.map = mapInstance;
};

/**
 * Adds a marker to the map
 */
window.openkaarten.addMarker = ({
	lat,
	lng,
	popup,
	markerOptions = {},
	flyTo = false,
	flyToOptions = {},
	layer = 'default',
	onAdd,
} = {}) => {
	if (!state.map) return null;
	if (typeof lat !== 'number' || typeof lng !== 'number') return null;

	const targetLayer = ensureLayer(layer);
	if (!targetLayer) return null;

	if (!markerOptions.icon) {
		markerOptions.icon = defaultIcon;
	}

	const marker = L.marker([lat, lng], markerOptions);
	targetLayer.addLayer(marker);

	if (popup) {
		marker.bindPopup(popup);
	}

	if (flyTo) {
		const {
			zoom = state.map.getZoom(),
			duration = 1,
			...rest
		} = flyToOptions;

		state.map.flyTo([lat, lng], zoom, {
			animate: true,
			duration,
			...rest,
		});
	}

	if (typeof onAdd === 'function') {
		onAdd(marker, state.map);
	}

	return marker;
};

/**
 * Clears all markers inside a named layer
 */
window.openkaarten.clearLayer = (name = 'default') => {
	const layer = state.layers.get(name);
	if (!layer) return;

	layer.clearLayers();
};

/**
 * Ensures a named LayerGroup exists. If it does not exist yet, it will be created
 * and added to the map.
 */
const ensureLayer = (name = 'default') => {
	if (!state.map) return null;

	if (!state.layers.has(name)) {
		const layerGroup = L.layerGroup().addTo(state.map);
		state.layers.set(name, layerGroup);
	}

	return state.layers.get(name);
};
