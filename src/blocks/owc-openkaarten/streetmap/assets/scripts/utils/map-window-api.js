import L from 'leaflet'; // eslint-disable-line import/no-unresolved

if (!window.openkaarten) {
	window.openkaarten = {};
}

const store = {
	maps: {},
	apis: {},
};

/**
 * Register map (called from Vue)
 */
window.openkaarten.registerMap = (mapId, mapInstance) => {
	if (!mapId || !mapInstance) return;

	store.maps[mapId] = mapInstance;
	store.apis[mapId] = createMapAPI(mapId, mapInstance);
};

/**
 * Get map API
 */
window.openkaarten.getMap = (mapId) => {
	return store.apis[mapId] || null;
};

/**
 * Create per-map API
 */
const createMapAPI = (mapId, map) => {
	const layers = new Map();

	const ensureLayer = (name = 'default') => {
		if (!layers.has(name)) {
			const layerGroup = L.layerGroup().addTo(map);
			layers.set(name, layerGroup);
		}
		return layers.get(name);
	};

	const addMarker = ({
		lat,
		lng,
		popup,
		markerOptions = {},
		flyTo = false,
		flyToOptions = {},
		layer = 'default',
		onAdd,
	} = {}) => {
		if (typeof lat !== 'number' || typeof lng !== 'number') {
			return null;
		}

		const targetLayer = ensureLayer(layer);

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

	const removeLayer = (name) => {
		const layer = layers.get(name);
		if (!layer) return;

		map.removeLayer(layer);
		layers.delete(name);
	};

	const clearLayer = (name = 'default') => {
		const layer = layers.get(name);
		if (!layer) return;

		layer.clearLayers();
	};

	const destroy = () => {
		layers.forEach(layer => {
			map.removeLayer(layer);
		});
		layers.clear();
	};

	return {
		map,
		addMarker,
		removeLayer,
		clearLayer,
		destroy,
	};
};

