import L from 'leaflet';

export const activeMarkerRef = { value: null };

export const highlightSelectedMarker = (activeLayer) => {
  // Dim all markers.
  document.querySelectorAll('.leaflet-marker-icon').forEach(el => {
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

  // Add class to DOM respective elements.
  markers.forEach(marker => {
    const el = marker.getElement();
    if (el) {
      el.classList.remove('dimmed');
      el.classList.add('active');
    }
  });

  activeMarkerRef.value = activeLayer;
};

export const resetMarkers = () => {
  document.querySelectorAll('.leaflet-marker-icon').forEach(el => {
    el.classList.remove('dimmed', 'active');
  });
  activeMarkerRef.value = null;
};
