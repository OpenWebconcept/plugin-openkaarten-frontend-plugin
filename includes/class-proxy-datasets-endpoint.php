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

		// If the URL points to this same site, handle the request internally
		// instead of doing an HTTP loopback. A loopback occupies a second PHP
		// worker while this request is still running, which can deadlock and
		// time out (cURL error 28) when multiple maps load on a single page.
		$local_route = $this->get_local_rest_route( $url );
		if ( false !== $local_route ) {
			return $this->fetch_local_datasets( $local_route['route'], $local_route['query'] );
		}

		// External source: perform a real HTTP request with Basic Authentication.
		$response = wp_remote_get(
			$url,
			[
				'timeout' => (int) apply_filters( 'openkaarten_frontend_plugin_proxy_timeout', 15 ),
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

	/**
	 * Determine whether a URL targets this site's REST API and, if so, return
	 * the internal route and query string.
	 *
	 * The URL is matched against this site's canonical REST base
	 * (`get_rest_url()`), so scheme, host, port and REST-prefix path must all
	 * match — a different scheme/port/host (e.g. another service on the same
	 * hostname, or a multisite/filtered REST host) is correctly treated as
	 * remote. The route is whatever follows the REST base path, which avoids
	 * mis-slicing when the prefix appears more than once in the path. Sites
	 * using the plain "?rest_route=" permalink form fall back to a remote
	 * request.
	 *
	 * @param string $url The requested URL.
	 * @return array|false ['route' => string, 'query' => string] when same-origin, or false otherwise.
	 */
	private function get_local_rest_route( $url ) {
		$rest_base = get_rest_url();

		// Only the pretty-permalink REST base can be matched by path prefix.
		if ( false !== strpos( $rest_base, 'rest_route=' ) ) {
			return false;
		}

		$base = wp_parse_url( $rest_base );
		$req  = wp_parse_url( $url );

		if ( empty( $base['host'] ) || empty( $req['host'] ) || empty( $req['path'] ) ) {
			return false;
		}

		// Same origin: scheme, host and port must all match the REST base.
		$same_origin = strtolower( $base['scheme'] ?? '' ) === strtolower( $req['scheme'] ?? '' )
			&& strtolower( $base['host'] ) === strtolower( $req['host'] )
			&& ( $base['port'] ?? null ) === ( $req['port'] ?? null );

		if ( ! $same_origin ) {
			return false;
		}

		// The request path must sit under the REST base path.
		$base_path = $base['path'] ?? '/';
		if ( 0 !== strpos( $req['path'], $base_path ) ) {
			return false;
		}

		// Route is whatever follows the base path, with a leading slash.
		$route = '/' . ltrim( substr( $req['path'], strlen( $base_path ) ), '/' );

		return [
			'route' => $route,
			'query' => $req['query'] ?? '',
		];
	}

	/**
	 * Dispatch a REST request internally, without an HTTP loopback.
	 *
	 * @param string $route The internal REST route.
	 * @param string $query The raw query string, if any.
	 * @return WP_REST_Response The response, mirroring the remote-fetch error shape on failure.
	 */
	private function fetch_local_datasets( $route, $query = '' ) {
		$request = new WP_REST_Request( 'GET', $route );

		// Map query-string parameters onto the internal request.
		if ( ! empty( $query ) ) {
			$query_params = [];
			wp_parse_str( $query, $query_params );
			foreach ( $query_params as $key => $value ) {
				$request->set_param( $key, $value );
			}
		}

		$response = rest_do_request( $request );

		if ( $response->is_error() ) {
			$error         = $response->as_error();
			$error_message = $error->get_error_message();
			$status_code   = $response->get_status() ? $response->get_status() : 500;
			error_log( 'Local dataset fetch error: ' . $error_message );

			return new WP_REST_Response(
				[
					'error'      => true,
					'message'    => 'Failed to fetch data',
					'debug_info' => $error_message,
				],
				$status_code
			);
		}

		return rest_ensure_response( $response->get_data() );
	}
}
