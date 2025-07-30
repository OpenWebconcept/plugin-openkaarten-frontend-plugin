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
 * @author     Acato <service+openkaarten@acato.nl>
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
	 *
	 * @return bool
	 */
	public function load_plugin_textdomain() {
		$path   = dirname( plugin_basename( __FILE__ ), 2 ) . '/languages/';
		$result = load_plugin_textdomain( 'openkaarten-frontend-plugin', false, $path );

		if ( $result ) {
			return true;
		}

		return false;
		/**
		 * To be discussed; Why did I remove this? (RP 2025-07-30)
		 * 1. $locale using get_locale() is the site locale, not the user locale. - The user locale could be different, so this
		 *    is not correct. I noticed this during debugging, load_plugin_textdomain uses determine_locale(), not get_locale().
		 * 2. The path displayed here is not correct; the correct path is $path/$textdomain-$locale.mo.
		 *    So in my case, the error was
		 *       Could not find openkaarten-frontend-plugin/languages//nl_NL.mo
		 *    while it should have been
		 *       Could not find openkaarten-frontend-plugin/languages/openkaarten-frontend-plugin-en_US.mo
		 * 3. We'll ignore the double slash for now
		 * 4. This error message is printed before any legitimate output, breaking every POST, potentially breaking every AJAX/
		 *    REST call and at the minimum showing the error in raw HTML. At least this should be an error_log, but preferably a
		 *    wrapper into Admin Notices.
		 *    In my case it only broke wp-admin as I have set Admin to English whereas the site is in Dutch, but in case of a
		 *    non-NL site, this would break the site.
		 * 5. Since all source texts are in English; at least, the error should not show on `en_*` locales.
		 * 6. Finally, the filter construction here is interesting; It is only used here, so it doesn't do anything, also, the
		 *    expected intention is to allow the user to change the locale using a filter, but that is not how WordPress works
		 *    (unfortunately).
		 */
		$locale = apply_filters( 'openkaarten_frontend_plugin_locale', get_locale(), 'openkaarten-frontend-plugin' );
		echo wp_kses_post( "Could not find $path/$locale.mo" );
	}
}
