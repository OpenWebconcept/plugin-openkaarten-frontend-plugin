<script setup>
import { computed, ref, nextTick } from 'vue';
import BaseListCard from './BaseListCard.vue';
import { makeFilterButtonHTML } from '../utils/make-filter-button-html';
import { makeMapButtonHTML } from '../utils/make-map-button-html';
import BaseFilters from './BaseFilters.vue';
import BaseSearchInput from './BaseSearchInput.vue';

const props = defineProps({
  datasets: {
    type: Array,
    required: true,
  },
  selectedDatasets: {
    type: Array,
    required: true,
  },
  primaryColor: {
    type: String,
    required: true,
  },
});

const searchQuery = ref('');

const filteredLocations = computed(() => {
  let locations = props.datasets
    .filter(dataset => props.selectedDatasets.includes(dataset.id))
    .flatMap(dataset => dataset.features?.map(feature => {
      const tooltipData = feature.properties?.tooltip || [];
      const coords = feature.geometry.coordinates;
      
      // Collect all searchable text
      const searchableText = [
        tooltipData.find(t => t.layout === 'meta')?.meta,
        tooltipData.find(t => t.layout === 'title')?.title,
        tooltipData.find(t => t.layout === 'text')?.text,
        feature.properties?.name,
        feature.properties?.description,
        coords ? `${coords[1]},${coords[0]}` : null
      ]
        .filter(Boolean)
        .join(' ');

      return {
        ...feature,
        datasetId: dataset.id,
        datasetTitle: dataset.title,
        title: tooltipData.find(t => t.layout === 'title')?.title || feature.title,
        meta: tooltipData.find(t => t.layout === 'meta')?.meta || '',
        text: tooltipData.find(t => t.layout === 'text')?.text || '',
        searchableText: searchableText.toLowerCase()
      };
    }));

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    locations = locations.filter(location => 
      location.searchableText.includes(query)
    );
  }

  return locations;
});

const emits = defineEmits(['toggleView', 'datasetChange']);

const showFilters = ref(false);

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const toggleView = () => {
  emits('toggleView');
};

const filterButtonHTML = computed(() => makeFilterButtonHTML('Filter', props.primaryColor));
const mapButtonHTML = computed(() => makeMapButtonHTML('Kaart', props.primaryColor));

const handleDatasetChange = (id, checked) => {
  emits('datasetChange', id, checked);
};

const closeFilters = () => {
  showFilters.value = false;
};

const ITEMS_PER_PAGE = 12;
const displayLimit = ref(ITEMS_PER_PAGE);
const listItemRefs = ref([]);

const paginatedLocations = computed(() => {
  return filteredLocations.value.slice(0, displayLimit.value);
});

const hasMoreItems = computed(() => {
  return displayLimit.value < filteredLocations.value.length;
});

const loadMore = () => {
  const newLimit = displayLimit.value + ITEMS_PER_PAGE;
  displayLimit.value = Math.min(newLimit, filteredLocations.value.length);

  nextTick(() => {
    const newItemIndex = displayLimit.value - ITEMS_PER_PAGE;
    const newItemRef = listItemRefs.value[newItemIndex];
    if (newItemRef) {
      newItemRef.focus();
    }
  });
};

const handleSearch = (query) => {
  searchQuery.value = query;
};
</script>

<template>
  <div
    class="list-view"
  >
    <div class="list-view__controls">
      <BaseSearchInput 
        :primary-color="primaryColor"
        :results-count="filteredLocations.length"
        @search="handleSearch"
      />
      <button @click="toggleView" class="list-view__map-button" v-html="mapButtonHTML"></button>
      <button
        v-if="datasets.length > 1"
        @click="toggleFilters"
        class="list-view__filters-button"
        v-html="filterButtonHTML"
      ></button>
    </div>

    <!-- Add fade transition for overlay -->
    <Transition name="fade">
      <div
        v-if="showFilters"
        class="owc-openkaarten-streetmap__overlay"
      ></div>
    </Transition>

    <!-- Add slide transition for filters -->
    <Transition name="slide">
      <BaseFilters
        v-if="showFilters"
        :open="showFilters"
        :datasets="datasets.filter((set) => set.features?.length && !set.features?.every(feature => feature.geometry?.type === 'Polygon'))"
        :selectedDatasets="selectedDatasets"
        :primaryColor="primaryColor"
        @closeFilters="closeFilters"
        @datasetChange="handleDatasetChange"
      />
    </Transition>

    <ul class="list-view__results">
      <li
        v-for="(location, index) in paginatedLocations"
        :key="`${location?.datasetId}-${location?.properties.id}`"
        class="list-view__item"
        :ref="el => { listItemRefs[index] = el }"
        tabindex="0"
      >
        <BaseListCard
          v-if="location"
          :title="location.title || location.datasetTitle"
          :address="location.meta"
          :description="location.text"
          :image="location.image"
          :primaryColor="primaryColor"
        >
          <template #footer>
            <a
              v-if="location.button"
              :href="location.button.button_url"
              class="base-list-card__button"
            >
              <svg aria-hidden="true" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.243 4.41a.833.833 0 0 1 1.178 0l5 5a.833.833 0 0 1 0 1.18l-5 5a.833.833 0 0 1-1.178-1.18l3.577-3.577H4.165a.833.833 0 0 1 0-1.667h9.655L10.243 5.59a.833.833 0 0 1 0-1.178Z" fill="#1261A3"/>
              </svg>
              {{ location.button.button_text }}
              <span class="sr-only">over {{ location.title }}</span>
            </a>
          </template>
        </BaseListCard>
      </li>

      <!-- Add Load More button -->
      <button
        v-if="hasMoreItems"
        @click="loadMore"
        class="list-view__load-more"
      >
        Toon meer resultaten ({{ paginatedLocations.length }} van {{ filteredLocations.length }})
      </button>
    </ul>
  </div>
</template>

<style lang="scss">
.list-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-block-size: 660px;
  padding: 0.25rem;
  position: relative;
  overflow-x: clip;

  &__controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-block-end: 0.5rem;
    @media only screen and (min-width: 768px) {
      justify-content: flex-end;
    }
    button:not([class*="search"]) {
      align-items: center;
      border: 1px solid #328725;
      background-color: #fff;
      border-radius: 3px;
      display: flex;
      justify-content: space-between;
      gap: 8px;
      min-width: 44px;
      min-height: 50px;
      padding: 10px 24px;

      span {
        color: #328725;
        font-size: 20px;
        font-style: normal;
        font-weight: 500;
        line-height: 130%;
      }

      &:hover {
        cursor: pointer;
        background-color: rgb(244, 244, 244);
      }

      &:focus-visible {
        border-width: 3px;
      }
    }
  }

  &__results {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0;
    margin: 0;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    &:focus {
      outline: 2px solid var(--owc-openkaarten-streetmap--primary-color);
      outline-offset: 1px;
    }
  }

  &__load-more {
    margin-top: 1rem;
    margin-inline: auto;
    padding: 1rem 2rem;
    background-color: white;
    border: 2px solid var(--button-color);
    color: var(--button-color);
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    transition: background-color 0.2s ease;
    cursor: pointer;

    &:hover {
      background-color: rgb(244, 244, 244);
    }

    &:focus-visible {
      outline: 2px solid var(--button-color);
      outline-offset: 2px;
    }
  }
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

.owc-openkaarten-streetmap__overlay {
  background-color: var(--owc-map-overlay, rgba(0, 0, 0, 0.25));
  position: absolute;
  content: '';
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}
</style>
