<template v-cloak>
	<div
		class="owc-openkaarten-streetmap__map"
		:style="{
			'--owc-openkaarten-streetmap--primary-color': primaryColor,
		}"
	>
		<div id="dataset-map"></div>
		<Transition name="fade">
			<div
				v-if="showFiltersCard"
				class="owc-openkaarten-streetmap__overlay"
			></div>
		</Transition>
		<Transition name="slide">
			<BaseMapFilters
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
			:properties="tooltipCard.properties"
			:primaryColor="primaryColor"
			@closeCard="closeTooltipCard"
		/>
	</div>
</template>

<script>
import { ref, onMounted } from 'vue';
import L from 'leaflet';
import BaseMapFilters from './BaseMapFilters.vue';
import BaseTooltipCard from './BaseTooltipCard.vue';
import { calculateBounds } from '../utils/calculate-bounds';
import { calculateCenter } from '../utils/calculate-center';
import { makeMarkerCluster } from '../utils/make-marker-cluster';
import { makeMarkerIcon } from '../utils/make-marker-icon';
import { makeTooltipCard } from '../utils/make-tooltip-card';
import { makeFilterButtonHTML } from '../utils/make-filter-button-html';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';

export default {
	props: {
		datasets: {
			type: Array,
			default: () => [],
		},
		primaryColor: {
			type: String,
			required: true,
			default: '#328725',
		},
		mapStyles: {
			type: String,
			required: true,
		},
	},

	components: {
		BaseMapFilters,
		BaseTooltipCard,
	},

	setup(props) {
		const tooltipCard = ref(null);
		const showFiltersCard = ref(false);
		const selectedDatasets = ref(props.datasets.map(({ id }) => id));
		const datasetLocations = ref([]);
		const mapRef = ref(null);
		const clusters = ref([]);

		const closeTooltipCard = () => {
			tooltipCard.value = null;
			document.getElementById('dataset-map')?.focus();
		};

		const closeFilters = () => {
			showFiltersCard.value = false;
		};

		const datasetChange = (id, checked) => {
			if (!id) return null
			if (checked) {
				const dataLayers = selectedDatasets.value;
				dataLayers.push(id);
				selectedDatasets.value = dataLayers;
			} else {
				selectedDatasets.value = selectedDatasets.value.filter(
					(i) => i !== id
				);
			}
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

		const initializeMap = (datasets) => {
			const bounds = calculateBounds(datasets);
			const { lat, long } = calculateCenter(bounds);

			const config = {
				centerX: lat,
				centerY: long,
				minimumZoom: 4,
				maximumZoom: 16,
				defaultZoom: 8,
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

			const groupedMarkerClusters = datasets.map((set) => {
				const pane = map.createPane(set.title.replace(' ', '_'));
				const cluster = makeMarkerCluster({
					disableClusteringAtZoom: 13,
					maxClusterRadius: 40,
					showCoverageOnHover: false,
					sizeMultiplier: 4,
					clusterPane: pane,
					color:
						set.features[0]?.properties?.marker?.color ||
						props.primaryColor,
				});

				set.features.forEach((location) => {
					const icon = makeMarkerIcon(L, {
						marker: location.properties?.marker,
						defaultColor: props.primaryColor,
					});

					const marker = new L.Marker(location.geometry.coordinates, {
						icon,
					});
					marker.on('click', () => {
						tooltipCard.value = makeTooltipCard(location, set);
					});
					marker.on('keydown', ({ originalEvent }) => {
						if (originalEvent.keyCode === 13) {
							tooltipCard.value = makeTooltipCard(location, set);
						}
					});
					cluster.addLayer(marker);
				});

				return {
					id: set.id,
					title: set.title,
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

			const mapStyles = new L.TileLayer(props.mapStyles);
			const datalayerFilters = new L.Control.DataLayerFilters();

			map.addLayer(mapStyles);
			if (groupedMarkerClusters?.length > 1) {
				map.addControl(datalayerFilters);
			}
			groupedMarkerClusters.forEach(({ cluster }) => {
				map.addLayer(cluster);
			});
			clusters.value = groupedMarkerClusters;
			mapRef.value = map;
		};

		onMounted(() => {
			if (document.getElementById('dataset-map')) {
				initializeMap(props.datasets);
			}
		});

		return {
			datasetLocations,
			selectedDatasets,
			tooltipCard,
			closeTooltipCard,
			showFiltersCard,
			closeFilters,
			datasetChange,
		};
	},
};
</script>

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
					width: 24px;
					height: 24px;
					padding: 4px;
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
		transition: opacity 0.5s ease-in-out;
	}

	.fade-enter-from,
	.fade-leave-to {
		opacity: 0;
	}

	.slide-enter-active,
	.slide-leave-active {
		transform: translateX(0);
		transition: transform 0.5s ease-in-out;
	}

	.slide-enter-from,
	.slide-leave-to {
		transform: translateX(120%);
	}
}
</style>
