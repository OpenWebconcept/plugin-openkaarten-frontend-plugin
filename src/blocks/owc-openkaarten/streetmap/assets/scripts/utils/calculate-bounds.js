export const calculateBounds = (datasets) => {
	let minLat = null;
	let maxLat = null;
	let minLong = null;
	let maxLong = null;

	const processCoordinates = (coords) => {
		// Handle a single coordinate pair
		if (!Array.isArray(coords[0])) {
			const [lat, long] = coords.reverse(); // lat-long reversed
			minLat = minLat === null ? lat : Math.min(minLat, lat);
			maxLat = maxLat === null ? lat : Math.max(maxLat, lat);
			minLong = minLong === null ? long : Math.min(minLong, long);
			maxLong = maxLong === null ? long : Math.max(maxLong, long);
			return;
		}

		// Handle arrays of coordinates (Polygons)
		coords.forEach(coordSet => {
			if (Array.isArray(coordSet[0])) {
				coordSet.forEach(coord => processCoordinates(coord.slice()));
			} else {
				processCoordinates(coordSet.slice());
			}
		});
	};

	datasets.forEach(({ features }) => {
		features.forEach(({ geometry }) => {
			processCoordinates(geometry.coordinates.slice());
		});
	});

	return {
		minLat,
		maxLat,
		minLong,
		maxLong,
	};
};
