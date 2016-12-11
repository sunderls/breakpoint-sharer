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
	let $target = $(e.target);
	$target.toggleClass('breakpoint');

	SourceViewer.toggleBreakPointAtLine($target.text());
})
module.exports = SourceViewer;