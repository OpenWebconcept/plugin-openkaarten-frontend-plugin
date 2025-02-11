export const makeTooltipCard = (location, dataset) => {
    const { title, type } = dataset;
    const tooltipData = location.properties?.tooltip || [];

    // Ensure tooltipData is an array
    const tooltipArray = Array.isArray(tooltipData) ? tooltipData : Object.values(tooltipData);

    return {
        datasetTitle: title,
        datasetId: location.id,
        datasetType: type,
        locationTitle: tooltipArray.find(t => t.layout === 'title')?.title || location.properties?.title,
        meta: tooltipArray.find(t => t.layout === 'meta')?.meta || '',
        text: tooltipArray.find(t => t.layout === 'text')?.text || '',
        button: tooltipArray.find(t => t.layout === 'button') || null,
        image: tooltipArray.find(t => t.layout === 'image')?.image || '',
        properties: location.properties,
        coordinates: location.geometry.coordinates,
    };
}
