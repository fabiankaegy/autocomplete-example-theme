<?php
/**
 * WP Theme constants and setup functions
 *
 * @package Searchexample
 */

// Useful global constants.
define( 'SEARCHEXAMPLE_VERSION', '0.1.0' );
define( 'SEARCHEXAMPLE_TEMPLATE_URL', get_template_directory_uri() );
define( 'SEARCHEXAMPLE_PATH', get_template_directory() . '/' );
define( 'SEARCHEXAMPLE_INC', SEARCHEXAMPLE_PATH . 'includes/' );

require_once SEARCHEXAMPLE_INC . 'core.php';
require_once SEARCHEXAMPLE_INC . 'overrides.php';
require_once SEARCHEXAMPLE_INC . 'template-tags.php';
require_once SEARCHEXAMPLE_INC . 'utility.php';
require_once SEARCHEXAMPLE_INC . 'blocks.php';

// Run the setup functions.
Searchexample\Core\setup();
Searchexample\Blocks\setup();

// Require Composer autoloader if it exists.
if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	require_once 'vendor/autoload.php';
}

if ( ! function_exists( 'wp_body_open' ) ) {

	/**
	 * Shim for the the new wp_body_open() function that was added in 5.2
	 */
	function wp_body_open() {
		do_action( 'wp_body_open' );
	}
}
