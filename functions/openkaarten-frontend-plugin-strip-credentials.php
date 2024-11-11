<?php
/**
 * Defines helper functions to strip user credentials from the given url.
 *
 * @package    Openkaarten_Frontend_Plugin
 * @subpackage Openkaarten_Frontend_Plugin/Helpers
 * @since      0.1.0
 */

if ( ! function_exists( 'openkaarten_frontend_plugin_strip_user_credentials' ) ) {
	/**
	 * Implements openkaarten_frontend_plugin_strip_user_credentials($url).
	 *
	 * @param string $url An url with credentials.
	 *
	 * @return string A stripped url without credentails
	 */
	function openkaarten_frontend_plugin_strip_user_credentials( $url ) {
		// Parse the URL.
		$parsed_url = parse_url( $url );

		// Check if the URL contains a username and password.
		if ( isset( $parsed_url['user'] ) && isset( $parsed_url['pass'] ) ) {
			// Rebuild the URL without user and pass.
			$stripped_url = ( isset( $parsed_url['scheme'] ) ? $parsed_url['scheme'] . '://' : '' ) .
				( isset( $parsed_url['host'] ) ? $parsed_url['host'] : '' ) .
				( isset( $parsed_url['path'] ) ? $parsed_url['path'] : '' ) .
				( isset( $parsed_url['query'] ) ? '?' . $parsed_url['query'] : '' ) .
				( isset( $parsed_url['fragment'] ) ? '#' . $parsed_url['fragment'] : '' );

			return $stripped_url;
		}

		// If no username/password, return original URL.
		return $url;
	}
}
