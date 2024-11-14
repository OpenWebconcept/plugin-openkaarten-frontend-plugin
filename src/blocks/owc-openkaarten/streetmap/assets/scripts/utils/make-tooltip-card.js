export const makeTooltipCard = (location, dataset) => {
	const { title, type } = dataset;
	const tooltipData = location.properties?.tooltip || [];
	
	return {
		datasetTitle: title,
		datasetId: location.id,
		datasetType: type,
		locationTitle: tooltipData.find(t => t.layout === 'title')?.title || location.title,
		meta: tooltipData.find(t => t.layout === 'meta')?.meta || '',
		text: tooltipData.find(t => t.layout === 'text')?.text || 'Huisartsenpraktijk Westmaas B.V. ligt in het gelijknamige dorp in de regio Hoeksche Waard. Westmaas telt circa 2.065 inwoners en levert huisartsenzorg aan 2.380 patiënten.',
		button: tooltipData.find(t => t.layout === 'button') || null,
		image: tooltipData.find(t => t.layout === 'image')?.image || 'https://images.unsplash.com/photo-1525916801717-9405b53a3246?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHNwb3J0JTIwcGFya3xlbnwwfHwwfHx8MA%3D%3D',
		properties: location.properties,
		coordinates: location.geometry.coordinates
	};
}