const $dom = document.getElementById('pane-main');

const codeMirror = CodeMirror($dom, {
	value: '// select file from left pane',
	mode:  "javascript",
	lineNumbers: true
});


const SourceViewer = {
	render(source){
		codeMirror.setValue(source.content);
	},

	toggleBreakPointAtLine(lineNumber){

	}
}

$(document).on('click', '.CodeMirror-linenumber', (e) => {
	SourceViewer.toggleBreakPointAtLine($(e.target).text());
})
module.exports = SourceViewer;