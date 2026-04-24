import {fetchAndProcessSvg} from "../utils/fetch-and-process-svg";

/**
 * Fallback SVG used as a placeholder marker while the real icon is still being fetched,
 * or as a permanent fallback when no custom icon is configured / the fetch fails.
 *
 * @type {string}
 */
export const fallbackMarkerSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
    <g transform="translate(0 -1028.4)">
      <path d="m12.031 1030.4c-3.8657 0-6.9998 3.1-6.9998 7 0 1.3 0.4017 2.6 1.0938 3.7 0.0334 0.1 0.059 0.1 0.0938 0.2l4.3432 8c0.204 0.6 0.782 1.1 1.438 1.1s1.202-0.5 1.406-1.1l4.844-8.7c0.499-1 0.781-2.1 0.781-3.2 0-3.9-3.134-7-7-7zm-0.031 3.9c1.933 0 3.5 1.6 3.5 3.5 0 2-1.567 3.5-3.5 3.5s-3.5-1.5-3.5-3.5c0-1.9 1.567-3.5 3.5-3.5z" fill="#fff"/>
    </g>
  </svg>`;

/**
 * Shared Leaflet `divIcon` options so the placeholder and the upgraded icon share the
 * same anchor / size / popup offset — preventing a visual "jump" when we swap icons.
 *
 * @type {object}
 */
const ICON_DIMENSIONS = {
	iconAnchor: [12, 32],
	iconSize: [44, 44],
	popupAnchor: [0, -28],
};

/**
 * Create a Leaflet marker icon for a feature.
 *
 * Returns synchronously with a placeholder icon (either the raw `<img>` reference to the
 * configured icon URL, or the inline `fallbackMarkerSvg` when no icon is configured).
 * The returned `ready` promise resolves with the upgraded `L.divIcon` once the SVG has
 * been fetched and color-processed — or with `null` if the fetch failed or no upgrade
 * is needed. Callers should apply the upgraded icon via `marker.setIcon(upgraded)`.
 *
 * Motivation: the previous implementation was `async` and awaited the SVG fetch before
 * returning, which blocked the whole map initialization (including the tile layer) on a
 * potentially slow network call. The map stayed blank until every marker SVG was in.
 *
 * @author Merel Voorn - van Uffelen
 *
 * @param {object} L             Leaflet namespace.
 * @param {object} options
 * @param {object} options.marker        Marker configuration from the feature properties.
 * @param {string} options.defaultColor  Fallback color class used when the marker has no explicit color.
 * @returns {{icon: object, ready: Promise<object|null>}} Placeholder icon + upgrade promise.
 */
export const makeMarkerIcon = (L, { marker, defaultColor }) => {
	const iconColor = marker?.color || defaultColor;

	// Build the placeholder HTML. If a custom icon URL is configured we render it as a
	// plain <img> (so the browser shows something as soon as the image loads); otherwise
	// we render the inline fallback SVG.
	const placeholderHtml = marker?.icon
		? `<div class="leaflet-svg ${iconColor}"><img src=${marker?.icon} /></div>`
		: `<div class="leaflet-svg ${iconColor} fallback">${fallbackMarkerSvg}</div>`;

	const icon = L.divIcon({
		className: `leaflet-custom-icon--inline-svg ${iconColor}`,
		html: placeholderHtml,
		...ICON_DIMENSIONS,
	});

	// No custom icon configured → nothing to upgrade, placeholder is the final state.
	if (!marker?.icon) {
		return { icon, ready: Promise.resolve(null) };
	}

	// Kick off the SVG fetch in the background. The caller should apply the resolved
	// icon (if any) via `marker.setIcon()` once the promise settles.
	const ready = fetchAndProcessSvg(marker, '#fff').then((svgText) => {
		if (!svgText) {
			// Fetch failed → keep the placeholder, caller will ignore `null`.
			return null;
		}

		return L.divIcon({
			className: `leaflet-custom-icon--inline-svg ${iconColor}`,
			html: svgText,
			...ICON_DIMENSIONS,
		});
	});

	return { icon, ready };
};
