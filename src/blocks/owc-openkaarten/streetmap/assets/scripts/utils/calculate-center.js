export const calculateCenter = (bounds) => {
	const lat = (bounds.minLat + bounds.maxLat) / 2;
	const long = (bounds.minLong + bounds.maxLong) / 2;
	return { lat, long };
};
