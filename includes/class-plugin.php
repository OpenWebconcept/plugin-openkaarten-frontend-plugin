<?php
/**
 * The file that defines the core plugin class
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the admin area.
 *
 * @since      0.1.0
 *
 * @package    Openkaarten_Frontend_Plugin
 * @subpackage Openkaarten_Frontend_Plugin/Includes
 */

namespace Openkaarten_Frontend_Plugin\Includes;

use Openkaarten_Frontend_Plugin\Includes\Admin\Admin;
use Openkaarten_Frontend_Plugin\Includes\Frontend\Frontend;

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      0.1.0
 * @package    Openkaarten_Frontend_Plugin
 * @subpackage Openkaarten_Frontend_Plugin/Includes
 * @author     Acato <info@acato.nl>
 */
class Plugin {

	/**
	 * Define the core functionality of the plugin.
	 *
	 * Set the plugin name and the plugin version that can be used throughout the plugin.
	 * Define the locale, and set the hooks for the admin area and the public-facing side of the site.
	 */
	public function __construct() {
		$this->define_constants();

		/**
		 * Use the I18n class in order to set the domain and to register the hook with WordPress.
		 */
		new I18n();
		/**
		 * Register all the hooks related to the admin area functionality of the plugin.
		 */
		new Admin();

		/**
		 * Register all hooks related to the public-facing functionality of the plugin.
		 */
		new Frontend();
	}

	/**
	 * Define constants used by the plugin.
	 */
	private function define_constants() {
		if ( ! defined( 'OPENKAARTEN_FRONTEND_ABSPATH' ) ) {
			define( 'OPENKAARTEN_FRONTEND_ABSPATH', plugin_dir_path( __DIR__ ) );
		}
		if ( ! defined( 'OPENKAARTEN_FRONTEND_BLOCKS_DIR' ) ) {
			define( 'OPENKAARTEN_FRONTEND_BLOCKS_DIR', 'src/blocks/' );
		}
		if ( ! defined( 'OPENKAARTEN_FRONTEND_TEMPLATE_DIR' ) ) {
			define( 'OPENKAARTEN_FRONTEND_TEMPLATE_DIR', 'src/templates/' );
		}
		if ( ! defined( 'OPENKAARTEN_FRONTEND_ASSETS_DIR' ) ) {
			define( 'OPENKAARTEN_FRONTEND_ASSETS_DIR', 'build/' );
		}
		if ( ! defined( 'OPENKAARTEN_FRONTEND_ASSETS_URL' ) ) {
			define( 'OPENKAARTEN_FRONTEND_ASSETS_URL', esc_url( trailingslashit( plugins_url( '', __DIR__ ) ) . OPENKAARTEN_FRONTEND_ASSETS_DIR ) );
		}
	}

	/**
	 * Checks if file exists and if the file is populated, so we don't enqueue empty files.
	 *
	 * @param string $path The absolute path to the file.
	 *
	 * @return bool|mixed
	 */
	public static function has_resource( $path ) {

		static $resources = null;

		if ( isset( $resources[ $path ] ) ) {
			return $resources[ $path ];
		}

		// Check if resource exists and has content.
		// phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		$resources[ $path ] = @file_exists( $path ) && 0 < (int) @filesize( $path );

		return $resources[ $path ];
	}
}
