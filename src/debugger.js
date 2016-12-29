/**
 * debugger main
 */
const Command = require('./lib/command');
const SourceViewer = require('./lib/sourceViewer');
const ResourceViewer = require('./lib/resourceViewer');
const Breakpoint = require('./lib/breakpoint');
const OverlayExport = require('./lib/overlayExport');
const OverlayImport = require('./lib/overlayImport');
const Narration = require('./lib/narration');

const $btnResume = $('#btn-resume');
const $btnPause = $('#btn-pause');
const $btnImport = $('#btn-import');
const $btnExport = $('#btn-export');
const $btnReload = $('#btn-reload');
const $btnClear = $('#btn-clear');
const $consoleInput = $('#console-input');
const $consoleLogs = $('#console-logs');

let pausedObj = null;
let pausedLineNumber = null;
const onPaused = (obj) => {
    pausedObj = obj;
    let lineNumber = obj.hitBreakpoints[0].split(':')[2] * 1;
    SourceViewer.toggleBreakpointClassAtLine(lineNumber, /*isAdd*/true);
    SourceViewer.toggleFocusClassAtLine(lineNumber, /*isAdd*/true);
    SourceViewer.showLine(lineNumber);
    $btnResume.prop('disabled', false);
    $btnPause.prop('disabled', true);

    let realBreakpoint = Breakpoint.search(obj.hitBreakpoints[0]);
    Narration.show(realBreakpoint);
    pausedLineNumber = lineNumber;

};

const onResume = () => {
    pausedObj = null;
    $btnResume.prop('disabled', true);
    $btnPause.prop('disabled', false);
    SourceViewer.toggleFocusClassAtLine(pausedLineNumber, /*isAdd*/false);
    Narration.hide();
};

const resume = () => {
    Command('Debugger.resume', {}).then((result) => {
        console.log(`Debugger.resume ${JSON.stringify(result)}`)
    });
};

const pause = () => {
    Command('Debugger.pause', {}).then((result) => {
        console.log(`Debugger.pause ${JSON.stringify(result)}`);
    });
};

const exportBreakpoints = () => {
    OverlayExport.show();
};

const importBreakpoints = () => {
    OverlayImport.show();
};

const clear = () => {
    SourceViewer.clearAllBreakpoints();
}

const log = (str) => {
    $consoleLogs.append(`<div class="console-log result"> ⇨　${str}</div>`);
    $consoleLogs.scrollTop($consoleLogs[0].scrollHeight);
    $consoleInput.val('').focus();
}

// get resource tree
Command('Page.enable', {}).then(() => {
    Command('Page.getResourceTree', {})
        .then((result) => {
            let frame = result.frameTree.frame;
            ResourceViewer.render(result.frameTree);
        });
});

// enable debugger
Command('Debugger.enable', {}).then(() => {
    chrome.debugger.onEvent.addListener((source, method, obj) => {
        if (method === 'Debugger.paused'){
            // when script is stopped by breakpoints
            // scroll to it
            if (obj.hitBreakpoints){
                onPaused(obj);
            }
        } else if (method === 'Debugger.breakpointResolved'){
            // Breakpoint.collect(obj);
        } else if (method === 'Debugger.resumed'){
            onResume();
        }
    });
});



$consoleInput.on('keypress', (e) => {
    if (e.which === 13){
        let expression = $consoleInput.val();

        let cmd = 'Runtime.evaluate';
        let data = {
            expression,
            returnByValue: false,
            silent: true
        }

        if (pausedObj){
            data.callFrameId = pausedObj.callFrames[0].callFrameId;
            cmd = 'Debugger.evaluateOnCallFrame';
        }

        Command(cmd, data).then((data) => {
            $consoleLogs.append(`<div class="console-log">${expression}</div>`);
            let result = data.result;
            switch (result.type){
                case 'object':
                    Command('Runtime.getProperties', {
                        objectId: result.objectId,
                        ownProperties: true
                    }).then((data) => {
                        result = JSON.stringify(data);
                        log(result);
                    });
                    break;
                case 'function':
                    result = '[function]'
                default:
                    result = result.value;
                    log(result);
                    break;
            }
        });
    }
});

$btnResume.on('click', resume);
$btnPause.on('click', pause);
$btnExport.on('click', exportBreakpoints);
$btnImport.on('click', importBreakpoints);
$btnClear.on('click', clear);
$btnReload.on('click', () => {
    Command('Page.reload');
});

chrome.debugger.onDetach.addListener(() => {
    window.close();
});
