const { apiFetch } = wp;

export default function AutoComplete(element) {
	const suggestions = element.parentNode.querySelector('.autocomplete');
	const [generalColumn, categoryColumn, productColumn] = suggestions.querySelectorAll(
		'.column ul',
	);

	function hideSuggestions() {
		suggestions.classList.add('hidden');
		suggestions.setAttribute('aria-hidden', true);
	}

	function createSuggestionList(results) {
		const list = document.createDocumentFragment();

		if (!results.length) {
			const warning = document.createElement('span');
			warning.classList.add('no-results');
			warning.innerText = 'No results...';
			return warning;
		}

		results.forEach((item) => {
			const listItem = document.createElement('li');
			const link = document.createElement('a');
			const paragraph = document.createElement('p');
			link.href = item.link;
			paragraph.innerText = item.title;

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

	function clearSuggestions() {
		generalColumn.innerHTML = '';
		categoryColumn.innerHTML = '';
		productColumn.innerHTML = '';
	}

	function showSuggestions(results) {
		suggestions.classList.remove('hidden');
		suggestions.setAttribute('aria-hidden', false);

		clearSuggestions();

		if (!results.products.length && !results.posts.length && !results.categories.length) {
			return hideSuggestions();
		}

		const products = createSuggestionList(results.products);
		const posts = createSuggestionList(results.posts);
		const categories = createSuggestionList(results.categories);

		productColumn.appendChild(products);
		generalColumn.appendChild(posts);
		categoryColumn.appendChild(categories);
	}

	async function requestResults(searchTerm) {
		try {
			const results = await apiFetch({
				path: `autocomplete/v1/search?s=${searchTerm}`,
			});

			console.log(results);

			showSuggestions(results);

			return true;
		} catch (error) {
			return console.error(error);
		}
	}

	async function handleSearchInput(event) {
		const {
			target: { value },
		} = event;

		if (!value || !value.length) {
			// remove the autosuggest
			hideSuggestions();

			return;
		}

		await requestResults(value);
	}

	function init() {
		element.addEventListener('input', handleSearchInput);
	}

	init();
}
