<?php
/**
 * Core setup, site hooks and filters.
 *
 * @package Searchexample\Core
 */

namespace Searchexample\Core;

/**
 * Set up theme defaults and register supported WordPress features.
 *
 * @return void
 */
function setup() {
	$n = function( $function ) {
		return __NAMESPACE__ . "\\$function";
	};

	add_action( 'after_setup_theme', $n( 'i18n' ) );
	add_action( 'after_setup_theme', $n( 'theme_setup' ) );
	add_action( 'wp_enqueue_scripts', $n( 'scripts' ) );
	add_action( 'wp_enqueue_scripts', $n( 'styles' ) );
	add_action( 'wp_head', $n( 'js_detection' ), 0 );
	add_action( 'wp_head', $n( 'add_manifest' ), 10 );

	add_filter( 'script_loader_tag', $n( 'script_loader_tag' ), 10, 2 );

	add_action( 'rest_api_init', $n( 'add_rest_routes' ) );
}

/**
 * Makes Theme available for translation.
 *
 * Translations can be added to the /languages directory.
 * If you're building a theme based on "searchexample", change the
 * filename of '/languages/Searchexample.pot' to the name of your project.
 *
 * @return void
 */
function i18n() {
	load_theme_textdomain( 'searchexample', SEARCHEXAMPLE_PATH . '/languages' );
}

/**
 * Sets up theme defaults and registers support for various WordPress features.
 */
function theme_setup() {
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support(
		'html5',
		array(
			'search-form',
			'gallery',
		)
	);

	// This theme uses wp_nav_menu() in three locations.
	register_nav_menus(
		array(
			'primary' => esc_html__( 'Primary Menu', 'searchexample' ),
		)
	);
}

/**
 * Enqueue scripts for front-end.
 *
 * @return void
 */
function scripts() {

	wp_enqueue_script(
		'frontend',
		SEARCHEXAMPLE_TEMPLATE_URL . '/dist/js/frontend.js',
		[ 'wp-dom-ready', 'wp-api-fetch' ],
		SEARCHEXAMPLE_VERSION,
		true
	);

	if ( is_page_template( 'templates/page-styleguide.php' ) ) {
		wp_enqueue_script(
			'styleguide',
			SEARCHEXAMPLE_TEMPLATE_URL . '/dist/js/styleguide.js',
			[],
			SEARCHEXAMPLE_VERSION,
			true
		);
	}

}

/**
 * Enqueue styles for front-end.
 *
 * @return void
 */
function styles() {

	wp_enqueue_style(
		'styles',
		SEARCHEXAMPLE_TEMPLATE_URL . '/dist/css/style.css',
		[],
		SEARCHEXAMPLE_VERSION
	);

	if ( is_page_template( 'templates/page-styleguide.php' ) ) {
		wp_enqueue_style(
			'styleguide',
			SEARCHEXAMPLE_TEMPLATE_URL . '/dist/css/styleguide-style.css',
			[],
			SEARCHEXAMPLE_VERSION
		);
	}
}

/**
 * Handles JavaScript detection.
 *
 * Adds a `js` class to the root `<html>` element when JavaScript is detected.
 *
 * @return void
 */
function js_detection() {

	echo "<script>(function(html){html.className = html.className.replace(/\bno-js\b/,'js')})(document.documentElement);</script>\n";
}

/**
 * Add async/defer attributes to enqueued scripts that have the specified script_execution flag.
 *
 * @link https://core.trac.wordpress.org/ticket/12009
 * @param string $tag    The script tag.
 * @param string $handle The script handle.
 * @return string
 */
function script_loader_tag( $tag, $handle ) {
	$script_execution = wp_scripts()->get_data( $handle, 'script_execution' );

	if ( ! $script_execution ) {
		return $tag;
	}

	if ( 'async' !== $script_execution && 'defer' !== $script_execution ) {
		return $tag;
	}

	// Abort adding async/defer for scripts that have this script as a dependency. _doing_it_wrong()?
	foreach ( wp_scripts()->registered as $script ) {
		if ( in_array( $handle, $script->deps, true ) ) {
			return $tag;
		}
	}

	// Add the attribute if it hasn't already been added.
	if ( ! preg_match( ":\s$script_execution(=|>|\s):", $tag ) ) {
		$tag = preg_replace( ':(?=></script>):', " $script_execution", $tag, 1 );
	}

	return $tag;
}

/**
 * Appends a link tag used to add a manifest.json to the head
 *
 * @return void
 */
function add_manifest() {
	echo "<link rel='manifest' href='" . esc_url( SEARCHEXAMPLE_TEMPLATE_URL . '/manifest.json' ) . "' />";
}

/**
 * Adds custom rest endpoints
 */
function add_rest_routes() {

	register_rest_route(
		'autocomplete/v1',
		'/search',
		[
			'methods'  => 'GET',
			'callback' => __NAMESPACE__ . '\get_search_results',
		]
	);

	/**
	 * Get search results from a rest request
	 *
	 * @param WP_REST_Request $request request
	 * @return String JSON string or results
	 */
	function get_search_results( $request ) {

		$keyword = $request['s'];

		$products = new \WP_Query(
			[
				'ep_integrate'   => true,
				'post_type'      => 'product',
				's'              => $keyword,
				'posts_per_page' => 3,
			]
		);

		$posts = new \WP_Query(
			[
				'ep_integrate' => true,
				'post_type'    => 'page',
				's'            => $keyword,
			]
		);

		$categories = new \WP_Query(
			[
				'ep_integrate'  => true,
				'search_fields' => [
					'taxonomies' => [ 'product_cat' ],
				],
				's'             => $keyword,
			]
		);

		$response = [];

		$response['products']   = array_map(
			__NAMESPACE__ . '\strip_response_post',
			$products->posts
		);
		$response['posts']      = array_map(
			__NAMESPACE__ . '\strip_response_post',
			$posts->posts
		);
		$response['categories'] = array_map(
			__NAMESPACE__ . '\strip_response_post',
			$categories->posts
		);

		return new \WP_REST_Response( $response );
	}

	/**
	 * Cleans up the response
	 *
	 * @param \WP_Post $post post
	 * @return Array
	 */
	function strip_response_post( $post ) {
		$stripped_post = [
			'title'  => $post->post_title,
			'link'   => $post->permalink,
			'image'  => get_the_post_thumbnail_url( $post ),
			'rating' => $post->_wc_average_rating,
		];

		return $stripped_post;
	}

}
