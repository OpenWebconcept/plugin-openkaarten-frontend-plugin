export const makeMapButtonHTML = (title, color) => {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 7L9 4L15 7L21 4V17L15 20L9 17L3 20V7Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 4V17" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15 7V20" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="leaflet-control-map-view__control-text">${title}</span>
`
};

