const getTooltipArray = (location) => {
    const tooltipData = location.properties?.tooltip || [];

    // Ensure tooltipData is an array
    return Array.isArray(tooltipData) ? tooltipData : Object.values(tooltipData);
};

/**
 * Build the data for the tooltip card of a marker.
 *
 * @param {object|object[]} locations One feature, or all features that share a location.
 * @param {object}          dataset   The dataset the features belong to.
 * @return {object} The tooltip card data. The top-level fields describe the
 *                  first feature; `items` holds every feature at the location.
 */
export const makeTooltipCard = (locations, dataset) => {
    const { title, type } = dataset;
    const features = Array.isArray(locations) ? locations : [locations];
    const [location] = features;

    return {
        datasetTitle: title,
        datasetId: location.id,
        datasetType: type,
        tooltipArray: getTooltipArray(location),
        properties: location.properties,
        coordinates: location.geometry.coordinates,
        items: features.map((feature) => ({
            id: feature.id,
            tooltipArray: getTooltipArray(feature),
            properties: feature.properties,
        })),
    };
}
