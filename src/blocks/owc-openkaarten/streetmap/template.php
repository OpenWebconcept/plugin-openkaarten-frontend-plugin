<?php
/**
 * Template for the Streetmap Block.
 * Build the HTML for the Streetmap Block.
 *
 * @since      0.1.0
 * @package    Openkaarten_Frontend_Plugin
 * @subpackage Openkaarten_Frontend_Plugin/Src/Blocks/OWC_Openkaarten/Streetmap
 */

/**
 * Variables are passed on from the block-renderer.
 *
 * @global string $content    The Block content.
 * @global array  $attributes The Block attributes.
 */

// available endpoints.
// '/wp-json/owc/openkaarten/v1'.
// '/wp-json/owc/openkaarten/v1/datasets'.
// '/wp-json/owc/openkaarten/v1/datasets/id/{id}'.
// '/wp-json/owc/openkaarten/v1/datasets/id/{id}/{output_format}'.

$openkaarten_frontend_plugin_rest_uri = $attributes['rest_uri'];

if ( empty( $openkaarten_frontend_plugin_rest_uri ) || ! wp_http_validate_url( $openkaarten_frontend_plugin_rest_uri ) ) {
	$openkaarten_frontend_plugin_rest_uri = get_rest_url();
}

$openkaarten_frontend_plugin_rest_path = 'wp-json/owc/openkaarten/v1';

if ( preg_match( '/\/wp-json\/$/', $openkaarten_frontend_plugin_rest_uri ) ) {
	$openkaarten_frontend_plugin_rest_uri = preg_replace( '/\/wp-json\/$/', $openkaarten_frontend_plugin_rest_path, $openkaarten_frontend_plugin_rest_uri );
}

// For when only a base url is provided.
if ( ! preg_match( '/wp-json\//', $openkaarten_frontend_plugin_rest_uri ) ) {
	$openkaarten_frontend_plugin_rest_uri = trailingslashit( $openkaarten_frontend_plugin_rest_uri ) . $openkaarten_frontend_plugin_rest_path;
}

?>
<div
<?php
echo wp_kses_post(
	openkaarten_frontend_plugin_to_dom_attributes(
		[
			'id'                  => 'owc-openkaarten-streetmap',
			'class'               => 'owc-openkaarten-streetmap',
			'data-endpoint'       => esc_url( $openkaarten_frontend_plugin_rest_uri ),
			'data-title'          => esc_attr( $attributes['title'] ?? '' ),
			'data-dataset-ids'    => esc_attr( wp_json_encode( $attributes['selected_datasets'] ) ?: '' ),
			'data-tile-layer-uri' => esc_attr( $attributes['tile_layer_uri'] ),
		]
	)
);
?>
></div>
