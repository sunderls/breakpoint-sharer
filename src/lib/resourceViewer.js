const $dom = $('#resources');

const ResourceViewer = {
	selectedUrl: null,
	render(resources){
		let html = resources.resources.filter(item => item.type === 'Script')
			.map(item => {
				let fileName = item.url.split('/').slice(-1)[0];
				return `<span class="nav-group-item ${item.url === this.selectedUrl ? 'active': ''}" title="${item.url}">
				    ${fileName}
				  </span>`;
			});
		$dom.html(html);
	}
};


module.exports = ResourceViewer;