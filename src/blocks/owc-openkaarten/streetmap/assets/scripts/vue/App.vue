<script setup>
import {defineProps, onMounted, ref} from 'vue';
import BaseAlert from './BaseAlert.vue';
import BaseLoader from './BaseLoader.vue';
import TheMap from './TheMap.vue';

/**
 * Props.
 * @type {Readonly<{ endpoint: string, datasetIds: Array, tileLayerUri: string, username: string, password: string }>}
 */
const props = defineProps({
  endpoint: {
    type: String,
    default: '',
    required: true,
  },
  datasetIds: {
    type: Array,
    default: () => [],
  },
  tileLayerUri: {
    type: String,
    default: 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
    required: true,
  },
});

const error = ref(null);
const loading = ref(false);

// Fetched data & default values
const datasets = ref([]);
const primaryColor = ref('#328725');

/**
 * Fetch locations based on dataset IDs.
 *
 * @returns {Promise<void>}
 */
async function getLocations() {
  loading.value = true;

  if (props.datasetIds.length > 0) {

    const url = new URL(`${stripCredentialsFromUrl(props.endpoint)}/datasets?include=${JSON.parse(props.datasetIds)}`);
    // Basic Authentication header
    const authHeader = `Basic ${btoa(`${props.username}:${props.password}`)}`;

    await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })
        .then((response) => response.json())
        .then((response) => {
          datasets.value = response.datasets;
          if (response.tileLayerUri) {
            tileLayerUri.value = response.tileLayerUri;
          }
          if (response.primaryColor) {
            primaryColor.value = response.primaryColor;
          }
          loading.value = false;
        })
        .catch((err) => {
          error.value = err.message;
          loading.value = false;
        });
  } else {
    loading.value = false;
  }
}

/**
 * Strip credentials from URL.
 *
 * @param {string} url
 * @returns {string}
 */
function stripCredentialsFromUrl(url) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.username || parsedUrl.password) {
      parsedUrl.username = "";
      parsedUrl.password = "";
    }
    return parsedUrl.toString();
  } catch (error) {
    console.error("Invalid URL provided:", error);
    return url;
  }
}

onMounted(() => {
  getLocations();
});
</script>

<template v-if="endpoint">
  <div class="owc-openkaarten-streetmap-container" ref="container">
    <BaseAlert v-if="error" type="error" :message="error"/>
    <section
        class="owc-openkaarten-streetmap__results"
        :class="{ 'owc-openkaarten-streetmap__results--loading': loading }"
        aria-live="polite"
        aria-atomic="true"
    >
      <BaseLoader :loading="loading"/>
      <TheMap
          v-if="!loading"
          title="map"
          :datasets="datasets"
          :tileLayerUri="tileLayerUri"
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
  width: min(calc(100% - 32px), 1440px);
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