<?php
/**
 * The admin-specific functionality of the plugin.
 *
 * @package    Openkaarten_Frontend_Plugin
 * @subpackage Openkaarten_Frontend_Plugin/Includes/Admin
 * @since      0.1.0
 */

namespace Openkaarten_Frontend_Plugin\Includes\Admin;

use Openkaarten_Frontend_Plugin\Includes\Plugin;

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the admin-specific functionality of the plugin.
 *
 * @package    Openkaarten_Frontend_Plugin
 * @subpackage Openkaarten_Frontend_Plugin/Includes/Admin
 * @author     Acato <info@acato.nl>
 */
class Admin {
	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->load_blocks();

		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_block_editor_assets' ], 99 );

		if ( is_wp_version_compatible( '5.8' ) ) {
			add_filter( 'allowed_block_types_all', [ $this, 'allowed_block_types' ], 5, 1 );
		} else {
			// Deprecated since WordPress 5.8, read `https://developer.wordpress.org/reference/hooks/allowed_block_types/`.
			add_filter( 'allowed_block_types', [ $this, 'allowed_block_types' ], 5, 1 );
		}
	}


	/**
	 * Enqueue assets for dynamic blocks for the block editor.
	 */
	public function enqueue_block_editor_assets() {
		$script_asset_path = OPENKAARTEN_FRONTEND_ABSPATH . OPENKAARTEN_FRONTEND_ASSETS_DIR . 'index.asset.php';
		if ( Plugin::has_resource( $script_asset_path ) ) {
			$script_asset = require $script_asset_path;
		} else {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( 'openkaarten-frontend-plugin (index.asset.php) isn`t found. Forgot to run `npm run build`?' );

			return false;
		}

		if ( Plugin::has_resource( OPENKAARTEN_FRONTEND_ABSPATH . OPENKAARTEN_FRONTEND_ASSETS_DIR . 'index.js' ) ) {
			wp_enqueue_script(
				'openkaarten-frontend-plugin-editor',
				esc_url( OPENKAARTEN_FRONTEND_ASSETS_URL ) . 'index.js',
				$script_asset['dependencies'],
				$script_asset['version'],
				false
			);

			wp_localize_script( 'openkaarten-frontend-plugin-editor', 'openkaarten_frontend_plugin_editor_variables', apply_filters( 'openkaarten_frontend_plugin_editor_variables', [], get_the_ID() ) );

			if ( function_exists( 'wp_set_script_translations' ) ) {
				wp_set_script_translations( 'openkaarten-frontend-plugin-editor', 'openkaarten-frontend-plugin', trailingslashit( OPENKAARTEN_FRONTEND_ABSPATH ) . 'languages/' );
			}
		}

		// Loop through all blocks and check for existing `style.css` and enqueue it.
		foreach ( glob( OPENKAARTEN_FRONTEND_ABSPATH . OPENKAARTEN_FRONTEND_ASSETS_DIR . 'blocks/*/*', GLOB_ONLYDIR ) as $openkaarten_frontend_plugin_community ) {

			if ( ! Plugin::has_resource( $openkaarten_frontend_plugin_community . '/editor.css' ) ) {
				// Continue if the file is empty.
				continue;
			}

			$openkaarten_frontend_plugin_parts  = explode( '/', $openkaarten_frontend_plugin_community );
			$openkaarten_frontend_plugin_handle = implode( '-', array_slice( $openkaarten_frontend_plugin_parts, - 2 ) );

			wp_enqueue_style(
				"$openkaarten_frontend_plugin_handle-block-editor",
				openkaarten_frontend_plugin_mix( 'blocks/' . implode( '/', array_slice( $openkaarten_frontend_plugin_parts, - 2 ) ) . '/editor.css' ),
				[],
				filemtime( $openkaarten_frontend_plugin_community . '/editor.css' ) ?? OPENKAARTEN_FRONTEND_VERSION
			);
		}
	}

	/**
	 * Load all blocks.
	 */
	public function load_blocks() {
		foreach ( glob( OPENKAARTEN_FRONTEND_ABSPATH . OPENKAARTEN_FRONTEND_BLOCKS_DIR . '*/*/class-*.php' ) as $file ) {
			include_once $file;
		}

		foreach ( glob( OPENKAARTEN_FRONTEND_ABSPATH . OPENKAARTEN_FRONTEND_BLOCKS_DIR . '*/*/block.php' ) as $file ) {
			include_once $file;
		}
	}

	/**
	 * Register all blocks from this plugin as allowed block types.
	 *
	 * @param bool|array $allowed_block_types A list of allowed block types, true if all blocks are allowed.
	 *
	 * @return array $allowed_block_types A list of all blocks registered by this plugin.
	 */
	public function allowed_block_types( $allowed_block_types ) {
		$openkaarten_frontend_plugin_block_list = null;
		include_once OPENKAARTEN_FRONTEND_ABSPATH . OPENKAARTEN_FRONTEND_BLOCKS_DIR . 'block-list.php';

		if ( is_array( $allowed_block_types ) && is_array( $openkaarten_frontend_plugin_block_list ) ) {
			$allowed_block_types = array_merge( $allowed_block_types, $openkaarten_frontend_plugin_block_list );
		}

		return $allowed_block_types;
	}
}
