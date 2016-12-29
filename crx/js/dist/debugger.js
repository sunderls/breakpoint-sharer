/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

/**
 * Command request helper
 */
let params = location.search.slice(1).split('&').reduce((pre, curr) => {
    let pair = curr.split('=');
    pre[pair[0]] = pair[1];
    return pre;
}, {});

let debuggee = {
    tabId: params.tabId * 1
};

const Command = (command, params) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand(
            debuggee, command, params, (result) => {
                if (chrome.runtime.lastError){
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result);
                }
            });
    });
}

module.exports = Command;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

/**
 * manage breakpoints
 */

let allBreakpoints = [];
const Command = __webpack_require__(0);
const $btnExport = $('#btn-export');
const $btnClear = $('#btn-clear');

const Breakpoint = {
    VERSION: 1,
    collect(obj){
        allBreakpoints.push(obj);
    },

    add(url, lineNumber, comment){
        return Command('Debugger.setBreakpointByUrl', {
            lineNumber,
            url
        }).then((result) => {
            result.comment = comment;
            this.collect(result);
            this.sync();
            return result;
        });
    },

    remove(breakpointId){
        return Command('Debugger.removeBreakpoint', {
            breakpointId
        }).then((result) => {
            let index = -1;
            let i = 0;
            while(i< allBreakpoints.length){
                if (allBreakpoints[i].breakpointId === breakpointId){
                    index = i;
                    break;
                }
                i++;
            };

            if (index > -1){
            allBreakpoints.splice(index, 1);
            }

            this.sync();
        });
    },

    exportToStr(){
        let breakpoints = {};
        let ids = allBreakpoints.forEach(item => {
            let id = item.breakpointId;
            let segs = id.split(':');
            let url = segs.slice(0, 2).join(':');
            let other = [segs.slice(2, 4).join(':')];

            if (item.comment){
                other.push(item.comment);
            }

            if (!breakpoints[url]){
                breakpoints[url] = [];
            }

            breakpoints[url].push(other.join(','));
        });

        let result = {
            v: this.VERSION,
            breakpoints: breakpoints
        };

        return JSON.stringify(result);
    },

    sync(){
        this.updateBtns();
        chrome.runtime.sendMessage({msg:'SYNC_ALL_BREAKPOINTS', breakpoints: allBreakpoints});
    },

    getAll(){
        return allBreakpoints;
    },

    updateBtns(){
        if (allBreakpoints.length > 0){
            $btnExport.prop('disabled', false);
            $btnClear.prop('disabled', false);
        } else {
            $btnExport.prop('disabled', true);
            $btnClear.prop('disabled', true);
        }

        $btnClear.text(`clear all(${allBreakpoints.length})`);
    },

    search(breakpointId){
        return allBreakpoints.filter(bp => bp.breakpointId === breakpointId)[0];
    }
}

chrome.runtime.sendMessage({msg:'GET_ALL_BREAKPOINTS'}, (res) => {
    allBreakpoints.push(...res);
    Breakpoint.updateBtns();
});

module.exports = Breakpoint;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

/**
 * source viewer at the mainarea
 */
const $dom = document.getElementById('pane-main');
const Command = __webpack_require__(0);
const Breakpoint = __webpack_require__(1);
const Narration = __webpack_require__(9);
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


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

/**
 * overlay of export
 */
const $overlayExport = $('#overlay-export');
const $input = $overlayExport.find('textarea');
const Breakpoint = __webpack_require__(1);

const OverlayExport = {
	show(){
		$input.val(Breakpoint.exportToStr() || '');
		$overlayExport.show();
		$input.select();
	},

	hide(){
		$overlayExport.hide();
	}
}

$overlayExport.on('click', '.cancel', ()=> OverlayExport.hide());

module.exports = OverlayExport;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

/**
 * overlay of export
 */
const $overlayImport = $('#overlay-import');
const $input = $overlayImport.find('textarea');
const SourceViewer = __webpack_require__(2);
const Breakpoint = __webpack_require__(1);

const OverlayImport = {
	show(){
		$input.val('');
		$overlayImport.show();
	},

	hide(){
		$overlayImport.hide();
	},

	import(str){
		let breakpoints = [];
		try {
			let data = JSON.parse(str.trim());
			// version check
			if (data.v * 1 > Breakpoint.VERSION){
				alert('please update your extension to support this format');
				return;
			}

			if (data.v * 1 == 1){
				for(let url in data.breakpoints){
					data.breakpoints[url].forEach((config) => {
						let segs = config.split(',');
						breakpoints.push({
							url,
							line: segs[0],
							comment: segs[1]
						});
					});
				}

				SourceViewer.clearAllBreakpoints();

				breakpoints.forEach((item) => {
					let segs = item.line.split(':');
					let lineNumber = segs[0] * 1;

					Breakpoint.add(item.url, lineNumber, item.comment);

					if (item.url === SourceViewer.fileUrl){
						SourceViewer.toggleBreakpointClassAtLine(lineNumber, true);
					}
				});

				this.hide();
			}
		} catch(e){
			alert('format invalid');
		}
	}
}

$overlayImport.on('click', '.cancel', ()=> OverlayImport.hide());
$overlayImport.on('click', '.confirm', ()=> {
	OverlayImport.import($input.val());
});

module.exports = OverlayImport;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

/**
 * resource viewer at the left sidebar
 */
const Command = __webpack_require__(0);
const SourceViewer = __webpack_require__(2);
const $dom = $('#resources');

const ResourceViewer = {
    selectedUrl: null,
    resources: null,
    render(resources){
        let html = resources.resources.filter(item => item.type === 'Script')
            .map(item => {
                let fileName = item.url.split('/').slice(-1)[0];
                return `<span class="nav-group-item ${item.url === this.selectedUrl ? 'active': ''} resource-file" title="${item.url}">
                    ${fileName}
                  </span>`;
            });
        $dom.html(html);

        this.resources = resources;
    }
};

$(document).on('click', '.resource-file', (e) => {
    let $target = $(e.target);
    let url = $target.attr('title');
    Command('Page.getResourceContent', {
        frameId: ResourceViewer.resources.frame.id,
        url
    }).then(SourceViewer.render.bind(SourceViewer, url));
    $target.siblings().removeClass('active');
    $target.addClass('active');
});

module.exports = ResourceViewer;


/***/ },
/* 6 */,
/* 7 */
/***/ function(module, exports, __webpack_require__) {

/**
 * debugger main
 */
const Command = __webpack_require__(0);
const SourceViewer = __webpack_require__(2);
const ResourceViewer = __webpack_require__(5);
const Breakpoint = __webpack_require__(1);
const OverlayExport = __webpack_require__(3);
const OverlayImport = __webpack_require__(4);
const Narration = __webpack_require__(9);

const $btnResume = $('#btn-resume');
const $btnPause = $('#btn-pause');
const $btnImport = $('#btn-import');
const $btnExport = $('#btn-export');
const $btnReload = $('#btn-reload');
const $btnClear = $('#btn-clear');
const $consoleInput = $('#console-input');
const $consoleLogs = $('#console-logs');


let pausedLineNumber = null;
const onPaused = (breakpointId) => {
    let lineNumber = breakpointId.split(':')[2] * 1;
    SourceViewer.toggleBreakpointClassAtLine(lineNumber, /*isAdd*/true);
    SourceViewer.toggleFocusClassAtLine(lineNumber, /*isAdd*/true);
    SourceViewer.showLine(lineNumber);
    $btnResume.prop('disabled', false);
    $btnPause.prop('disabled', true);

    let realBreakpoint = Breakpoint.search(breakpointId);
    Narration.show(realBreakpoint);
    pausedLineNumber = lineNumber;

};

const onResume = () => {
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
                onPaused(obj.hitBreakpoints[0]);
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
        let expression = $consoleInput.val()
        Command('Runtime.evaluate', {
            expression,
            returnByValue: true
         }).then((data) => {
            $consoleLogs.append(`<div class="console-log">${expression}</div>`);
            let result = data.result;
            switch (result.type){
                case 'object':
                    result = JSON.stringify(result.value);
                    break;
                case 'function':
                    result = '[function]'
                default:
                    result = result.value;
                    break;
            }
            $consoleLogs.append(`<div class="console-log result"> ⇨　${result}</div>`);
            $consoleLogs.scrollTop($consoleLogs[0].scrollHeight);
            $consoleInput.val('').focus();
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


/***/ },
/* 8 */,
/* 9 */
/***/ function(module, exports, __webpack_require__) {

const $narration = $('#narration');
const Breakpoint = __webpack_require__(1);
const Helper = __webpack_require__(10);
let targetBreakpoint = null;

exports.show = (breakpoint) => {
    targetBreakpoint = breakpoint;
    $narration.text(breakpoint.comment || '').show();
}

exports.hide = () => {
    $narration.hide();
    targetBreakpoint = null;
}

$narration.on('input', Helper.debounce(function(){
    if (targetBreakpoint){
        targetBreakpoint.comment = $narration.text();
        Breakpoint.sync();
    }
}, 100));


/***/ },
/* 10 */
/***/ function(module, exports) {

exports.debounce = function(func, skip){
    let timer = null;
    return function(){
        clearTimeout(timer);
        timer = setTimeout(func, skip || 100);
    };
};


/***/ }
/******/ ]);