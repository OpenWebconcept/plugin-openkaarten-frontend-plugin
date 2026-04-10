import L from 'leaflet';

let selectedLayer = null;
let highlightLayer = null;
let overlappingLayers = [];
let overlapIndex = 0;

export const resetPolygonSelection = () => {
  if (highlightLayer) {
    highlightLayer.remove();
    highlightLayer = null;
  }
  selectedLayer = null;
  overlappingLayers = [];
  overlapIndex = 0;
};

export const selectOverlappingPolygon = (map, latlng) => {
  if (!map) return null;

    // get all polygons of the map.
    const polygons = [];
    map.eachLayer(layer => {
      if (layer instanceof L.Polygon) {
        polygons.push(layer);
      }
    });

    // find all polygons.
    overlappingLayers = polygons.filter(p => p.getBounds().contains(latlng));

    if (overlappingLayers.length === 0) {
      if (highlightLayer) {
        highlightLayer.remove();
        highlightLayer = null;
      }
      selectedLayer = null;
      return null;
    }

    // cycling selection.
    overlapIndex = (overlapIndex + 1) % overlappingLayers.length;
    const newLayer = overlappingLayers[overlapIndex];

    // remove old selected highlight.
    if (highlightLayer) {
      highlightLayer.remove();
      highlightLayer = null;
    }

    // highlight the newly selected polygon.
    selectedLayer = newLayer;
    highlightLayer = L.geoJSON(selectedLayer.toGeoJSON(), {
      style: {color: '#0377fc', weight: 4, opacity: 0.9},
      interactive: false
    }).addTo(map);

    // Return the selected layer so caller can access its data.
    return selectedLayer;
};