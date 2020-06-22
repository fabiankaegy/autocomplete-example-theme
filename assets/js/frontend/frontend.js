import AutoComplete from './components/autocomplete';

wp.domReady(() => {
	const searchField = document.getElementById('search-field');

	if (!searchField) {
		console.warn('No search on the Page.');
		return;
	}

	AutoComplete(searchField);
});
