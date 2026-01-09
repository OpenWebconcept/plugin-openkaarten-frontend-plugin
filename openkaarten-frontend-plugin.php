<?php
/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin admin area. This file also includes
 * all the dependencies used by the plugin, registers the activation and deactivation functions, and starts the plugin.
 *
 * @since             0.1.0
 * @package           Openkaarten_Frontend_Plugin
 *
 * @wordpress-plugin
 * Plugin Name:       OpenKaarten Frontend Plugin
 * Plugin URI:        https://openwebconcept.nl/
 * Description:       Adds OpenKaarten Blocks to the Gutenberg editor.
 * Version:           0.2.5
 * Author:            Acato
 * Author URI:        https://www.acato.nl
 * Text Domain:       openkaarten-frontend-plugin
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

require_once plugin_dir_path( __FILE__ ) . DIRECTORY_SEPARATOR . 'includes' . DIRECTORY_SEPARATOR . 'class-autoloader.php';
spl_autoload_register( array( '\Openkaarten_Frontend_Plugin\Includes\Autoloader', 'autoload' ) );

// Make sure global functions are loaded.
foreach ( glob( plugin_dir_path( __FILE__ ) . DIRECTORY_SEPARATOR . 'functions' . DIRECTORY_SEPARATOR . '*.php' ) as $openkaarten_frontend_plugin_functions ) {
	require_once $openkaarten_frontend_plugin_functions;
}

// Make sure global filters are loaded.
foreach ( glob( plugin_dir_path( __FILE__ ) . DIRECTORY_SEPARATOR . 'filters' . DIRECTORY_SEPARATOR . '*.php' ) as $openkaarten_frontend_plugin_filter ) {
	require_once $openkaarten_frontend_plugin_filter;
}

if ( ! defined( 'OPENKAARTEN_FRONTEND_VERSION' ) ) {
	define( 'OPENKAARTEN_FRONTEND_VERSION', '0.2.5' );
}

if ( ! defined( 'OPENKAARTEN_FRONTEND_PLUGIN_NAME' ) ) {
	define( 'OPENKAARTEN_FRONTEND_PLUGIN_NAME', 'OpenKaarten Frontend Plugin' );
}

/**
 * Begins execution of the plugin.
 */
new \Openkaarten_Frontend_Plugin\Includes\Plugin();
