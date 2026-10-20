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
		$url      = esc_url_raw( $request->get_param( 'url' ), [ 'http', 'https' ] );
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

		// This route is public (the map renders for anonymous visitors), so the
		// server must never fetch an arbitrary URL on the caller's behalf. Only
		// allow a datasets endpoint on a publicly routable host; this blocks
		// SSRF against loopback, private/reserved ranges and internal services.
		if ( ! $this->is_external_url_allowed( $url ) ) {
			return new WP_Error( 'invalid_url', 'The requested URL is not allowed.', [ 'status' => 403 ] );
		}

		// External source: perform a real HTTP request with Basic Authentication.
		// wp_safe_remote_get() re-validates the host of every hop at request
		// time, so a safe host cannot bounce to an internal one. Redirects are
		// disabled by default; raise the filter only when a trusted source
		// legitimately redirects (e.g. http->https canonicalisation).
		$response = wp_safe_remote_get(
			$url,
			[
				'timeout'     => (int) apply_filters( 'openkaarten_frontend_plugin_proxy_timeout', 15 ),
				'redirection' => (int) apply_filters( 'openkaarten_frontend_plugin_proxy_max_redirects', 0 ),
				'headers'     => [
					'Authorization' => 'Basic ' . base64_encode( "$username:$password" ),
					'Content-Type'  => 'application/json',
				],
			]
		);

		// Collapse every failure into one generic error. Returning the upstream
		// status or the error message would turn this route into a port scanner
		// (open vs. closed) and leak internal details.
		if ( is_wp_error( $response ) || 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
			return new WP_REST_Response(
				[
					'error'   => true,
					'message' => 'Failed to fetch data',
				],
				502
			);
		}

		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body );

		// Only return well-formed JSON; never hand back an arbitrary raw body.
		if ( JSON_ERROR_NONE !== json_last_error() ) {
			return new WP_REST_Response(
				[
					'error'   => true,
					'message' => 'Failed to fetch data',
				],
				502
			);
		}

		return rest_ensure_response( $data );
	}

	/**
	 * Determine whether an external URL may be fetched by the proxy.
	 *
	 * The URL must use http(s), resolve exclusively to publicly routable IP
	 * addresses (no loopback, private, reserved or link-local ranges) and point
	 * at a `datasets` endpoint. Hostnames are resolved and every resulting IP is
	 * checked, which — together with wp_safe_remote_get() re-validating at
	 * request time — mitigates DNS-rebinding.
	 *
	 * The result can be overridden with the
	 * `openkaarten_frontend_plugin_proxy_url_allowed` filter for environments
	 * that legitimately need a non-public host (e.g. staging).
	 *
	 * @param string $url The external URL.
	 * @return bool True when the URL is allowed.
	 */
	private function is_external_url_allowed( $url ) {
		$allowed = $this->validate_external_url( $url );

		/**
		 * Filters whether the proxy may fetch a given external URL.
		 *
		 * @param bool   $allowed Whether the URL is allowed.
		 * @param string $url     The requested URL.
		 */
		return (bool) apply_filters( 'openkaarten_frontend_plugin_proxy_url_allowed', $allowed, $url );
	}

	/**
	 * Perform the built-in safety checks for an external URL.
	 *
	 * @param string $url The external URL.
	 * @return bool True when the URL passes every check.
	 */
	private function validate_external_url( $url ) {
		$parts = wp_parse_url( $url );

		if ( empty( $parts['scheme'] ) || empty( $parts['host'] ) || empty( $parts['path'] ) ) {
			return false;
		}

		if ( ! in_array( strtolower( $parts['scheme'] ), [ 'http', 'https' ], true ) ) {
			return false;
		}

		// Restrict to a datasets endpoint, which is all this proxy is for.
		if ( ! preg_match( '#/datasets$#', rtrim( $parts['path'], '/' ) ) ) {
			return false;
		}

		$ips = $this->resolve_host( $parts['host'] );
		if ( empty( $ips ) ) {
			return false;
		}

		foreach ( $ips as $ip ) {
			if ( ! $this->is_public_ip( $ip ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Resolve a host to the list of IP addresses it points at.
	 *
	 * An IP literal is returned as-is; a hostname is resolved to its A and AAAA
	 * records.
	 *
	 * @param string $host The host, optionally an IPv6 literal in brackets.
	 * @return string[] The resolved IP addresses (may be empty).
	 */
	private function resolve_host( $host ) {
		$host = trim( $host, '[]' );

		if ( filter_var( $host, FILTER_VALIDATE_IP ) ) {
			return [ $host ];
		}

		$ips = gethostbynamel( $host );
		$ips = is_array( $ips ) ? $ips : [];

		if ( function_exists( 'dns_get_record' ) ) {
			$records = dns_get_record( $host, DNS_AAAA );
			if ( is_array( $records ) ) {
				foreach ( $records as $record ) {
					if ( ! empty( $record['ipv6'] ) ) {
						$ips[] = $record['ipv6'];
					}
				}
			}
		}

		return array_values( array_unique( $ips ) );
	}

	/**
	 * Determine whether an IP address is publicly routable.
	 *
	 * Rejects private (RFC1918, ULA) and reserved ranges, which covers loopback
	 * (127.0.0.0/8, ::1) and link-local (169.254.0.0/16, fe80::/10).
	 *
	 * @param string $ip The IP address.
	 * @return bool True when the IP is public.
	 */
	private function is_public_ip( $ip ) {
		return false !== filter_var(
			$ip,
			FILTER_VALIDATE_IP,
			FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
		);
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
