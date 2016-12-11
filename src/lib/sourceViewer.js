const $dom = document.getElementById('file-source');
const SourceViewer = {
	render(source){
		$dom.textContent = source.content;
	}
}

module.exports = SourceViewer;