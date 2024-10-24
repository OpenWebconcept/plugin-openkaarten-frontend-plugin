<script setup>
import { computed, ref } from 'vue';
import BaseListCard from './BaseListCard.vue';
import { makeFilterButtonHTML } from '../utils/make-filter-button-html';
import { makeMapButtonHTML } from '../utils/make-map-button-html';

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

const filteredLocations = computed(() => {
  return props.datasets
    .filter(dataset => props.selectedDatasets.includes(dataset.id))
    .flatMap(dataset => dataset.features.map(feature => ({
      ...feature,
      datasetId: dataset.id,
      datasetTitle: dataset.title,
    })));
});

const emits = defineEmits(['toggleView']);

const showFilters = ref(false);

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const toggleView = () => {
  emits('toggleView');
};

const filterButtonHTML = computed(() => makeFilterButtonHTML('Filter', props.primaryColor));
const mapButtonHTML = computed(() => makeMapButtonHTML('Kaart', props.primaryColor));

// @TODO: Implement the actual filtering logic here
// ...
</script>

<template>
  <div class="list-view">
    <div class="list-view__controls">
      <button @click="toggleView" class="list-view__map-button" v-html="mapButtonHTML"></button>
      <button @click="toggleFilters" class="list-view__filters-button" v-html="filterButtonHTML"></button>
    </div>
    <div v-for="location in filteredLocations" :key="`${location.datasetId}-${location.properties.id}`" class="list-view__item">
      <BaseListCard
        :title="location.properties.title || location.datasetTitle"
        :address="location.properties.address || 'Zorg | Beatrixlaan 32 C, 3273 AB Westmaas'"
        :description="location.properties.description || 'Huisartsenpraktijk Westmaas B.V. ligt in het gelijknamige dorp in de regio Hoeksche Waard. Westmaas telt circa 2.065 inwoners en levert huisartsenzorg aan 2.380 patiënten.'"
        :image="location.properties.image || 'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'"
        :primaryColor="primaryColor"
      >
        <template #footer>
        </template>
      </BaseListCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.list-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__controls {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-block-end: 0.5rem;

    button {
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

      // @TODO: styles are not being applied, why?
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

  &__item {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
