export const makeTooltipCard = (location, dataset) => {
    const { title, type } = dataset;
    const tooltipData = location.properties?.tooltip || [];

    // Ensure tooltipData is an array
    const tooltipArray = Array.isArray(tooltipData) ? tooltipData : Object.values(tooltipData);

    return {
        datasetTitle: title,
        datasetId: location.id,
        datasetType: type,
        tooltipArray,
        properties: location.properties,
        coordinates: location.geometry.coordinates,
    };
}
