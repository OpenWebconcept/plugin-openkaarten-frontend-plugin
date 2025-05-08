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
const mapRef = ref(null);
const clusters = ref([]);
const searchQuery = ref('');
const resultsCount = ref(0);
const lastSearchMarker = ref(null);
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
		maximumZoom: 18,
		defaultZoom: 10,
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

			if (dataset.features.constructor !== Array) {
				dataset.features = [dataset.features];
			}

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

			const title = 'Lijst';
			btn.title = title;
			btn.innerHTML = makeListViewButtonHTML(title, props.primaryColor);

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

// Add search handler
const handleSearch = async (query) => {
  searchQuery.value = query;
  const map = mapRef.value;

  if (!map || !query) return;

  try {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    );
    const results = await response.json();

    if (results.length > 0) {
      const { lat, lon } = results[0]; // Take the first (most relevant) match.
      const latLng = L.latLng(parseFloat(lat), parseFloat(lon));
      const targetIcon = L.icon({
        iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII=',
        iconSize: [15, 24],
        iconAnchor: [0, 24],
        popupAnchor: [8, -7]
      });

      if (map && map._loaded) {
        map.once('zoomend', () => {
          if (lastSearchMarker.value) {
            map.removeLayer(lastSearchMarker.value);
          }
          const targetMarker = L.marker(latLng, { icon: targetIcon });
          targetMarker.addTo(map);
          targetMarker.bindPopup("Gevonden locatie");
          lastSearchMarker.value = targetMarker;
        });
        map.flyTo(latLng, 15, { animate: true, duration: 1 });
      }
      resultsCount.value = results.length ? 1 : 0
    }
  } catch (error) {
    console.error("Error in retrieving location:", error);
  }
};
</script>

<template v-cloak>
	<div
		class="owc-openkaarten-streetmap__map"
	>
		<div class="owc-openkaarten-streetmap__controls">
			<BaseSearchInput
        :placeholder="'Zoek op straat en/of plaats of postcode'"
				:primary-color="primaryColor"
        :results-count="resultsCount"
				@search="handleSearch"
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
      --owc-openkaarten-streetmap--cluster-color: #328725;
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
      &-0072B2 {
        --owc-openkaarten-streetmap--cluster-color: #0072B2;
      }
      &-9D6D00 {
        --owc-openkaarten-streetmap--cluster-color: #9D6D00;
      }
      &-C15500 {
        --owc-openkaarten-streetmap--cluster-color: #C15500;
      }
      &-008661 {
        --owc-openkaarten-streetmap--cluster-color: #008661;
      }
      &-7E7722 {
        --owc-openkaarten-streetmap--cluster-color: #7E7722;
      }
      &-A26085 {
        --owc-openkaarten-streetmap--cluster-color: #A26085;
      }
      &-3B7BA0 {
        --owc-openkaarten-streetmap--cluster-color: #3B7BA0;
      }
      &-A0522D {
        --owc-openkaarten-streetmap--cluster-color: #A0522D;
      }
      &-757575 {
        --owc-openkaarten-streetmap--cluster-color: #757575;
      }
      &-000000 {
        --owc-openkaarten-streetmap--cluster-color: #000000;
      }
      &-555555 {
        --owc-openkaarten-streetmap--cluster-color: #555555;
      }
      &-003366 {
        --owc-openkaarten-streetmap--cluster-color: #003366;
      }
      &-4B0082 {
        --owc-openkaarten-streetmap--cluster-color: #4B0082;
      }
		}

		&__count {
			font-weight: bold;
		}
	}

	&__map {
    padding-top: 80px;
		position: relative;
		overflow: hidden;
    @media only screen and (min-width: 768px) {
      padding-top: 0;
    }
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
					border: 4px solid #0072B2;
					transform: rotate(-45deg);
					img {
						transform: rotate(45deg);
					}
          &-0072B2 {
            border: 4px solid #0072B2;
          }
          &-9D6D00 {
            border: 4px solid #9D6D00;
          }
          &-C15500 {
            border: 4px solid #C15500;
          }
          &-008661 {
            border: 4px solid #008661;
          }
          &-7E7722 {
            border: 4px solid #7E7722;
          }
          &-A26085 {
            border: 4px solid #A26085;
          }
          &-3B7BA0 {
            border: 4px solid #3B7BA0;
          }
          &-A0522D {
            border: 4px solid #A0522D;
          }
          &-757575 {
            border: 4px solid #757575;
          }
          &-000000 {
            border: 4px solid #000000;
          }
          &-555555 {
            border: 4px solid #555555;
          }
          &-003366 {
            border: 4px solid #003366;
          }
          &-4B0082 {
            border: 4px solid #4B0082;
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
		inset-inline-start: 10px;
		z-index: 1000;
		display: flex;
		gap: 0.5rem;
		width: 100%;
    @media only screen and (min-width: 768px) {
      inset-inline-start: 20px;
      max-inline-size: min(300px, calc(100% - 2rem));
    }
    @media only screen and (min-width: 900px) {
      max-inline-size: min(450px, calc(100% - 2rem));
    }
	}
}
</style>
