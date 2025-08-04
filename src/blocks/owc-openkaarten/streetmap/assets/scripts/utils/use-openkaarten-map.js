import { ref } from 'vue';

const mapRef = ref(null);

export function setOpenkaartenMap(map) {
  mapRef.value = map;
  // console.log('[setOpenkaartenMap] map gezet:', map);
}

export function useOpenkaartenMap() {
  return mapRef;
}
