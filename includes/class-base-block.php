<?php
/**
 * Abstract class for Block functions.
 *
 * Defines functions to be used when registering Blocks.
 *
 * @since      0.1.0
 *
 * @package    Openkaarten_Frontend_Plugin
 * @subpackage Openkaarten_Frontend_Plugin/Includes
 */

namespace Openkaarten_Frontend_Plugin\Includes;

/**
 * Abstract class for Block functions.
 *
 * Defines functions to be used when registering Blocks.
 *
 * @since      0.1.0
 * @package    Openkaarten_Frontend_Plugin
 * @subpackage Openkaarten_Frontend_Plugin/Includes
 * @author     Acato <info@acato.nl>
 */
abstract class Base_Block {
	/**
	 * Base_Block constructor.
	 */
	public function __construct() {
		add_action( 'init', [ $this, 'register_block' ] );
	}

	/**
	 * Register the Block.
	 */
	public function register_block() {
		$reflection = new \ReflectionClass( $this );
		$directory  = dirname( $reflection->getFileName() );

		register_block_type_from_metadata(
			$directory,
			[
				'render_callback' => [ $this, 'render_block' ],
			]
		);
	}

	/**
	 * Render the blocks HTML.
	 *
	 * @param array  $attributes An array of block attributes.
	 * @param string $content The content for the block.
	 *
	 * @return string The HTML for the block.
	 */
	abstract public function render_block( $attributes, $content );
}
