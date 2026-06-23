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
 *
 * `map` keeps tracking the most recently registered map (unchanged behaviour),
 * `maps` is a new registry of every map on the page, and `layers` holds the
 * named LayerGroups per map instance so multiple maps don't share layers.
 */
const state = {
	map: null,
	maps: [],
	layers: new WeakMap(),
};

/**
 * Registers the Leaflet map instance. Called from the Vue Map component.
 *
 * Backwards compatible: `window.openkaarten.map` still points at the last
 * registered map. Additionally every map is collected in
 * `window.openkaarten.maps` so callers can target a specific map on pages with
 * more than one.
 *
 * @param {L.Map} mapInstance The Leaflet map instance.
 */
window.openkaarten.registerMap = (mapInstance) => {
	if (!mapInstance) return;

	if (!state.maps.includes(mapInstance)) {
		state.maps.push(mapInstance);
	}

	// Unchanged behaviour: `.map` tracks the most recently registered map.
	state.map = mapInstance;
	window.openkaarten.map = mapInstance;
	window.openkaarten.maps = state.maps;
};

/**
 * Adds a marker to a map.
 *
 * Pass `options.map` to target a specific map instance; it defaults to the most
 * recently registered map, so existing single-map callers keep working.
 */
window.openkaarten.addMarker = ({
	lat,
	lng,
	popup,
	markerOptions = {},
	flyTo = false,
	flyToOptions = {},
	layer = 'default',
	map = state.map,
	onAdd,
} = {}) => {
	if (!map) return null;
	if (typeof lat !== 'number' || typeof lng !== 'number') return null;

	const targetLayer = ensureLayer(layer, map);
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
			zoom = map.getZoom(),
			duration = 1,
			...rest
		} = flyToOptions;

		map.flyTo([lat, lng], zoom, {
			animate: true,
			duration,
			...rest,
		});
	}

	if (typeof onAdd === 'function') {
		onAdd(marker, map);
	}

	return marker;
};

/**
 * Clears all markers inside a named layer.
 *
 * @param {string} [name] The layer name.
 * @param {L.Map}  [map]  Target map; defaults to the most recently registered map.
 */
window.openkaarten.clearLayer = (name = 'default', map = state.map) => {
	if (!map) return;

	const mapLayers = state.layers.get(map);
	if (!mapLayers) return;

	const layer = mapLayers.get(name);
	if (!layer) return;

	layer.clearLayers();
};

/**
 * Ensures a named LayerGroup exists on the given map. If it does not exist yet,
 * it will be created and added to that map. Layers are tracked per map instance.
 *
 * @param {string} [name] The layer name.
 * @param {L.Map}  [map]  Target map; defaults to the most recently registered map.
 */
const ensureLayer = (name = 'default', map = state.map) => {
	if (!map) return null;

	if (!state.layers.has(map)) {
		state.layers.set(map, new Map());
	}

	const mapLayers = state.layers.get(map);

	if (!mapLayers.has(name)) {
		const layerGroup = L.layerGroup().addTo(map);
		mapLayers.set(name, layerGroup);
	}

	return mapLayers.get(name);
};
