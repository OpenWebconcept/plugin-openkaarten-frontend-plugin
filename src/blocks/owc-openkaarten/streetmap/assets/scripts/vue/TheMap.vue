<script setup>
import { ref, onMounted, computed } from 'vue';
import L from 'leaflet';
import BaseFilters from './BaseFilters.vue';
import BaseTooltipCard from './BaseTooltipCard.vue';
import { calculateBounds } from '../utils/calculate-bounds';
import { calculateCenter } from '../utils/calculate-center';
import { makeMarkerCluster } from '../utils/make-marker-cluster';
import { makeMarkerIcon } from '../utils/make-marker-icon';
import { makeTooltipCard } from '../utils/make-tooltip-card';
import { makeFilterButtonHTML } from '../utils/make-filter-button-html';
import { makeListViewButtonHTML } from '../utils/make-list-view-button-html';
import BaseSearchInput from './BaseSearchInput.vue';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';

const props = defineProps({
	datasets: {
		type: Array,
		default: () => [],
	},
	selectedDatasets: {
		type: Array,
		required: true
	},
	primaryColor: {
		type: String,
		required: true,
		default: '#328725',
	},
	tileLayerUri: {
		type: String,
		required: true,
	},
});

const tooltipCard = ref(null);
const showFiltersCard = ref(false);
const datasetLocations = ref([]);
const mapRef = ref(null);
const clusters = ref([]);
const showListView = ref(false);
const searchQuery = ref('');
const searchMarkers = ref([]);
const clusterOptions = {
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  maxClusterRadius: 40,
  disableClusteringAtZoom: 13,
  iconCreateFunction: (cluster) => {
    const count = cluster.getChildCount();
    return L.divIcon({
      html: `
        <div class="owc-openkaarten-streetmap__cluster-group">
          <div class="owc-openkaarten-streetmap__cluster-group__circle">
            <span class="owc-openkaarten-streetmap__cluster-group__count">${count}</span>
          </div>
        </div>
      `,
      className: '',
      iconSize: L.point(40, 40),
    });
  },
};

const locationAddresses = ref(new Map());

const closeTooltipCard = () => {
	tooltipCard.value = null;
	document.getElementById('dataset-map')?.focus();
};

const closeFilters = () => {
	showFiltersCard.value = false;
};

const datasetChange = (id, checked) => {
	if (!id) return null;
	emit('datasetChange', id, checked);
	const map = mapRef.value;
	const layers = clusters.value;
	const datalayerCluster = layers.find(
		(layer) => layer.id === id
	)?.cluster;
	const existsOnMap = map.hasLayer(datalayerCluster);
	if (checked) {
		if (existsOnMap) return null;
		map.addLayer(datalayerCluster);
	} else {
		map.removeLayer(datalayerCluster);
	}
};

// Move attachEvents outside of initializeMap
const attachEvents = (marker, location, set) => {
	marker.on('click', () => {
		tooltipCard.value = makeTooltipCard(location, set);
	});
	marker.on('keydown', ({ originalEvent }) => {
		if (originalEvent.keyCode === 13) {
			tooltipCard.value = makeTooltipCard(location, set);
		}
	});
};

// Helper function to get coordinates from feature
const getLatLng = (feature) => {
  const coords = feature.geometry.coordinates;
  return L.latLng(coords[1], coords[0]);
};

// Helper function to get color from marker config
const getColorFromMarker = (markerConfig) => {
  if (!markerConfig) return props.primaryColor;
  
  // If marker has a custom color, use that
  if (markerConfig.color) return markerConfig.color;
  
  // If marker has a custom icon with color, use that
  if (markerConfig.icon?.color) return markerConfig.icon.color;
  
  return props.primaryColor;
};

// Helper function to create appropriate layer based on feature type
const createLayer = (feature, dataset) => {
  if (feature.geometry.type === 'Polygon') {
    return new L.GeoJSON(feature, {
      style: () => {
        const color = getColorFromMarker(feature.properties?.marker);
        return {
          color: color,
          fillColor: color,
          fillOpacity: 0.2,
          weight: 2
        };
      }
    });
  }
  
  // Handle MultiPoint features
  if (feature.geometry.type === 'MultiPoint') {
    const markers = L.featureGroup();
    feature.geometry.coordinates.forEach(coord => {
      const latlng = L.latLng(coord[1], coord[0]);
      const icon = makeMarkerIcon(L, {
        marker: feature.properties?.marker,
        defaultColor: props.primaryColor,
      });
      const marker = new L.Marker(latlng, { icon });
      markers.addLayer(marker);
    });
    return markers;
  }

  // Handle regular points using GeoJSON
  return new L.GeoJSON(feature, {
    pointToLayer: (feature, latlng) => {
      const icon = makeMarkerIcon(L, {
        marker: feature.properties?.marker,
        defaultColor: props.primaryColor,
      });
      return new L.Marker(latlng, { icon });
    }
  });
};

const initializeMap = (datasets) => {
	const bounds = calculateBounds(datasets);
	const { lat, long } = calculateCenter(bounds);

	const config = {
		centerX: lat,
		centerY: long,
		minimumZoom: 4,
		maximumZoom: 16,
		defaultZoom: 13,
		enableHomeControl: true,
		enableZoomControl: true,
		enableBoxZoomControl: true,
		maxBounds: [
			[bounds.minLat, bounds.minLong],
			[bounds.maxLat, bounds.maxLong],
		],
	};

	const map = new L.Map('dataset-map', {
		center: [config.centerX, config.centerY],
		zoom: config.defaultZoom,
		minZoom: config.minimumZoom,
		maxZoom: config.maximumZoom,
		zoomControl: config.enableZoomControl,
		boxZoom: config.enableBoxZoomControl,
		defaultExtentControl: config.enableHomeControl,
	});
	map.setView([config.centerX, config.centerY], config.defaultZoom);

	const groupedMarkerClusters = datasets
		.filter((dataset) => props.selectedDatasets.includes(dataset.id))
		.map((dataset) => {
			// Create a pane for this dataset
			const pane = map.createPane(dataset.title.replace(' ', '_'));
			const cluster = L.markerClusterGroup({
				...clusterOptions,
				clusterPane: pane
			});
			
			dataset.features.forEach((feature) => {
				const layer = createLayer(feature, dataset);
				attachEvents(layer, feature, dataset);
				cluster.addLayer(layer);
			});

			return {
				id: dataset.id,
				cluster,
			};
		});

	L.Control.DataLayerFilters = L.Control.extend({
		options: {
			position: 'topleft',
		},
		onAdd: function () {
			const btn = L.DomUtil.create(
				'button',
				'leaflet-control-filters'
			);
			L.DomEvent.addListener(
				btn,
				'click',
				L.DomEvent.stopPropagation
			)
				.addListener(btn, 'click', L.DomEvent.preventDefault)
				.addListener(btn, 'click', function () {
					showFiltersCard.value = !showFiltersCard.value;
				});

			const title = 'Filter';
			btn.title = title;
			btn.innerHTML = makeFilterButtonHTML(
				'Filter',
				props.primaryColor
			);

			return btn;
		},
	});

	L.Control.ListViewToggle = L.Control.extend({
		options: {
			position: 'topleft',
		},
		onAdd: function () {
			const btn = L.DomUtil.create('button', 'leaflet-control-list-view');
			L.DomEvent.addListener(btn, 'click', L.DomEvent.stopPropagation)
				.addListener(btn, 'click', L.DomEvent.preventDefault)
				.addListener(btn, 'click', function () {
					emit('toggleView');
				});

			const title = 'Lijst weergave';
			btn.title = title;
			btn.innerHTML = makeListViewButtonHTML('Lijst weergave', props.primaryColor);

			return btn;
		},
	});

	const tileLayerUri = new L.TileLayer(props.tileLayerUri);
	const datalayerFilters = new L.Control.DataLayerFilters();
	const listViewToggle = new L.Control.ListViewToggle();

	map.addLayer(tileLayerUri);
	map.addControl(listViewToggle);
	if (groupedMarkerClusters?.length > 1) {
		map.addControl(datalayerFilters);
	}

	groupedMarkerClusters.forEach(({ cluster }) => {
		map.addLayer(cluster);
	});
	clusters.value = groupedMarkerClusters;
	mapRef.value = map;
};

const emit = defineEmits(['toggleView', 'datasetChange']);

onMounted(async () => {
	if (document.getElementById('dataset-map')) {
		initializeMap(props.datasets);
	}
});

const filteredLocations = computed(() => {
	if (!searchQuery.value) return [];

	const query = searchQuery.value.toLowerCase();
	return props.datasets
		.filter(dataset => props.selectedDatasets.includes(dataset.id))
		.flatMap(dataset => dataset.features.map(feature => {
			const tooltipData = feature.properties?.tooltip || [];
			const coords = feature.geometry.coordinates;
			
			// Collect all searchable text
			const searchableText = [
				// Tooltip data
				tooltipData.find(t => t.layout === 'meta')?.meta,
				tooltipData.find(t => t.layout === 'title')?.title,
				tooltipData.find(t => t.layout === 'text')?.text,
				// Location data
				feature.properties?.name,
				feature.properties?.description,
				// Coordinates (formatted for search)
				coords ? `${coords[1]},${coords[0]}` : null
			]
				.filter(Boolean) // Remove null/undefined values
				.join(' ')
				.toLowerCase();

			return {
				...feature,
				datasetId: dataset.id,
				matches: searchableText.includes(query)
			};
		}))
		.filter(location => location.matches);
});

// Add search handler
const handleSearch = (query) => {
	searchQuery.value = query;
	const map = mapRef.value;
	
	if (!map) return;
	
	// Clear existing search markers
	searchMarkers.value.forEach(marker => {
		if (marker && map.hasLayer(marker)) {
			map.removeLayer(marker);
		}
	});
	searchMarkers.value = [];

	if (!query) {
		// Show all markers again when search is cleared
		clusters.value.forEach(({ cluster }) => {
			if (cluster && !map.hasLayer(cluster)) {
				map.addLayer(cluster);
			}
		});
		return;
	}

	// Hide all regular markers
	clusters.value.forEach(({ cluster }) => {
		if (cluster && map.hasLayer(cluster)) {
			map.removeLayer(cluster);
		}
	});

	// Create markers for search results and zoom to bounds
	const searchBounds = L.latLngBounds();
	let hasValidResults = false;

	filteredLocations.value.forEach(location => {
		if (location?.geometry?.coordinates) {
			if (location.geometry.type === 'MultiPoint') {
				location.geometry.coordinates.forEach(coord => {
					if (Array.isArray(coord) && coord.length >= 2) {
						const latlng = L.latLng(coord[1], coord[0]);
						addSearchMarker(latlng, location);
						searchBounds.extend(latlng);
						hasValidResults = true;
					}
				});
			} else {
				const coords = location.geometry.coordinates;
				if (Array.isArray(coords) && coords.length >= 2) {
					const latlng = L.latLng(coords[1], coords[0]);
					addSearchMarker(latlng, location);
					searchBounds.extend(latlng);
					hasValidResults = true;
				}
			}
		}
	});

	if (hasValidResults) {
		// Zoom to results with padding
		map.fitBounds(searchBounds, {
			padding: [50, 50],
			maxZoom: 15
		});
	}
};

// Helper function to add search result markers
const addSearchMarker = (latlng, location) => {
	const map = mapRef.value;
	if (!map || !latlng || !location) return;

	try {
		const icon = makeMarkerIcon(L, {
			marker: location.properties?.marker,
			defaultColor: props.primaryColor,
		});

		const marker = new L.Marker(latlng, { 
			icon,
			zIndexOffset: 1000 // Ensure search results appear above other markers
		});
		
		if (marker) {
			attachEvents(marker, location, { id: location.datasetId });
			marker.addTo(map);
			searchMarkers.value.push(marker);
		}
	} catch (error) {
		console.error('Error adding search marker:', error);
	}
};
</script>

<template v-cloak>
	<div
		class="owc-openkaarten-streetmap__map"
		:style="{
			'--owc-openkaarten-streetmap--primary-color': primaryColor,
			'--owc-openkaarten-streetmap--cluster-color': props.primaryColor,
		}"
	>
		<div class="owc-openkaarten-streetmap__controls">
			<BaseSearchInput 
				:primary-color="primaryColor"
				@search="handleSearch"
				:results-count="filteredLocations.length"
			/>
		</div>
		<div id="dataset-map"></div>
		<Transition name="fade">
			<div
				v-if="showFiltersCard"
				class="owc-openkaarten-streetmap__overlay"
			></div>
		</Transition>
		<Transition name="slide">
			<BaseFilters
				v-if="datasets && datasets.length > 1 && showFiltersCard"
				:open="showFiltersCard"
				:datasets="datasets.filter((set) => set.features.length)"
				:selectedDatasets="selectedDatasets"
				:primaryColor="primaryColor"
				@closeFilters="closeFilters"
				@datasetChange="datasetChange"
			/>
		</Transition>
		<BaseTooltipCard
			v-if="tooltipCard"
			:key="tooltipCard.datasetId"
			:id="tooltipCard.datasetId"
			:title="tooltipCard.locationTitle"
			:meta="tooltipCard.meta"
			:text="tooltipCard.text"
			:button="tooltipCard.button"
			:image="tooltipCard.image"
			:properties="tooltipCard.properties"
			:primaryColor="primaryColor"
			@closeCard="closeTooltipCard"
		/>
	</div>
</template>

<style lang="scss">
#dataset-map {
	height: 80dvh;
	max-height: 661px;
	width: 100%;
}

.owc-openkaarten-streetmap {
	&__results {
		display: flex;
		flex-direction: column;
		gap: 8px;
		grid-area: results;

		&--loading {
			display: flex;
			justify-content: center;
			min-height: 30dvh;
			place-items: center;
			svg {
				max-width: 3rem;
			}
		}
	}
	&__cluster-group {
		border-radius: 50%;

		&__circle {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			border-radius: 50%;
			display: flex !important;
			justify-content: center !important;
			align-items: center !important;
			--owc-cluster-background: color-mix(
				in srgb,
				var(--owc-openkaarten-streetmap--cluster-color),
				rgba(255, 255, 255, 0.05) 75%
			);
			background: var(--owc-cluster-background);
		}

		&__count {
			font-weight: bold;
		}
	}

	&__map {
		position: relative;
		overflow: hidden;
		.leaflet-marker-icon {
			&:focus-visible {
				border-radius: 50%;
				outline-color: var(--owc-openkaarten-streetmap--primary-color);
				aspect-ratio: 1 / 1;
			}
		}

		.leaflet-custom-icon {
			&--hosted-svg {
				.leaflet-svg {
					width: 32px;
					height: 32px;
					padding: 2px;
					border-radius: 50% 50% 50% 0;
					background-color: #fff;
					border: 4px solid var(--l-icon-color);
					transform: rotate(-45deg);
					img {
						transform: rotate(45deg);
					}
				}
			}
		}
	}

	&__overlay {
		background-color: var(--owc-map-overlay, rgba(0, 0, 0, 0.25));
		position: absolute;
		content: '';
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 999;
	}

	.fade-enter-active,
	.fade-leave-active {
		transition: opacity 0.2s ease-in-out;
	}

	.fade-enter-from,
	.fade-leave-to {
		opacity: 0;
	}

	.slide-enter-active,
	.slide-leave-active {
		transform: translateX(0);
		transition: transform 0.2s ease-in-out;
	}

	.slide-enter-from,
	.slide-leave-to {
		transform: translateX(120%);
	}

	&__controls {
		position: absolute;
		inset-block-start: 20px;
		inset-inline-start: 20px;
		z-index: 1000;
		display: flex;
		gap: 0.5rem;
		max-width: min(450px, calc(100% - 2rem));
		width: 100%;
	}
}
</style>
