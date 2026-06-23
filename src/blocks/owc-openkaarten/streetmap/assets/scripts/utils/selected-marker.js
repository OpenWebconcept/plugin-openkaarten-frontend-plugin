import L from 'leaflet';

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
    // Determine markers.
    const markers = [];
    if (activeLayer instanceof L.Marker) {
      markers.push(activeLayer);
    } else if (activeLayer instanceof L.FeatureGroup) {
      activeLayer.eachLayer(l => {
        if (l instanceof L.Marker) markers.push(l);
      });
    }

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
