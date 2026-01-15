<script setup>
import { reactive, watch } from 'vue';
import {fetchAndProcessSvg} from "../utils/fetch-and-process-svg";

const props = defineProps({
  marker: {
    type: Object,
    default: null,
  },
});

const state = reactive({
  svgText: null,
  colorClass: 'marker-blue',
  iconUrl: null,
});

const loadSvg = async (marker) => {
  state.svgText = await fetchAndProcessSvg(marker, '#fff');
};

const init = async () => {
  const marker = props.marker

  state.iconUrl = marker?.icon;
  state.colorClass = marker?.color;

  if (!marker?.icon) {
    state.iconUrl = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' height=\'24\' width=\'24\'%3E%3Cg transform=\'translate(0 -1028.4)\'%3E%3Cpath d=\'m12.031 1030.4c-3.8657 0-6.9998 3.1-6.9998 7 0 1.3 0.4017 2.6 1.0938 3.7 0.0334 0.1 0.059 0.1 0.0938 0.2l4.3432 8c0.204 0.6 0.782 1.1 1.438 1.1s1.202-0.5 1.406-1.1l4.844-8.7c0.499-1 0.781-2.1 0.781-3.2 0-3.9-3.134-7-7-7zm-0.031 3.9c1.933 0 3.5 1.6 3.5 3.5 0 2-1.567 3.5-3.5 3.5s-3.5-1.5-3.5-3.5c0-1.9 1.567-3.5 3.5-3.5z\'/%3E%3C/g%3E%3C/svg%3E\n';
  }

  if (marker?.icon.endsWith('.svg')) {
    await loadSvg(marker);
  }
};

watch(() => props.marker, init, { immediate: true });
</script>

<template>
  <div
      v-if="state.svgText"
      class="owc-openkaarten-streetmap__filters__body__list-item__dl-indicator"
      :class="state.colorClass"
      v-html="state.svgText"
  />
  <img
      v-else-if="state.iconUrl"
      :src="state.iconUrl"
      class="owc-openkaarten-streetmap__filters__body__list-item__dl-indicator"
      :class="state.colorClass"
  />
</template>
