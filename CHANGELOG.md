# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.2] - 2026-07-24

### Added

- Support for custom marker hex colors. Markers can now use a raw hex color (e.g. `#ff8800`) alongside the existing `marker-<name>` presets. Custom colors are applied inline via a `--owc-openkaarten-streetmap--marker-color` CSS variable, which also drives the marker's focus/hover ring, while presets keep using their stylesheet class. Unrecognised values fall back to the primary color.

## [0.4.1] - 2026-07-23

### Added

- Block setting (ToggleControl) to set the datalayer filters open or closed by default.

### Changed

- Primary color is now driven from a single CSS variable as the source of truth, so map, list view and polygon selection styling stay in sync.

## [0.4.0] - 2026-06-22

Large change: the Streetmap block can now be used multiple times on a single page.

### Added

- Support for multiple `owc-openkaarten/streetmap` blocks on one page (`multiple: true`). Each instance renders its own map, datalayer selection, filters, search field and tooltips independently.
- `window.openkaarten.maps` registry containing every map on the page, plus an optional `map` target argument on `window.openkaarten.addMarker()` and `window.openkaarten.clearLayer()` to address a specific map. Backwards compatible: `window.openkaarten.map` keeps pointing at the most recently registered map.
- Filterable proxy timeout `openkaarten_frontend_plugin_proxy_timeout` (default 15s) for external dataset requests.

### Changed

- Proxy datasets endpoint now resolves same-origin requests internally via `rest_do_request()` instead of an HTTP loopback. This prevents PHP worker deadlocks and timeouts (cURL error 28) when several maps load on one page.
- All previously global DOM ids and queries are now scoped per map instance (map container, search input, filter `aria` references, filter checkbox ids, marker highlighting and tooltip focus), so multiple maps no longer interfere with each other.
- Editor: the "Selected datalayers" preview is rendered per block instead of through a shared DOM id, so selecting datalayers in a second block now updates that block.
- Polygon selection/highlight state is scoped per map instance.
