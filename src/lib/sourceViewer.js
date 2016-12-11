const $dom = document.getElementById('pane-main');
const SourceViewer = {
	render(source){
		var myCodeMirror = CodeMirror($dom, {
			value: source.content,
			mode:  "javascript",
			lineNumbers: true
		});
	}
}

module.exports = SourceViewer;