import L from 'leaflet';

/**
 * Recursively collect every marker within a layer.
 *
 * `activeLayer` is normally a single-level group (a GeoJSON layer or
 * FeatureGroup whose markers are direct children), but recursing guards against
 * nested groups — e.g. a marker-cluster group or a GeoJSON FeatureCollection
 * that contains sub-groups — so no marker is silently missed. Any layer that
 * exposes `eachLayer` (FeatureGroup, LayerGroup, GeoJSON, cluster group) is
 * descended into.
 *
 * @param {object}     layer The Leaflet layer to inspect.
 * @param {L.Marker[]} out   Accumulator that collected markers are pushed onto.
 */
const collectMarkers = (layer, out) => {
  if (!layer) return;

  if (layer instanceof L.Marker) {
    out.push(layer);
  } else if (typeof layer.eachLayer === 'function') {
    layer.eachLayer(child => collectMarkers(child, out));
  }
};

/**
 * Create a marker highlighter with state scoped to a single map instance.
 *
 * The active-marker reference lives in this closure instead of at module
 * level, so multiple maps on one page each track their own selection and one
 * map's cluster events can no longer dim or clear another map's markers.
 *
 * @return {{highlightSelectedMarker: Function, resetMarkers: Function, activeMarkerRef: {value: ?object}}} The highlighter API.
 */
export const createMarkerHighlighter = () => {
  const activeMarkerRef = { value: null };

  const highlightSelectedMarker = (activeLayer, root = document) => {
    // Dim all markers within the given map root (defaults to the whole document).
    root.querySelectorAll('.leaflet-marker-icon').forEach(el => {
      el.classList.add('dimmed');
      el.classList.remove('active');
    });

    if (!activeLayer) return;
    // Determine markers (recursively, so nested groups are covered too).
    const markers = [];
    collectMarkers(activeLayer, markers);

    // Add class to respective DOM elements.
    markers.forEach(marker => {
      const el = marker.getElement();
      if (el) {
        el.classList.remove('dimmed');
        el.classList.add('active');
      }
    });

    activeMarkerRef.value = activeLayer;
  };

  const resetMarkers = (root = document) => {
    root.querySelectorAll('.leaflet-marker-icon').forEach(el => {
      el.classList.remove('dimmed', 'active');
    });
    activeMarkerRef.value = null;
  };

  return { highlightSelectedMarker, resetMarkers, activeMarkerRef };
};
