<script setup>
import { computed, ref } from 'vue';
import BaseTooltipCard from './BaseTooltipCard.vue';

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

const emits = defineEmits(['toggleView', 'closeCard']);

const closeCard = () => {
  emits('closeCard');
};

const showFilters = ref(false);

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const toggleView = () => {
  emits('toggleView');
};

// @TODO: Implement the actual filtering logic here
// ...
</script>

<template>
  <div class="list-view">
    <div class="list-view__controls">
      <button @click="toggleView" class="list-view__map-button">
        Kaart
      </button>
      <button @click="toggleFilters" class="list-view__filters-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5C8.44772 5 8 5.44772 8 6C8 6.55228 8.44772 7 9 7C9.55228 7 10 6.55228 10 6C10 5.44772 9.55228 5 9 5ZM6.17071 5C6.58254 3.83481 7.69378 3 9 3C10.3062 3 11.4175 3.83481 11.8293 5H19C19.5523 5 20 5.44772 20 6C20 6.55228 19.5523 7 19 7H11.8293C11.4175 8.16519 10.3062 9 9 9C7.69378 9 6.58254 8.16519 6.17071 7H5C4.44772 7 4 6.55228 4 6C4 5.44772 4.44772 5 5 5H6.17071ZM15 11C14.4477 11 14 11.4477 14 12C14 12.5523 14.4477 13 15 13C15.5523 13 16 12.5523 16 12C16 11.4477 15.5523 11 15 11ZM12.1707 11C12.5825 9.83481 13.6938 9 15 9C16.3062 9 17.4175 9.83481 17.8293 11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H17.8293C17.4175 14.1652 16.3062 15 15 15C13.6938 15 12.5825 14.1652 12.1707 13H5C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11H12.1707ZM9 17C8.44772 17 8 17.4477 8 18C8 18.5523 8.44772 19 9 19C9.55228 19 10 18.5523 10 18C10 17.4477 9.55228 17 9 17ZM6.17071 17C6.58254 15.8348 7.69378 15 9 15C10.3062 15 11.4175 15.8348 11.8293 17H19C19.5523 17 20 17.4477 20 18C20 18.5523 19.5523 19 19 19H11.8293C11.4175 20.1652 10.3062 21 9 21C7.69378 21 6.58254 20.1652 6.17071 19H5C4.44772 19 4 18.5523 4 18C4 17.4477 4.44772 17 5 17H6.17071Z" fill="${color}"/>
        </svg>
        <span class="leaflet-control-filters__control-text">Filter</span>
      </button>
    </div>
    <div v-for="location in filteredLocations" :key="`${location.datasetId}-${location.properties.id}`" class="list-view__item">
      <div class="list-view__item-content">
        <h3>{{ location.properties.title || location.datasetTitle }}</h3>
        <p>{{ location.properties.address }}</p>
        <p>{{ location.properties.description }}</p>
        <a href="#" class="list-view__item-link">Lees meer</a>
      </div>
      <div class="list-view__item-image" v-if="location.properties.image">
        <img :src="location.properties.image" :alt="location.properties.title || location.datasetTitle">
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.list-view {
  padding: 20px;
  overflow-y: auto;
  height: 100%;
}

.list-view__item {
  display: flex;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;

  &-content {
    flex: 1;
    padding: 15px;
  }

  &-image {
    width: 200px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &-link {
    color: #007bff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.list-view__controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.list-view__control-button {
  background-color: white;
  border: 2px solid rgba(0,0,0,0.2);
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #f4f4f4;
  }
}
</style>
