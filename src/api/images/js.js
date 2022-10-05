let paging = 10;
let page = 1;
let maxPage = 1;

const urlFilters = new URLSearchParams(window.location.search);

let filters = {};
function addCategory(p_cat, p_chan, p_chanId) {
	if (filters[p_cat] === undefined) {
		filters[p_cat] = {};
	}
	if (!Object.keys(filters[p_cat]).includes(p_chanId)) {
		filters[p_cat][p_chanId] = { name: p_chan, id: p_chanId };
	}
}

function removeElement(element) {
	element.remove();
}

function showFilters(p_filters) {
	let lastCat = '';
	let filterDiv = '<form action="' + window.location.href.split('?')[0] + '" method="get">';
	Object.keys(p_filters).forEach((category) => {
		filterDiv += category + '<ul id="filterboxes">';
		p_filters[category].forEach((fe_channel) => {
			let boxChecked = '';
			if (urlFilters.get('filters') === null || urlFilters.getAll('filters').includes(fe_channel.id)) {
				boxChecked = 'checked';
			}
			filterDiv +=
				'<li><input name="filters" type="checkbox" ' +
				boxChecked +
				' value="' +
				fe_channel.id +
				'" /><label for="' +
				fe_channel.id +
				'">' +
				fe_channel.name +
				'</label></li>';
		});
		filterDiv += '</ul>';
	});
	filterDiv += '<input type="submit" value="Filter" /></form>';
	document.getElementById('imagefilters').innerHTML = filterDiv;
}

function showImages(p_jsonObject) {
	let jsonObject = JSON.parse(p_jsonObject);
	maxPage = jsonObject.pageCount;
	let images = jsonObject.imageList;
	let newHtml = '<ul class="imgset">';
	images.forEach((image) => {
		newHtml +=
			'<li class="imgset"><img class="img" src="' +
			image.url +
			'" onError="removeElement(this.parentElement);" /></li>';
		addCategory(image.category, image.channel, image.channelId);
	});
	newHtml += '</ul>';
	document.getElementById('images').innerHTML = newHtml;
	showFilters(jsonObject.filterOptions);
}

function nextPage() {
	if (page < maxPage) {
		page++;
		requestImages(paging, page, urlFilters.getAll('filters').join(','));
	}
}

function prevPage() {
	if (page > 1) {
		page--;
		requestImages(paging, page, urlFilters.getAll('filters').join(','));
	}
}

function getImages(p_url) {
	xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			showImages(xmlhttp.responseText);
		}
	};
	xmlhttp.open('GET', p_url, false);
	xmlhttp.send();
}

function requestImages(pagesize, page, filters) {
	if (page > maxPage) {
		page = maxPage;
	}
	if (page < 1) {
		page = 1;
	}
	console.log('Requesting: /images/api/' + pagesize + '/' + page + '/' + filters);
	getImages('/images/api/' + pagesize + '/' + page + '/' + filters);
}

onload = function () {
	requestImages(paging, page, urlFilters.getAll('filters').join(','));
};
