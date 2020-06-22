<?php
/**
 * The template for displaying the search form.
 *
 * @package Searchexample
 */

?>

<div itemscope itemtype="http://schema.org/WebSite">
	<form role="search" id="searchform" class="search-form" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
		<meta itemprop="target" content="<?php echo esc_url( home_url() ); ?>/?s={s}" />
		<label for="search-field" class="screen-reader-text">
			<?php echo esc_html_x( 'Search for:', 'label', 'searchexample' ); ?>
		</label>
		<input itemprop="query-input" type="search" id="search-field" value="<?php echo get_search_query(); ?>" placeholder="<?php echo esc_attr_x( 'Search &hellip;', 'placeholder', 'searchexample' ); ?>" name="s" />
		<input type="submit" value="">
		<div class="autocomplete hidden" aria-hidden="true" >
			<div class="column">
				<b>General</b>
				<ul></ul>
			</div>
			<div class="column">
				<b>Categories</b>
				<ul></ul>
			</div>
			<div class="column">
				<b>Products</b>
				<ul></ul>
			</div>
		</div>
	</form>
</div>
