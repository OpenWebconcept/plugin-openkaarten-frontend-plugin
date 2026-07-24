import { isHexColor } from './is-hex-color';

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

  // A custom color is stored as a raw hex value; use it directly. A preset
  // color is a "marker-<name>" class that maps to a hex via colorMap. Unknown
  // values fall back to the primary color.
  const resolve = (color) => (isHexColor(color) ? color : colorMap[color]);

  // If marker has a color (custom hex or preset class), use that.
  if (markerConfig.color) {
    return resolve(markerConfig.color) || primaryColor;
  }

  // If marker has a custom icon with color, use that.
  if (markerConfig.icon?.color) {
    return resolve(markerConfig.icon.color) || primaryColor;
  }

  return primaryColor;
};
