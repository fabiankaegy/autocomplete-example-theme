function createQuery(searchTerm) {
	return `{ "index": "wss-dot-com-live" }\n{"from":0,"size":3,"_source":["term_id","name","slug"],"query":{"bool":{"should":[{"multi_match":{"query":"${searchTerm}","type":"phrase","fields":["name","slug","taxonomy","description"],"boost":4}},{"multi_match":{"query":"${searchTerm}","fields":["name","slug","taxonomy","description"],"boost":2,"fuzziness":0,"operator":"and"}},{"multi_match":{"fields":["name","slug","taxonomy","description"],"query":"${searchTerm}","fuzziness":1}}]}},"post_filter":{"bool":{"must":[{"term":{"taxonomy.raw":"post_tag"}}]}}}\n{ "index": "wss-dot-com-live" }\n{"from":0,"size":3,"_source":["post_id","post_title","permalink"],"sort":[{"_score":{"order":"desc"}}],"query":{"function_score":{"query":{"bool":{"should":[{"multi_match":{"query":"${searchTerm}","type":"phrase","fields":["post_title^1","post_excerpt^1","post_content^1","post_author.display_name^1","terms.post_tag.name^1","terms.category.name^1","terms.ep_custom_result.name^9999"],"boost":4}},{"multi_match":{"query":"${searchTerm}","fields":["post_title^1","post_excerpt^1","post_content^1","post_author.display_name^1","terms.post_tag.name^1","terms.category.name^1","terms.ep_custom_result.name^9999"],"boost":2,"fuzziness":0,"operator":"and"}},{"multi_match":{"query":"${searchTerm}","fields":["post_title^1","post_excerpt^1","post_content^1","post_author.display_name^1","terms.post_tag.name^1","terms.category.name^1","post_title.suggest^1"],"fuzziness":"auto"}}]}},"functions":[{"exp":{"post_date_gmt":{"scale":"14d","decay":0.25,"offset":"7d"}}}],"score_mode":"avg","boost_mode":"sum"}},"post_filter":{"bool":{"must":[{"terms":{"post_type.raw":["post"]}},{"terms":{"post_status":["publish"]}}]}}}\n{ "index": "wss-dot-com-live" }\n{"from":0,"size":3,"_source":["post_id","post_title","permalink"],"sort":[{"_score":{"order":"desc"}}],"query":{"function_score":{"query":{"bool":{"should":[{"multi_match":{"query":"${searchTerm}","type":"phrase","fields":["post_title^1","post_excerpt^1","post_content^1","post_author.display_name^1","terms.post_tag.name^1","terms.category.name^1","terms.ep_custom_result.name^9999"],"boost":4}},{"multi_match":{"query":"${searchTerm}","fields":["post_title^1","post_excerpt^1","post_content^1","post_author.display_name^1","terms.post_tag.name^1","terms.category.name^1","terms.ep_custom_result.name^9999"],"boost":2,"fuzziness":0,"operator":"and"}},{"multi_match":{"query":"${searchTerm}","fields":["post_title^1","post_excerpt^1","post_content^1","post_author.display_name^1","terms.post_tag.name^1","terms.category.name^1","post_title.suggest^1"],"fuzziness":"auto"}}]}},"functions":[{"exp":{"post_date_gmt":{"scale":"14d","decay":0.25,"offset":"7d"}}}],"score_mode":"avg","boost_mode":"sum"}},"post_filter":{"bool":{"must":[{"terms":{"post_type.raw":["product"]}},{"terms":{"post_status":["publish"]}}]}}}\n`;
}

const FAKE_RESPONSE = `{"took":19,"responses":[{"took":15,"timed_out":false,"_shards":{"total":5,"successful":5,"skipped":0,"failed":0},"hits":{"total":{"value":0,"relation":"eq"},"max_score":null,"hits":[]},"status":200},{"took":16,"timed_out":false,"_shards":{"total":5,"successful":5,"skipped":0,"failed":0},"hits":{"total":{"value":98,"relation":"eq"},"max_score":4.3572702,"hits":[{"_index":"wss-dot-com-live","_type":"_doc","_id":"6264","_score":4.3572702,"_source":{"post_title":"7 Questions to Stump a Solar Salesperson","post_id":6264,"permalink":"https://www.wholesalesolar.com/blog/7-questions-stump-solar-salesperson"}},{"_index":"wss-dot-com-live","_type":"_doc","_id":"11650","_score":4.3572702,"_source":{"post_title":"Monocrystalline vs. Polycrystalline Solar Panels","post_id":11650,"permalink":"https://www.wholesalesolar.com/blog/monocrystalline-vs-polycrystalline-solar-panels"}},{"_index":"wss-dot-com-live","_type":"_doc","_id":"68050","_score":4.019207,"_source":{"post_title":"Enphase Energy Ensemble: The Modular and Expandable Solar Energy Storage Solution We've Been Waiting For","post_id":68050,"permalink":"https://www.wholesalesolar.com/blog/enphase-energy-ensemble-overview"}}]},"status":200},{"took":19,"timed_out":false,"_shards":{"total":5,"successful":5,"skipped":0,"failed":0},"hits":{"total":{"value":2195,"relation":"eq"},"max_score":6.9516664,"hits":[{"_index":"wss-dot-com-live","_type":"_doc","_id":"40775","_score":6.9516664,"_source":{"post_title":"Solarland SLP015-06 Silver Poly 6 Volt Solar Panel","post_id":40775,"permalink":"https://www.wholesalesolar.com/9433258/solarland/solar-panels/solarland-slp015-06-silver-poly-6-volt-solar-panel"}},{"_index":"wss-dot-com-live","_type":"_doc","_id":"23317","_score":6.8997717,"_source":{"post_title":"Solarland SLP030-12 Silver Poly 12 Volt Solar Panel","post_id":23317,"permalink":"https://www.wholesalesolar.com/9434232/solarland/solar-panels/solarland-slp030-12-silver-poly-12-volt-solar-panel"}},{"_index":"wss-dot-com-live","_type":"_doc","_id":"38443","_score":6.816285,"_source":{"post_title":"Solis Inverters 3.6K-2G-US 240/208 Inverter","post_id":38443,"permalink":"https://www.wholesalesolar.com/2961036/solis-inverters/inverters/solis-inverters-3.6k-2g-us-240-208-inverter"}}]},"status":200}]}`;

/**
 * Truncate text
 *
 * @param {sring} text to truncate
 * @param {integer} maxLength character limit of the input
 * @param {boolean} useWordBoundary wether to stop at the last word
 * @return {string} truncated version of the input text
 */
function truncate(text, maxLength, useWordBoundary = true) {
	if (text.length <= maxLength) {
		return text;
	}
	const subString = text.substr(0, maxLength - 1);

	return `${useWordBoundary ? subString.substr(0, subString.lastIndexOf(' ')) : subString}...`;
}

/**
 * Adds an ElasticPress powered AutoComplete to an SearchField
 *
 * @param {HTMLElement} element DOM Node to initiate the AutoComplete on
 */
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
		results.forEach((result) => {
			const listItem = document.createElement('li');
			const link = document.createElement('a');
			const paragraph = document.createElement('p');
			link.href = result.permalink;
			paragraph.innerText = truncate(result.post_title, 15, false);

			// add an image if the result has one attached
			if (result.image) {
				const image = document.createElement('img');
				image.src = result.image;
				image.alt = result.title;
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
		const general = createSuggestionElements(results.general);
		const articles = createSuggestionElements(results.articles);

		productColumn.appendChild(products);
		generalColumn.appendChild(general);
		categoryColumn.appendChild(articles);
	}

	/**
	 * Calls the api call against ElasticPress
	 *
	 * @param {string} searchTerm string to search for
	 * @return {Object} results from ElasticPress
	 */
	async function requestResults(searchTerm) {
		// const request = await fetch(
		// 	'http://es-live.wholesalesolar.com/elasticsearch/wss-dot-com-live/_msearch',
		// 	{
		// 		method: 'POST',
		// 		headers: {
		// 			'content-type': 'application/x-ndjson',
		// 			Authorization: 'Basic dXNlcjpKbWhEbnFSN1lFdlY=',
		// 		},
		// 		body: createQuery(searchTerm),
		// 	},
		// );

		// if (!request.ok) {
		// 	console.error(request.statusText);
		// }

		// replace:
		const { responses } = JSON.parse(FAKE_RESPONSE);
		// with:
		// const { responses } = await request.text();;

		// pull out the three arrays of responses
		const [general, articles, products] = responses.map((items) => {
			// only put the actual post information in the returned array
			return items.hits.hits.map((item) => item._source);
		});

		// return an object containing the three named arrays
		return { general, articles, products };
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

		// get the search results
		const results = await requestResults(searchTerm);

		// clear old suggestions
		clearSuggestions();

		// hide the suggestion box when there are no results
		if (!results.products.length && !results.general.length && !results.articles.length) {
			hideSuggestions();
			return;
		}

		// show the suggestions on the page
		showSuggestions(results);
	}

	/**
	 * Initiates the autocomplete
	 */
	function init() {
		element.addEventListener('input', handleSearchInput);
	}

	init();
}
