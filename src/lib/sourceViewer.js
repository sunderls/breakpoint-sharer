const $dom = document.getElementById('pane-main');
const Command = require('./command');
const codeMirror = CodeMirror($dom, {
	value: '// select file from left pane',
	mode:  "javascript",
	lineNumbers: true,
	readOnly: true
});

const SourceViewer = {
	render(fileUrl, source){
		this.fileUrl = fileUrl;
		codeMirror.setValue(source.content);
	},

	toggleBreakPointAtLine(lineNumber){
		Command('Debugger.setBreakpointByUrl', {
			lineNumber: lineNumber,
			url: this.fileUrl
		}).then((result) => {
			if (chrome.runtime.lastError){
				log(chrome.runtime.lastError);
			} else {
				log('set breakpoints:' + JSON.stringify(result));
			}
		});

	}
}

$(document).on('click', '.CodeMirror-linenumber', (e) => {
	let $target = $(e.target);
	$target.toggleClass('breakpoint');

	SourceViewer.toggleBreakPointAtLine($target.text() * 1);
})
module.exports = SourceViewer;