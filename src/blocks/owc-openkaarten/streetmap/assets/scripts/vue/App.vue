<script setup>
import { defineProps, onMounted, ref } from 'vue';
import BaseAlert from './BaseAlert.vue';
import BaseLoader from './BaseLoader.vue';
import TheMap from './TheMap.vue';

/**
 * Props.
 * @type {Readonly<ExtractPropTypes<{endpoint: {default: string, type: *, required: boolean}, datasetIds: {default: array, type: *}}
 */
const props = defineProps({
	endpoint: {
		type: String,
		default: '',
		required: true,
	},
	datasetIds: {
		type: Array,
		default: [],
	},
});

const error = ref(null);
const loading = ref(false);

// Fetched data & default values
const datasets = ref([]);
const primaryColor = ref('#328725');
const mapStyles = ref('https://{s}.tile.osm.org/{z}/{x}/{y}.png');

/**
 * Computed properties.
 *
 * @returns {Promise<void>}
 */
async function getLocations() {
	loading.value = true;
	if (props.datasetIds.length > 0) {
		const url = new URL(`${props.endpoint}/datasets?include=${JSON.parse(props.datasetIds)}`);
		await fetch(url.toString())
			.then((response) => response.json())
			.then((response) => {
				datasets.value = response.datasets;
        if (response.mapStyles) {
          mapStyles.value = response.mapStyles
        }
        if (response.primaryColor) {
          primaryColor.value = response.primaryColor
        }
				loading.value = false;
			})
			.catch((error) => {
				error.value = error;
				loading.value = false;
			});
	}
}

onMounted(() => {
	getLocations();
});
</script>

<template v-if="endpoint">
	<div class="owc-openkaarten-streetmap-container" ref="container">
		<BaseAlert v-if="error" type="error" :message="error" />
		<section
			class="owc-openkaarten-streetmap__results"
			:class="{ 'owc-openkaarten-streetmap__results--loading': loading }"
			aria-live="polite"
			aria-atomic="true"
		>
			<BaseLoader :loading="loading" />
			<theMap
				v-if="!loading"
				title="map"
				:datasets="datasets"
				:mapStyles="mapStyles"
				:primaryColor="primaryColor"
			/>
		</section>
	</div>
</template>

<style lang="scss">
#owc-openkaarten-streetmap {
	container-type: inline-size;
	max-width: 100%;
}

.owc-openkaarten-streetmap-container {
	margin-inline: auto;
	width: min(#{calc(100% - 32px)}, 1440px);
}

.owc-openkaarten-streetmap *:focus-visible {
	outline-offset: 0.25em;
}
@container (max-width: 990px) {
	.owc-openkaarten-streetmap__results,
	.owc-openkaarten-streetmap__results-header,
	.owc-openkaarten-streetmap__pagination {
		grid-column: 1 / span 2;
	}
}
</style>
