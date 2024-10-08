export const makeTooltipCard = (location, dataset) => {
	const { title, type } = dataset;
	return {
		datasetTitle: title,
		datasetId: location.id,
		datasetType: type,
		locationTitle: location.title,
		properties: location.properties,
		coordinates: location.geometry.coordinates
	};
};
