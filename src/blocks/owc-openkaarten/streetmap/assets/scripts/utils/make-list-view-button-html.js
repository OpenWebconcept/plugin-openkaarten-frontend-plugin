export const makeListViewButtonHTML = (title, color) => {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
        <g clip-path="url(#a)" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 6h11M9 12h11M9 18h11M5 6v.01M5 12v.01M5 18v.01"/>
        </g>
    </svg>
    <span class="leaflet-control-list-view__control-text">${title}</span>
`
};
