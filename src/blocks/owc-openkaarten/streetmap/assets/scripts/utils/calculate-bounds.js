export const calculateBounds = (datasets) => {
	let minLat = null;
	let maxLat = null;
	let minLong = null;
	let maxLong = null;
	datasets.forEach(({ features }) => {
		features.forEach(({ geometry }) => {
			const [lat, long] = geometry.coordinates.reverse(); // lat-long reversed

			minLat = minLat === null ? lat : Math.min(minLat, lat);
			maxLat = maxLat === null ? lat : Math.max(maxLat, lat);
			minLong = minLong === null ? long : Math.min(minLong, long);
			maxLong = maxLong === null ? long : Math.max(maxLong, long);
		});
	});

	return {
		minLat,
		maxLat,
		minLong,
		maxLong,
	};
};
