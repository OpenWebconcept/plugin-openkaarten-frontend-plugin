export const getColorFromMarker = (markerConfig, primaryColor) => {
  const colorMap = {
    "marker-black": "#000000",
    "marker-blue": "#0072B2",
    "marker-brown": "#A0522D",
    "marker-darkgray": "#555555",
    "marker-deep-purple": "#4B0082",
    "marker-gray": "#757575",
    "marker-green": "#328725",
    "marker-navy-blue": "#001D5F",
    "marker-orange": "#F4801B",
    "marker-purple": "#792487",
    "marker-red": "#9F0000",
    "marker-turquoise": "#3B7BA0",
    "marker-yellow": "#7E7722",
  };

  if (!markerConfig) return primaryColor;

  // If marker has a custom color, use that
  if (markerConfig.color) {
    return colorMap[markerConfig.color];
  }

  // If marker has a custom icon with color, use that
  if (markerConfig.icon?.color) {
    return colorMap[markerConfig.icon.color];
  }

  return primaryColor;
};
