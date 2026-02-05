import {fetchAndProcessSvg} from "../utils/fetch-and-process-svg";

/**
 * Fetches an SVG from a URL and converts it to inline SVG
 * @param {string} url
 * @returns {Promise<string|null>}
 */

export const makeMarkerIcon = async (L, { marker, defaultColor }) => {
  const iconColor = marker?.color || defaultColor;

  let iconHtml = `
    <div class="leaflet-svg ${iconColor} fallback">
      <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
        <g transform="translate(0 -1028.4)">
          <path d="m12.031 1030.4c-3.8657 0-6.9998 3.1-6.9998 7 0 1.3 0.4017 2.6 1.0938 3.7 0.0334 0.1 0.059 0.1 0.0938 0.2l4.3432 8c0.204 0.6 0.782 1.1 1.438 1.1s1.202-0.5 1.406-1.1l4.844-8.7c0.499-1 0.781-2.1 0.781-3.2 0-3.9-3.134-7-7-7zm-0.031 3.9c1.933 0 3.5 1.6 3.5 3.5 0 2-1.567 3.5-3.5 3.5s-3.5-1.5-3.5-3.5c0-1.9 1.567-3.5 3.5-3.5z" fill="#fff"/>
        </g>
      </svg>
    </div>
  `;

  if (marker?.icon) {
    iconHtml = `<div class="leaflet-svg ${iconColor}"><img src=${marker?.icon} /></div>`;

    const svgText = await fetchAndProcessSvg(marker, '#fff');
    if (svgText) {
      iconHtml = svgText;
    }
  }

  return L.divIcon({
    className: `leaflet-custom-icon--inline-svg ${iconColor}`,
    html: iconHtml,
    iconAnchor: [12, 32],
    iconSize: [44, 44],
    popupAnchor: [0, -28],
  });
};