const svgCache = {};

/**
 * Fetches an SVG from a URL and replaces fill color.
 * @param {string} iconUrl
 * @param {string} fillColor
 * @returns {Promise<string>} SVG text
 */

export const fetchAndProcessSvg = async (marker, fillColor = '#fff') => {
  const iconName = marker.icon_name
    ? marker.icon_name + '.svg'
    : new URL(marker.icon).pathname.split('/').pop();

  const cacheKey = `${iconName}_${fillColor}`;

  if (svgCache[cacheKey]) return svgCache[cacheKey];

  const filePath = '/wp-content/plugins/openkaarten-base/opengemeenten-iconenset/Regular/';
  const iconUrl = `${location.protocol}//${location.host}${filePath}${iconName}`;

  const res = await fetch(iconUrl);
  if (!res.ok) return null;

  let svgText = await res.text();

  svgText = svgText.includes('fill=')
    ? svgText.replace(/fill="[^"]*"/g, `fill="${fillColor}"`)
    : svgText.replace('<path', `<path fill="${fillColor}"`);

  svgCache[cacheKey] = svgText;
  return svgText;
};
