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
}

new Streetmap();
