<?php
/**
 * Get the ID from the mix-manifest file.
 *
 * @package    Openkaarten_Frontend_Plugin
 * @subpackage Openkaarten_Frontend_Plugin/Helpers
 * @since      0.1.0
 */

if ( ! function_exists( 'openkaarten_frontend_plugin_mix' ) ) {

	/**
	 * Just a little helper to get filenames from the mix-manifest file.
	 *
	 * @param {string} $path to file.
	 *
	 * @return string
	 */
	function openkaarten_frontend_plugin_mix( $path ): string {
		$manifest = OPENKAARTEN_FRONTEND_ABSPATH . OPENKAARTEN_FRONTEND_ASSETS_DIR . 'mix-manifest.json';

		if ( ! file_exists( $manifest ) ) {
			return OPENKAARTEN_FRONTEND_ASSETS_URL . $path;
		}

		$manifest = json_decode(
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			file_get_contents( $manifest )
		);

		// We need to set the `/` in front of the `$path` due to how the mix-manifest.json file is saved.
		if ( ! str_starts_with( $path, '/' ) ) {
			$path = '/' . $path;
		}

		$manifest = get_object_vars( $manifest );

		if ( ! array_search( $path, $manifest, true ) ) {
			return OPENKAARTEN_FRONTEND_ASSETS_URL . $path;
		}

		return untrailingslashit( OPENKAARTEN_FRONTEND_ASSETS_URL ) . $manifest[ $path ];
	}
}
