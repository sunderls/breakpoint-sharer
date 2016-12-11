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

	toggleBreakpointAtLine(lineNumber, isAdd){
		if (isAdd){
			Command('Debugger.setBreakpointByUrl', {
				lineNumber: lineNumber,
				url: this.fileUrl
			}).then((result) => {
				if (chrome.runtime.lastError){
					log(chrome.runtime.lastError);
				} else {
					this.toggleBreakpointClassAtLine(lineNumber, /*isAdd*/true);
				}
			});
		} else {
			console.log('remove');
			this.toggleBreakpointClassAtLine(lineNumber, false);

			Command('Debugger.setBreakpointByUrl', {
				lineNumber: lineNumber,
				url: this.fileUrl
			}).then((result) => {
				if (chrome.runtime.lastError){
					log(chrome.runtime.lastError);
				} else {
					this.toggleBreakpointClassAtLine(lineNumber, /*isAdd*/false);
				}
			});
		}
	},

	toggleBreakpointClassAtLine(lineNumber, isAdd){
		if (isAdd){
			codeMirror.addLineClass(lineNumber, 'gutter', 'breakpoint');
		} else {
			codeMirror.removeLineClass(lineNumber, 'gutter', 'breakpoint');
		}
	},

	/**
	 * show line
	 */
	showLine(lineNumber){
		let t = codeMirror.charCoords({line: lineNumber, ch: 0}, "local").top; 
		let middleHeight = codeMirror.getScrollerElement().offsetHeight / 2; 
	    codeMirror.scrollTo(null, t - middleHeight - 5); 
	}

}


codeMirror.on('gutterClick', (cm, line, gutter, e) => {
	console.log(cm, line, gutter, e);
	let info = cm.getLineHandle(line);
	if (info.gutterClass === 'breakpoint'){
		SourceViewer.toggleBreakpointAtLine(line, false);
	} else {
		SourceViewer.toggleBreakpointAtLine(line, true);
	}
});

window.codeMirror = codeMirror;
module.exports = SourceViewer;