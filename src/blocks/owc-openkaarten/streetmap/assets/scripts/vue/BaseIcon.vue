<script setup>
import { reactive, watch } from 'vue';
import {fetchAndProcessSvg} from "../utils/fetch-and-process-svg";
import { fallbackMarkerSvg } from "../utils/make-marker-icon";
import { isHexColor } from "../utils/is-hex-color";
import { getColorFromMarker } from "../utils/get-color-from-marker";
import { patternSwatchDataUri } from "../utils/pattern-fills";

const props = defineProps({
  marker: {
    type: Object,
    default: null,
  },
});

const state = reactive({
  svgText: null,
  colorClass: 'marker-blue',
  colorStyle: null,
  iconUrl: null,
  patternStyle: null,
});

const loadSvg = async (marker) => {
  state.svgText = await fetchAndProcessSvg(marker, '#fff');
};

const init = async () => {
  const marker = props.marker

  state.iconUrl = marker?.icon;

  // A custom color is a raw hex applied inline; a preset color is a
  // "marker-<name>" class the stylesheet maps to a hex.
  const color = marker?.color;
  if (isHexColor(color)) {
    state.colorClass = null;
    state.colorStyle = { backgroundColor: color, borderColor: color };
  } else {
    state.colorClass = color;
    state.colorStyle = null;
  }

  // WCAG 1.4.1: area layers carry a fill pattern. Show it in the legend so the
  // pattern-to-layer mapping is discoverable, matching what the map draws.
  const resolvedColor = getColorFromMarker(marker, '#328725');
  const patternUri = patternSwatchDataUri(marker?.pattern, resolvedColor);
  state.patternStyle = patternUri
    ? { backgroundImage: `url("${patternUri}")`, backgroundSize: 'cover', borderColor: resolvedColor }
    : null;

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
      :style="state.colorStyle"
      v-html="state.svgText"
  />
  <img
      v-else-if="state.iconUrl"
      :src="state.iconUrl"
      class="owc-openkaarten-streetmap__filters__body__list-item__dl-indicator"
      :class="state.colorClass"
      :style="state.colorStyle"
  />
  <div
      v-if="state.patternStyle"
      class="owc-openkaarten-streetmap__filters__body__list-item__dl-indicator owc-openkaarten-streetmap__filters__body__list-item__dl-pattern"
      :style="state.patternStyle"
      aria-hidden="true"
  />
</template>
