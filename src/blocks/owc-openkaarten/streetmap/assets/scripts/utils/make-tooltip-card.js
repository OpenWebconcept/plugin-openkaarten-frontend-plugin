export const makeTooltipCard = (location, dataset) => {
	const { title, type } = dataset;
	const tooltipData = location.properties?.tooltip || [];
	
	return {
		datasetTitle: title,
		datasetId: location.id,
		datasetType: type,
		locationTitle: tooltipData.find(t => t.layout === 'title')?.title || location.title,
		meta: tooltipData.find(t => t.layout === 'meta')?.meta || '',
		text: tooltipData.find(t => t.layout === 'text')?.text || '',
		button: tooltipData.find(t => t.layout === 'button') || null,
		image: tooltipData.find(t => t.layout === 'image')?.image || '',
		properties: location.properties,
		coordinates: location.geometry.coordinates
	};
}