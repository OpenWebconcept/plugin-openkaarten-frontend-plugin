<?php
/**
 * Proxy API Endpoint Class
 *
 * Handles the REST API endpoint to proxy dataset requests.
 *
 * @since      0.1.0
 *
 * @package    Openkaarten_Frontend_Plugin
 * @subpackage Openkaarten_Frontend_Plugin/Includes
 */

namespace Openkaarten_Frontend_Plugin\Includes;

use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Proxy API Endpoint Class.
 *
 * Registers a REST API endpoint to fetch datasets with basic authentication.
 *
 * @since      0.1.0
 * @package    Openkaarten_Frontend_Plugin
 * @subpackage Openkaarten_Frontend_Plugin/Includes
 */
class Proxy_Datasets_Endpoint {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	/**
	 * Register REST API route for proxying dataset requests.
	 */
	public function register_routes() {
		register_rest_route(
			'openkaarten-frontend-plugin/v1',
			'/proxy-datasets',
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'fetch_dynamic_datasets' ],
				'permission_callback' => '__return_true',
			]
		);
	}

	/**
	 * Fetch dynamic datasets from a specified endpoint.
	 *
	 * @param WP_REST_Request $request The REST API request.
	 * @return WP_Error|WP_REST_Response The response or WP_Error on failure.
	 */
	public function fetch_dynamic_datasets( WP_REST_Request $request ) {
		$url      = esc_url_raw( $request->get_param( 'url' ) );
		$username = sanitize_text_field( $request->get_param( 'username' ) );
		$password = sanitize_text_field( $request->get_param( 'password' ) );

		// Validate URL parameter.
		if ( ! $url ) {
			return new WP_Error( 'missing_params', 'URL is missing or invalid', [ 'status' => 400 ] );
		}

		// Set up the request with Basic Authentication headers.
		$response = wp_remote_get(
			$url,
			[
				'headers' => [
					'Authorization' => 'Basic ' . base64_encode( "$username:$password" ),
					'Content-Type'  => 'application/json',
				],
			]
		);

		// Handle errors in the response.
		if ( is_wp_error( $response ) ) {
			$error_message = $response->get_error_message();
			error_log( 'Fetch error: ' . $error_message );

			return new WP_REST_Response(
				[
					'error'      => true,
					'message'    => 'Failed to fetch data',
					'debug_info' => $error_message,
				],
				500
			);
		}

		$status_code = wp_remote_retrieve_response_code( $response );
		if ( 200 !== $status_code ) {
			$error_message = "Unexpected HTTP status code: $status_code";
			error_log( $error_message );

			return new WP_REST_Response(
				[
					'error'      => true,
					'message'    => "HTTP request failed with status $status_code",
					'debug_info' => $error_message,
				],
				$status_code
			);
		}

		$body = wp_remote_retrieve_body( $response );

		return rest_ensure_response( json_decode( $body ) );
	}
}
