<script setup>
import {defineProps, onMounted, ref, nextTick} from 'vue';
import BaseAlert from './BaseAlert.vue';
import BaseLoader from './BaseLoader.vue';
import TheMap from './TheMap.vue';
import ListViewResults from './ListView.vue';

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
const username = ref(null)
const password = ref(null)
const datasets = ref([]);
const primaryColor = ref('#328725');

const showListView = ref(false);

// Move selectedDatasets to App.vue
const selectedDatasets = ref([]);

// Initialize selectedDatasets when datasets are loaded
const initializeSelectedDatasets = () => {
  selectedDatasets.value = datasets.value.map(d => d.id);
};

// Add datasetChange handler
const handleDatasetChange = (id, checked) => {
  if (!id) return null;
  
  if (checked) {
    const dataLayers = selectedDatasets.value;
    dataLayers.push(id);
    selectedDatasets.value = dataLayers;
  } else {
    selectedDatasets.value = selectedDatasets.value.filter((i) => i !== id);
  }
};

const containerRef = ref(null);

// Function to toggle the view and set focus
const toggleViewAndFocus = () => {
  showListView.value = !showListView.value;
  nextTick(() => {
    if (containerRef.value) {
      containerRef.value.focus();
    }
  });
};

/**
 * Fetch locations based on dataset IDs.
 *
 * @returns {Promise<void>}
 */
async function getLocations() {
  loading.value = true;

  if (!props.endpoint) {
    console.error("Error: Endpoint URL is missing.");
    error.value = "Endpoint URL is not defined.";
    loading.value = false;
    return;
  }

  try {
    new URL(props.endpoint); // Ensure props.endpoint is valid.
  } catch (error) {
    console.error("Invalid endpoint URL:", error);
    error.value = "Endpoint URL is invalid.";
    loading.value = false;
    return;
  }

  if (props.datasetIds.length > 0) {
    const url = stripCredentialsFromUrl(props.endpoint);

    if (!url) {
      console.error("Invalid endpoint after stripping credentials.");
      error.value = "Invalid endpoint URL after credential removal.";
      loading.value = false;
      return;
    }

    const proxyPayload = {
      url: `${url}/datasets?include=${JSON.parse(props.datasetIds)}`,
      username: username.value,
      password: password.value
    };

    await fetch('/wp-json/openkaarten-frontend-plugin/v1/proxy-datasets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(proxyPayload)
    })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Proxy error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          // Check if data is a string and might need additional parsing.
          if (typeof data === "string") {
            try {
              data = JSON.parse(data);  // Parse again if it's a JSON string.
            } catch (error) {
              datasets.value = ([]);
              return;
            }
          }

          if (data && data.type === "DatasetCollection" && Array.isArray(data.datasets)) {
            datasets.value = data.datasets;
            initializeSelectedDatasets(); // Initialize after datasets are loaded
          } else {
            console.error("Unexpected response format or 'datasets' is not an array.");
            datasets.value = ([]);  // Fallback to empty array if structure is unexpected.
          }
          loading.value = false;
        })
        .catch((err) => {
          console.error("Error in proxy response:", err);
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
    // Update username and password directly on the reactive references.
    username.value = parsedUrl.username;
    password.value = parsedUrl.password;

    // If the URL contains credentials, strip them.
    if (parsedUrl.username || parsedUrl.password) {
      parsedUrl.username = '';
      parsedUrl.password = '';
    }

    return parsedUrl.toString();  // Return the URL without credentials.
  } catch (error) {
    console.error("Invalid URL provided:", error);
    return url;  // Return the original URL if parsing fails.
  }
}

onMounted(() => {
  getLocations();
});
</script>

<template v-if="endpoint">
  <div
    class="owc-openkaarten-streetmap-container"
    ref="containerRef"
    tabindex="-1"
  >
    <BaseAlert v-if="error" type="error" :message="error"/>
    <section
        class="owc-openkaarten-streetmap__results"
        :class="{ 'owc-openkaarten-streetmap__results--loading': loading }"
        aria-live="polite"
        aria-atomic="true"
    >
      <BaseLoader :loading="loading"/>
      <TheMap
          v-if="!loading && !showListView"
          title="map"
          :datasets="datasets"
          :selectedDatasets="selectedDatasets"
          :tileLayerUri="tileLayerUri"
          :primaryColor="primaryColor"
          @toggleView="toggleViewAndFocus"
          @datasetChange="handleDatasetChange"
      />
      <ListViewResults
          v-if="!loading && showListView"
          :datasets="datasets"
          :selectedDatasets="selectedDatasets"
          :primaryColor="primaryColor"
          @toggleView="toggleViewAndFocus"
          @datasetChange="handleDatasetChange"
      />
    </section>
  </div>
</template>

<style lang="scss">
#owc-openkaarten-streetmap {
  container-type: inline-size;
  max-width: 100%;
}

.owc-openkaarten-streetmap-container:focus,
.owc-openkaarten-streetmap__results:focus {
  outline: none !important;
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
