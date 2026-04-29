<?php
/**
 * Register the Streetmap Block.
 *
 * Registers the Streetmap Block for usage in the Gutenberg editor.
 *
 * @since      0.1.0
 *
 * @package    Openkaarten_Frontend_Plugin
 * @subpackage Openkaarten_Frontend_Plugin/Src/Blocks/OWC_Openkaarten/Streetmap
 */

namespace Openkaarten_Frontend_Plugin\Src\Blocks\OWC_Openkaarten\Streetmap;

use Openkaarten_Frontend_Plugin\Includes\Base_Block;

/**
 * The Streetmap class.
 *
 * This is used to register and render the block.
 *
 * @since      0.1.0
 * @package    Openkaarten_Frontend_Plugin
 * @subpackage Openkaarten_Frontend_Plugin/Src/Blocks/OWC_Openkaarten/Streetmap
 * @author     Acato <service+openkaarten@acato.nl>
 */
class Streetmap extends Base_Block {
	/**
	 * Streetmap constructor.
	 */
	public function __construct() {
		parent::__construct();
		add_action( 'enqueue_block_assets', [ $this, 'localize_script' ], 11 );
	}

	/**
	 * Render the blocks HTML.
	 *
	 * @param array  $attributes An array of block attributes.
	 * @param string $content    The content for the block.
	 *
	 * @return string The HTML for the block.
	 */
	public function render_block( $attributes, $content ) {
		ob_start();
		include __DIR__ . '/template.php';
		$output = ob_get_clean();

		return $output;
	}

	/**
	 * Localize the streetmap view script with the icon base URL derived from
	 * the openkaarten-base plugin's location.
	 */
	public function localize_script() {
		wp_localize_script(
			'owc-openkaarten-streetmap-block',
			'openkaartenStreetmap',
			[
				'iconBaseUrl' => plugins_url( 'plugin-openkaarten-base/opengemeenten-iconenset/Regular/' ),
			]
		);
	}
}

new Streetmap();
