<?php
/**
 * Define the internationalization functionality
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      0.1.0
 *
 * @package    Openkaarten_Frontend_Plugin
 * @subpackage Openkaarten_Frontend_Plugin/Includes
 */

namespace Openkaarten_Frontend_Plugin\Includes;

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      0.1.0
 * @package    Openkaarten_Frontend_Plugin
 * @subpackage Openkaarten_Frontend_Plugin/Includes
 * @author     Acato <info@acato.nl>
 */
class I18n {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'plugins_loaded', [ $this, 'load_plugin_textdomain' ] );
	}

	/**
	 * Load the plugin text domain for translation.
	 */
	public function load_plugin_textdomain() {
		$path   = dirname( plugin_basename( __FILE__ ), 2 ) . '/languages/';
		$result = load_plugin_textdomain( 'openkaarten-frontend-plugin', false, $path );

		if ( $result ) {
			return;
		}

		$locale = apply_filters( 'openkaarten_frontend_plugin_locale', get_locale(), 'openkaarten-frontend-plugin' );
		echo wp_kses_post( "Could not find $path/$locale.mo" );
	}
}
