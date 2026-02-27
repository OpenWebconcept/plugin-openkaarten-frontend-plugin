<script setup>
import { reactive, watch } from 'vue';
import {fetchAndProcessSvg} from "../utils/fetch-and-process-svg";
import { fallbackMarkerSvg } from "../utils/make-marker-icon";

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
    state.iconUrl = `data:image/svg+xml,${encodeURIComponent(fallbackMarkerSvg.trim())}`;
  }

  if (marker?.icon?.endsWith('.svg')) {
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
