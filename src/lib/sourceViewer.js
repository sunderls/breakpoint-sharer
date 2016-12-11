const $dom = document.getElementById('pane-main');
const SourceViewer = {
	render(source){
		var myCodeMirror = CodeMirror($dom, {
			value: source.content,
			mode:  "javascript",
			lineNumbers: true
		});
	},

	toggleBreakPointAtLine(lineNumber){
		
	}
}

$(document).on('click', '.CodeMirror-linenumber', (e) => {
	SourceViewer.toggleBreakPointAtLine($(e.target).text());
})
module.exports = SourceViewer;