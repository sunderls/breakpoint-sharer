/**
 * source viewer at the mainarea
 */
const $dom = document.getElementById('pane-main');
const Command = require('./command');
const Breakpoint = require('./breakpoint');
const Narration = require('./narration');
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
        this.initBreakpoints();
    },

    initBreakpoints(){
        let breakpoints = Breakpoint.getAll().filter(item => item.breakpointId.indexOf(this.fileUrl) === 0);
        breakpoints.forEach((item) => {
            let lineNumber = item.breakpointId.split(':')[2] * 1;
            this.toggleBreakpointClassAtLine(lineNumber, /*isAdd*/true);
        });
    },

    toggleBreakpointAtLine(lineNumber, isAdd){
        if (isAdd){
            return Breakpoint.add(this.fileUrl, lineNumber)
                .then((result) => {
                    this.toggleBreakpointClassAtLine(lineNumber, /*isAdd*/true);
                    Narration.show(result);
                });
        } else {
            return Breakpoint.remove(`${this.fileUrl}:${lineNumber}:0`)
                .then((result) => {
                    this.toggleBreakpointClassAtLine(lineNumber, false);
                    Narration.hide();
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

    toggleFocusClassAtLine(lineNumber, isAdd){
        if (isAdd){
            codeMirror.addLineClass(lineNumber, 'text', 'focused-line');
        } else {
            codeMirror.removeLineClass(lineNumber, 'text', 'focused-line');
        }
    },

    /**
     * show line
     */
    showLine(lineNumber){
        let t = codeMirror.charCoords({line: lineNumber, ch: 0}, "local").top;
        let middleHeight = codeMirror.getScrollerElement().offsetHeight / 2;
        codeMirror.scrollTo(null, t - middleHeight - 5);
    },

    clearAllBreakpoints(){
        Breakpoint.getAll().forEach((breakpoint) => {
            let segs = breakpoint.breakpointId.split(':');
            let url = segs.slice(0, 2).join(':');
            let lineNumber = segs[2] * 1;
            if (url === this.fileUrl){
                return this.toggleBreakpointAtLine(lineNumber, false);
            } else {
                Breakpoint.remove(breakpoint.breakpointId);
            }
        });
    }

}


codeMirror.on('gutterClick', (cm, line, gutter, e) => {
    let info = cm.getLineHandle(line);
    if (info.gutterClass === 'breakpoint'){
        SourceViewer.toggleBreakpointAtLine(line, false);
    } else {
        SourceViewer.toggleBreakpointAtLine(line, true);
    }
});

// when hover breakpoint mark, show the comment
$(document).on('mouseenter', '.CodeMirror-linenumber', function(e){
    let breakpointId = SourceViewer.fileUrl + ':' + ($(this).text() * 1 - 1) + ':0';
    let breakpoint = Breakpoint.search(breakpointId);
    if (breakpoint){
        Narration.show(breakpoint);
    }
});

// when hover, try show narration
module.exports = SourceViewer;
