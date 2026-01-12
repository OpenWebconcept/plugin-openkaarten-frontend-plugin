/**
 * Fetches an SVG from a URL and converts it to inline SVG
 * @param {string} url
 * @returns {Promise<string|null>}
 */


export const makeMarkerIcon = (L, { marker, defaultColor }) => {
  const iconColor = marker?.color || defaultColor;

  // Fallback inline SVG.
  let icon = `<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
    <g transform="translate(0 -1028.4)">
      <path d="m12.031 1030.4c-3.8657 0-6.9998 3.1-6.9998 7 0 1.3 0.4017 2.6 1.0938 3.7 0.0334 0.1 0.059 0.1 0.0938 0.2l4.3432 8c0.204 0.6 0.782 1.1 1.438 1.1s1.202-0.5 1.406-1.1l4.844-8.7c0.499-1 0.781-2.1 0.781-3.2 0-3.9-3.134-7-7-7zm-0.031 3.9c1.933 0 3.5 1.6 3.5 3.5 0 2-1.567 3.5-3.5 3.5s-3.5-1.5-3.5-3.5c0-1.9 1.567-3.5 3.5-3.5z" fill="${iconColor}"/>
      <path d="m12.031 1.0312c-3.8657 0-6.9998 3.134-6.9998 7 0 1.383 0.4017 2.6648 1.0938 3.7498 0.0334 0.053 0.059 0.105 0.0938 0.157l4.3432 8.062c0.204 0.586 0.782 1.031 1.438 1.031s1.202-0.445 1.406-1.031l4.844-8.75c0.499-0.963 0.781-2.06 0.781-3.2188 0-3.866-3.134-7-7-7zm-0.031 3.9688c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5-3.5-1.567-3.5-3.5 1.567-3.5 3.5-3.5z" fill="${iconColor}" transform="translate(0 1028.4)"/>
    </g>
  </svg>`;

  let iconInstance = {}
  let iconType = 'inline-svg'; // start with fallback

  // If there is a hosted SVG, use that temporarily.
  if (marker?.icon) {
    icon = marker.icon;
    iconType = 'hosted-svg';
  }

  const iconSettings = {
    iconUrl: icon,
    color: iconColor,
  };

  // Make divIcon dependent on type.
  if (iconType === 'inline-svg') {
    iconInstance = L.divIcon({
      className: `leaflet-custom-icon--inline-svg ${iconColor}`,
      html: L.Util.template(iconSettings.iconUrl, iconSettings),
      iconAnchor: [12, 32],
      iconSize: [44, 44],
      popupAnchor: [0, -28],
    });
  } else {
    iconInstance = L.divIcon({
      className: 'leaflet-custom-icon--hosted-svg',
      html: L.Util.template(
        `<div class="leaflet-svg ${iconColor}"><img src=${iconSettings.iconUrl} /></div>`,
        iconSettings
      ),
      iconAnchor: [12, 32],
      iconSize: [25, 30],
      popupAnchor: [0, -28],
    });
  }

  // try to fetch hosted SVG async.
  if (marker?.icon) {
    fetch(marker.icon)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to fetch SVG: ${res.status}`);
        const text = await res.text();
        // Replace fallback SVG with fetched inline SVG
        const newHtml = text.replace(/fill=".*?"/g, `fill="${iconColor}"`); // optioneel kleur aanpassen
        iconInstance.options.html = newHtml;

        // force Leaflet to redraw icon.
        if (marker.ref) {
          marker.ref.setIcon(iconInstance);
        }
      })
      .catch((err) => {
        console.warn('SVG fetch failed, using fallback:', err);
      });
  }

  return iconInstance;
};