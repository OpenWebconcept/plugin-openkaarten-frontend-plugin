import L from 'leaflet';

if (!window.openkaarten) {
	window.openkaarten = {};
}

const state = {
	map: null,
	layers: new Map(),
};

const ensureLayer = (name = 'default') => {
	if (!state.map) return null;

	if (!state.layers.has(name)) {
		const layerGroup = L.layerGroup().addTo(state.map);
		state.layers.set(name, layerGroup);
	}

	return state.layers.get(name);
};

window.openkaarten.registerMap = (mapInstance) => {
	if (!mapInstance) return;

	state.map = mapInstance;
	window.openkaarten.map = mapInstance;
};

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

window.openkaarten.clearLayer = (name = 'default') => {
	const layer = state.layers.get(name);
	if (!layer) return;

	layer.clearLayers();
};
