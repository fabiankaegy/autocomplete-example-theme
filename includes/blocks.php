<?php
/**
 * Gutenberg Blocks setup
 *
 * @package Searchexample\Core
 */

namespace Searchexample\Blocks;

/**
 * Set up blocks
 *
 * @return void
 */
function setup() {
	$n = function( $function ) {
		return __NAMESPACE__ . "\\$function";
	};

	add_action( 'enqueue_block_assets', $n( 'blocks_scripts' ) );
	add_action( 'enqueue_block_editor_assets', $n( 'blocks_editor_scripts' ) );

	add_filter( 'block_categories', $n( 'blocks_categories' ), 10, 2 );
}

/**
 * Enqueue shared frontend and editor JavaScript for blocks.
 *
 * @return void
 */
function blocks_scripts() {

	wp_enqueue_script(
		'blocks',
		SEARCHEXAMPLE_TEMPLATE_URL . '/dist/js/blocks.js',
		[],
		SEARCHEXAMPLE_VERSION,
		true
	);
}


/**
 * Enqueue editor-only JavaScript/CSS for blocks.
 *
 * @return void
 */
function blocks_editor_scripts() {

	wp_enqueue_script(
		'blocks-editor',
		SEARCHEXAMPLE_TEMPLATE_URL . '/dist/js/blocks-editor.js',
		[ 'wp-i18n', 'wp-element', 'wp-blocks', 'wp-components' ],
		SEARCHEXAMPLE_VERSION,
		false
	);

	wp_enqueue_style(
		'editor-style',
		SEARCHEXAMPLE_TEMPLATE_URL . '/dist/css/editor-style.css',
		[],
		SEARCHEXAMPLE_VERSION
	);

}

/**
 * Filters the registered block categories.
 *
 * @param array  $categories Registered categories.
 * @param object $post       The post object.
 *
 * @return array Filtered categories.
 */
function blocks_categories( $categories, $post ) {
	if ( ! in_array( $post->post_type, array( 'post', 'page' ), true ) ) {
		return $categories;
	}

	return array_merge(
		$categories,
		array(
			array(
				'slug'  => 'searchexample-blocks',
				'title' => __( 'Custom Blocks', 'searchexample' ),
			),
		)
	);
}
