export const calculateBounds = (datasets) => {

	let minLat = null;
	let maxLat = null;
	let minLong = null;
	let maxLong = null;

	const processCoordinates = (coords) => {
		// Handle a single coordinate pair
		if (!Array.isArray(coords[0])) {
			// Reverse the coordinates, use 0 and 1 as lat and long
			const lat = coords[1];
			const long = coords[0];
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

	// Check if datasets is empty
	if (datasets.length === 0) {
		return;
	}

	datasets.forEach(({ features }) => {
		// Check if features is empty
		if (!features || features.length === 0) {
			return;
		}

		// Check if features is an array. If not, make it an array.
		if (!Array.isArray(features)) {
					features = [features];
		}

		features.forEach(({ geometry }) => {
			processCoordinates(geometry.coordinates.slice());
		});
	});

	if ( minLat === null || maxLat === null || minLong === null || maxLong === null ) {
		return;
	}

	return {
		minLat,
		maxLat,
		minLong,
		maxLong,
	};
};
