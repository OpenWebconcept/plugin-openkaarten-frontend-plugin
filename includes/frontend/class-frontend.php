<?php
/**
 * The public-facing functionality of the plugin.
 *
 * @package    Openkaarten_Frontend_Plugin
 * @subpackage Openkaarten_Frontend_Plugin/Includes/Frontend
 * @since      0.1.0
 */

namespace Openkaarten_Frontend_Plugin\Includes\Frontend;

use Openkaarten_Frontend_Plugin\Includes\Plugin;

/**
 * The public-facing functionality of the plugin.
 *
 * Defines public-facing functionality of the plugin.
 *
 * @package    Openkaarten_Frontend_Plugin
 * @subpackage Openkaarten_Frontend_Plugin/Includes/Frontend
 * @author     Acato <service+openkaarten@acato.nl>
 */
class Frontend {

	/**
	 * Constructor.
	 */
	public function __construct() {
		if ( is_wp_version_compatible( '5.8' ) ) {
			add_filter( 'block_categories_all', [ $this, 'register_custom_block_category' ], 10, 1 );
		} else {
			add_filter( 'block_categories_all', [ $this, 'register_custom_block_category' ], 10, 1 );
		}

		add_action( 'enqueue_block_assets', [ $this, 'enqueue_block_assets' ] );
		add_action( 'enqueue_block_assets', [ $this, 'dequeue_block_assets' ] );
	}

	/**
	 * Register a custom block category.
	 *
	 * @param array $categories Array of block categories.
	 *
	 * @return array Array of block categories.
	 */
	public function register_custom_block_category( $categories ) {
		$custom_block = array(
			'slug'  => 'openkaarten-frontend-plugin',
			'title' => __( 'OpenKaarten Blocks', 'openkaarten-frontend-plugin' ),
		);
		// move our custom category to te front of the categories array.
		array_unshift( $categories, $custom_block );

		return $categories;
	}

	/**
	 * Enqueue assets for dynamic blocks for the frontend.
	 */
	public function enqueue_block_assets() {
		if ( ! Plugin::has_resource( OPENKAARTEN_FRONTEND_ABSPATH . OPENKAARTEN_FRONTEND_ASSETS_DIR . 'mix-manifest.json' ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( 'openkaarten-frontend-plugin (mix-manifest.json) isn`t found. Forgot to run `npm run build` or `npx mix build --production` ?' );

			return false;
		}

		// Loop through all blocks and check for existing `style.css` and enqueue it.
		$openkaarten_frontend_plugin_communities = glob( OPENKAARTEN_FRONTEND_ABSPATH . OPENKAARTEN_FRONTEND_ASSETS_DIR . 'blocks/*/*', GLOB_ONLYDIR );
		if ( ! empty( $openkaarten_frontend_plugin_communities ) ) {
			foreach ( $openkaarten_frontend_plugin_communities as $openkaarten_frontend_plugin_community ) {

				$openkaarten_frontend_plugin_parts  = explode( '/', $openkaarten_frontend_plugin_community );
				$openkaarten_frontend_plugin_handle = implode( '-', array_slice( $openkaarten_frontend_plugin_parts, - 2 ) );

				if ( Plugin::has_resource( $openkaarten_frontend_plugin_community . '/style.css' ) ) {
					// Enqueue will be done from the `block.json`.
					wp_register_style(
						"$openkaarten_frontend_plugin_handle-block",
						openkaarten_frontend_plugin_mix( 'blocks/' . implode( '/', array_slice( $openkaarten_frontend_plugin_parts, - 2 ) ) . '/style.css' ),
						[],
						filemtime( $openkaarten_frontend_plugin_community . '/style.css' )
					);

				}
				if ( Plugin::has_resource( $openkaarten_frontend_plugin_community . '/client.js' ) ) {
					// Enqueue script (optional).
					// Enqueue will be done from the `block.json`.
					wp_register_script(
						"$openkaarten_frontend_plugin_handle-block",
						openkaarten_frontend_plugin_mix( 'blocks/' . implode( '/', array_slice( $openkaarten_frontend_plugin_parts, - 2 ) ) . '/client.js' ),
						false,
						filemtime( $openkaarten_frontend_plugin_community . '/client.js' ),
						true
					);
				}
			}
		}

		// Register shared block styles for the blocks.
		$openkaarten_frontend_plugin_shared_block_styles = glob( OPENKAARTEN_FRONTEND_ABSPATH . OPENKAARTEN_FRONTEND_ASSETS_DIR . 'client/blocks/*.css' );
		if ( ! empty( $openkaarten_frontend_plugin_shared_block_styles ) ) {
			foreach ( $openkaarten_frontend_plugin_shared_block_styles as $openkaarten_frontend_plugin_shared_block_style ) {

				$openkaarten_frontend_plugin_parts = explode( '/', $openkaarten_frontend_plugin_shared_block_style );
				$openkaarten_frontend_plugin_file  = implode( '-', array_slice( $openkaarten_frontend_plugin_parts, - 1 ) );

				if ( ! Plugin::has_resource( $openkaarten_frontend_plugin_shared_block_style ) ) {
					// Continue if the file is empty.
					continue;
				}

				// Enqueue will be done from the `block.json` if it's needed by a block as dependency.
				wp_register_style(
					substr( $openkaarten_frontend_plugin_file, 0, - 4 ),
					openkaarten_frontend_plugin_mix( 'client/blocks/' . $openkaarten_frontend_plugin_file ),
					[],
					filemtime( $openkaarten_frontend_plugin_shared_block_style )
				);
			}
		}
	}

	/**
	 * Dequeue assets for core blocks for the frontend when set in the settings page.
	 *
	 * @return void
	 */
	public function dequeue_block_assets() {
		$openkaarten_frontend_plugin_selected_default_block_styles = get_option( 'openkaarten_dequeue_default_block_styles', [] );
		if ( ! empty( $openkaarten_frontend_plugin_selected_default_block_styles ) ) {
			foreach ( $openkaarten_frontend_plugin_selected_default_block_styles as $openkaarten_frontend_plugin_selected_default_block_style ) {
				wp_dequeue_style( $openkaarten_frontend_plugin_selected_default_block_style );
			}
		}
	}
}
