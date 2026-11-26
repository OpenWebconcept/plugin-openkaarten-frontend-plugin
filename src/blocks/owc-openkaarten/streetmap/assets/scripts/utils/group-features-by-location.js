/**
 * Number of decimals used to decide whether two points share a location.
 * Six decimals is roughly 10 cm, so points that only differ by rounding noise
 * in the source still end up in the same group.
 */
const COORDINATE_PRECISION = 6;

/**
 * Group the Point features of a dataset that share exactly the same location.
 *
 * Markers on identical coordinates are drawn on top of each other, so only one
 * of them can be clicked. Grouping them lets the map show a single marker whose
 * tooltip lists every feature at that location.
 *
 * Only Point features are grouped; every other geometry type (Polygon,
 * MultiPolygon, MultiPoint, ...) becomes a group of its own. Groups are
 * returned in the order of their first feature, and features keep the order of
 * the source within their group.
 *
 * @param {object[]} features The GeoJSON features of a dataset.
 * @return {object[][]} The features, grouped per location.
 */
export const groupFeaturesByLocation = (features) => {
	const groupsByLocation = new Map();
	const groups = [];

	for (const feature of features) {
		const [lng, lat] = feature?.geometry?.coordinates ?? [];
		const isPoint =
			feature?.geometry?.type === 'Point' &&
			Number.isFinite(Number(lng)) &&
			Number.isFinite(Number(lat));

		if (!isPoint) {
			groups.push([feature]);
			continue;
		}

		const key = `${Number(lng).toFixed(COORDINATE_PRECISION)},${Number(lat).toFixed(COORDINATE_PRECISION)}`;
		let group = groupsByLocation.get(key);

		if (!group) {
			group = [];
			groupsByLocation.set(key, group);
			groups.push(group);
		}

		group.push(feature);
	}

	return groups;
};
