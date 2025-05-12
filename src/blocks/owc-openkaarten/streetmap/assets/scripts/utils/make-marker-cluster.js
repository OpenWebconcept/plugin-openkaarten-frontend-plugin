// Docs: https://github.com/Leaflet/Leaflet.markercluster
import { MarkerClusterGroup } from 'leaflet.markercluster/src';

export const makeMarkerCluster = ({
	disableClusteringAtZoom,
	maxClusterRadius,
	showCoverageOnHover,
	sizeMultiplier,
    color,
    clusterPane
}) => {
	return new MarkerClusterGroup({
		disableClusteringAtZoom,
		maxClusterRadius,
		showCoverageOnHover,
        clusterPane,
		iconCreateFunction: function (cluster) {
			const count = cluster.getChildCount();
			const cluserGroupMaxSize = 200;
			const cluserGroupMinSize = 48;
			let clusterGroupSize = count * sizeMultiplier;
			if (clusterGroupSize < cluserGroupMinSize) {
				clusterGroupSize = cluserGroupMinSize;
			}
			if (clusterGroupSize > cluserGroupMaxSize) {
				clusterGroupSize = cluserGroupMaxSize;
			}
			return L.divIcon({
				html: `
                <div 
                    class="owc-openkaarten-streetmap__cluster-group__circle ${color}"
                    >
                    <span class="owc-openkaarten-streetmap__cluster-group__count">${count}</span>
                </div>`,
				className: 'owc-openkaarten-streetmap__cluster-group',
				iconSize: [clusterGroupSize, clusterGroupSize],
			});
		},
	});
};
