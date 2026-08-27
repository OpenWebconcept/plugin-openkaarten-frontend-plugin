import L from 'leaflet';

// Leaflet.pattern is a legacy plugin that augments the global `L` in place
// rather than exporting a module. Expose our bundled Leaflet as window.L and
// then require the plugin so it extends this exact instance (L.Pattern,
// L.PatternPath/Circle/Rect and the `fillPattern` path option).
if (typeof window !== 'undefined' && !window.L) {
	window.L = L;
}
require('leaflet.pattern');

/**
 * WCAG 1.4.1 fill patterns for polygon "kleurvlakken".
 *
 * Each pattern gives a colored area a unique, non-color texture so areas stay
 * distinguishable in black-and-white print, for people with color blindness, and
 * at low screen quality. The pattern is drawn in the feature's resolved color
 * over a low-opacity tint of that same color, so both color and texture are
 * present.
 *
 * The pattern keys are the single source of truth shared with the backend
 * (openkaarten-base `get_marker_pattern_options()`) and with the legend swatch.
 */

const TILE = 10; // Pattern tile size in pixels.
const STROKE_WEIGHT = 1.5;
const STROKE_OPACITY = 0.9;
const TINT_OPACITY = 0.2; // Matches the previous solid polygon fillOpacity.
const FILL_OPACITY = 0.85;

// Each entry is a list of tile shapes. A `stroke` path/circle is drawn as an
// outline in the feature color; a `fill` circle/rect is filled with it. A
// tinted background rect is added automatically to every pattern.
const PATTERN_SHAPES = {
	'diagonal-forward': [
		{ el: 'path', d: 'M-1 1 L1 -1 M0 10 L10 0 M9 11 L11 9' },
	],
	'diagonal-backward': [
		{ el: 'path', d: 'M-1 9 L1 11 M0 0 L10 10 M9 -1 L11 1' },
	],
	horizontal: [{ el: 'path', d: 'M0 2.5 H10 M0 7.5 H10' }],
	vertical: [{ el: 'path', d: 'M2.5 0 V10 M7.5 0 V10' }],
	grid: [{ el: 'path', d: 'M0 0 H10 M0 0 V10' }],
	crosshatch: [
		{
			el: 'path',
			d: 'M-1 1 L1 -1 M0 10 L10 0 M9 11 L11 9 M-1 9 L1 11 M0 0 L10 10 M9 -1 L11 1',
		},
	],
	dots: [
		{ el: 'circle', cx: 5, cy: 5, r: 1.7, fill: true },
		{ el: 'circle', cx: 0, cy: 0, r: 1.7, fill: true },
		{ el: 'circle', cx: 10, cy: 0, r: 1.7, fill: true },
		{ el: 'circle', cx: 0, cy: 10, r: 1.7, fill: true },
		{ el: 'circle', cx: 10, cy: 10, r: 1.7, fill: true },
	],
	rings: [
		{ el: 'circle', cx: 5, cy: 5, r: 2 },
		{ el: 'circle', cx: 0, cy: 0, r: 2 },
		{ el: 'circle', cx: 10, cy: 0, r: 2 },
		{ el: 'circle', cx: 0, cy: 10, r: 2 },
		{ el: 'circle', cx: 10, cy: 10, r: 2 },
	],
	checkerboard: [
		{ el: 'rect', x: 0, y: 0, w: 5, h: 5, fill: true },
		{ el: 'rect', x: 5, y: 5, w: 5, h: 5, fill: true },
	],
	zigzag: [{ el: 'path', d: 'M0 8 L5 3 L10 8' }],
};

/**
 * Whether a pattern key maps to a real (non-solid) pattern.
 *
 * @param {string} key The pattern slug.
 * @return {boolean} True when a pattern should be drawn.
 */
export const hasPattern = (key) =>
	!!key && Object.prototype.hasOwnProperty.call(PATTERN_SHAPES, key);

// Build the leaflet.pattern shape for one spec in the given color.
const buildLeafletShape = (spec, color) => {
	if (spec.el === 'circle' && spec.fill) {
		return new L.PatternCircle({
			x: spec.cx,
			y: spec.cy,
			radius: spec.r,
			stroke: false,
			fill: true,
			fillColor: color,
			fillOpacity: FILL_OPACITY,
		});
	}
	if (spec.el === 'circle') {
		return new L.PatternCircle({
			x: spec.cx,
			y: spec.cy,
			radius: spec.r,
			stroke: true,
			color,
			weight: STROKE_WEIGHT,
			opacity: STROKE_OPACITY,
			fill: false,
		});
	}
	if (spec.el === 'rect') {
		return new L.PatternRect({
			x: spec.x,
			y: spec.y,
			width: spec.w,
			height: spec.h,
			stroke: false,
			fill: true,
			fillColor: color,
			fillOpacity: FILL_OPACITY,
		});
	}
	// Path (stroked lines).
	return new L.PatternPath({
		d: spec.d,
		stroke: true,
		color,
		weight: STROKE_WEIGHT,
		opacity: STROKE_OPACITY,
		fill: false,
		lineCap: 'square',
	});
};

/**
 * Create a pattern manager bound to a single map instance.
 *
 * @param {Object} map The Leaflet map.
 * @return {{getFillPattern: Function}} The manager API.
 */
export const createPatternManager = (map) => {
	const cache = {};

	const getFillPattern = (key, color) => {
		if (!hasPattern(key) || !color) {
			return null;
		}

		const cacheKey = `${key}|${color}`;
		if (cache[cacheKey]) {
			return cache[cacheKey];
		}

		const pattern = new L.Pattern({ width: TILE, height: TILE });
		// Tinted background so the area keeps its color behind the texture.
		pattern.addShape(
			new L.PatternRect({
				x: 0,
				y: 0,
				width: TILE,
				height: TILE,
				stroke: false,
				fill: true,
				fillColor: color,
				fillOpacity: TINT_OPACITY,
			})
		);
		PATTERN_SHAPES[key].forEach((spec) =>
			pattern.addShape(buildLeafletShape(spec, color))
		);
		pattern.addTo(map);

		cache[cacheKey] = pattern;
		return pattern;
	};

	return { getFillPattern };
};

// Build one tile's inner SVG markup (shared by the legend swatch).
const shapeToSvg = (spec, color) => {
	if (spec.el === 'circle' && spec.fill) {
		return `<circle cx="${spec.cx}" cy="${spec.cy}" r="${spec.r}" fill="${color}" fill-opacity="${FILL_OPACITY}"/>`;
	}
	if (spec.el === 'circle') {
		return `<circle cx="${spec.cx}" cy="${spec.cy}" r="${spec.r}" fill="none" stroke="${color}" stroke-width="${STROKE_WEIGHT}" stroke-opacity="${STROKE_OPACITY}"/>`;
	}
	if (spec.el === 'rect') {
		return `<rect x="${spec.x}" y="${spec.y}" width="${spec.w}" height="${spec.h}" fill="${color}" fill-opacity="${FILL_OPACITY}"/>`;
	}
	return `<path d="${spec.d}" fill="none" stroke="${color}" stroke-width="${STROKE_WEIGHT}" stroke-opacity="${STROKE_OPACITY}" stroke-linecap="square"/>`;
};

/**
 * Build a data-URI SVG of a pattern tiled to fill a swatch, for the legend.
 *
 * @param {string} key   The pattern slug.
 * @param {string} color The resolved hex color.
 * @param {number} size  Swatch size in pixels.
 * @return {string|null} A `data:image/svg+xml` URI, or null when no pattern.
 */
export const patternSwatchDataUri = (key, color, size = 30) => {
	if (!hasPattern(key) || !color) {
		return null;
	}

	const shapes = [
		`<rect x="0" y="0" width="${TILE}" height="${TILE}" fill="${color}" fill-opacity="${TINT_OPACITY}"/>`,
		...PATTERN_SHAPES[key].map((spec) => shapeToSvg(spec, color)),
	].join('');

	const svg =
		`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
		`<defs><pattern id="p" width="${TILE}" height="${TILE}" patternUnits="userSpaceOnUse">${shapes}</pattern></defs>` +
		`<rect width="${size}" height="${size}" fill="url(#p)"/></svg>`;

	return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
