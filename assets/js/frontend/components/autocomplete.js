export default function AutoComplete(element) {
	const suggestions = element.parentNode.querySelector('.autocomplete');
	const [generalColumn, categoryColumn, productColumn] = suggestions.querySelectorAll(
		'.column ul',
	);

	/**
	 * hide the suggestion element
	 */
	function hideSuggestions() {
		suggestions.classList.add('hidden');
		suggestions.setAttribute('aria-hidden', true);
	}

	/**
	 * Create Suggestion elements
	 *
	 * @param {Array} results array containing the results that should be in one column
	 * @return {HTMLElement} One element containing the results
	 */
	function createSuggestionElements(results) {
		// return a span saying no results when there are none
		if (!results.length) {
			const warning = document.createElement('span');
			warning.classList.add('no-results');
			warning.innerText = 'No results...';
			return warning;
		}

		// since the ul element is already on the page we are
		// appending the li elements to the documentFragment
		const list = document.createDocumentFragment();

		// creating list elements with anchors for the results
		results.forEach((item) => {
			const listItem = document.createElement('li');
			const link = document.createElement('a');
			const paragraph = document.createElement('p');
			link.href = item.link;
			paragraph.innerText = item.title;

			// add an image if the result has one attached
			if (item.image) {
				const image = document.createElement('img');
				image.src = item.image;
				image.alt = item.title;
				link.appendChild(image);
			}

			link.appendChild(paragraph);
			listItem.appendChild(link);

			list.appendChild(listItem);
		});

		return list;
	}

	/**
	 * Clears the three ul elements from all search results
	 */
	function clearSuggestions() {
		generalColumn.textContent = '';
		categoryColumn.textContent = '';
		productColumn.textContent = '';
	}

	/**
	 * Show the suggestions in their respective columns
	 *
	 * @param {Array} results returned from ElasticPress
	 */
	function showSuggestions(results) {
		suggestions.classList.remove('hidden');
		suggestions.setAttribute('aria-hidden', false);

		const products = createSuggestionElements(results.products);
		const posts = createSuggestionElements(results.posts);
		const categories = createSuggestionElements(results.categories);

		productColumn.appendChild(products);
		generalColumn.appendChild(posts);
		categoryColumn.appendChild(categories);
	}

	/**
	 * Calls the api call against ElasticPress
	 *
	 * @param {string} searchTerm string to search for
	 * @return {Object} results from ElasticPress
	 */
	function requestResults(searchTerm) {
		return { products: [searchTerm] };
	}

	/**
	 * EventHandler for the search input
	 *
	 * @param {*} event input event
	 */
	async function handleSearchInput(event) {
		const searchTerm = event.target.value;

		// remove the suggestions if the searchTerm is empty
		if (!searchTerm || !searchTerm.length) {
			hideSuggestions();
			return;
		}

		const results = await requestResults(searchTerm);

		clearSuggestions();
		if (!results.products.length && !results.posts.length && !results.categories.length) {
			hideSuggestions();
			return;
		}

		showSuggestions(results);
	}

	function init() {
		element.addEventListener('input', handleSearchInput);
	}

	init();
}
