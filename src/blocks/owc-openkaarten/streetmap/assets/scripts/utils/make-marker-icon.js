import {fetchAndProcessSvg} from "../utils/fetch-and-process-svg";
import {isHexColor} from "./is-hex-color";

/**
 * Fetches an SVG from a URL and converts it to inline SVG
 * @param {string} url
 * @returns {Promise<string|null>}
 */

export const fallbackMarkerSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
    <g transform="translate(0 -1028.4)">
      <path d="m12.031 1030.4c-3.8657 0-6.9998 3.1-6.9998 7 0 1.3 0.4017 2.6 1.0938 3.7 0.0334 0.1 0.059 0.1 0.0938 0.2l4.3432 8c0.204 0.6 0.782 1.1 1.438 1.1s1.202-0.5 1.406-1.1l4.844-8.7c0.499-1 0.781-2.1 0.781-3.2 0-3.9-3.134-7-7-7zm-0.031 3.9c1.933 0 3.5 1.6 3.5 3.5 0 2-1.567 3.5-3.5 3.5s-3.5-1.5-3.5-3.5c0-1.9 1.567-3.5 3.5-3.5z" fill="#fff"/>
    </g>
  </svg>`;

export const makeMarkerIcon = async (L, { marker, defaultColor }) => {
  const iconColor = marker?.color || defaultColor;
  // A preset color is a "marker-<name>" class the stylesheet maps to a hex. A
  // custom color is a raw hex that can't be expressed as a class, so it is
  // applied inline via applyMarkerColor() once the marker element exists.
  const colorClass = isHexColor(iconColor) ? '' : iconColor;

  let iconHtml = `<div class="leaflet-svg ${colorClass} fallback">${fallbackMarkerSvg}</div>`;

  if (marker?.icon) {
    iconHtml = `<div class="leaflet-svg ${colorClass}"><img src=${marker?.icon} /></div>`;

    const svgText = await fetchAndProcessSvg(marker, '#fff');
    if (svgText) {
      iconHtml = svgText;
    }
  }

  return L.divIcon({
    className: `leaflet-custom-icon--inline-svg ${colorClass}`,
    html: iconHtml,
    iconAnchor: [12, 32],
    iconSize: [44, 44],
    popupAnchor: [0, -28],
  });
};

/**
 * Apply a custom hex marker color to a Leaflet marker once its element exists.
 *
 * Preset colors are handled by the "marker-<name>" CSS class, but a custom hex
 * can't be expressed as a class. We set it as a CSS custom property on the
 * marker element; the divIcon container reads that property for both its
 * background and its focus/hover ring. No-op for preset class values.
 *
 * @param {object} marker The Leaflet marker.
 * @param {string} color  The resolved marker color (hex or preset class).
 */
export const applyMarkerColor = (marker, color) => {
  if (!isHexColor(color)) return;

  const setVar = () => {
    const el = marker.getElement();
    if (el) {
      el.style.setProperty('--owc-openkaarten-streetmap--marker-color', color);
    }
  };

  if (marker.getElement()) {
    setVar();
  } else {
    marker.on('add', setVar);
  }
};
