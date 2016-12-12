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

/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

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

const $dom = document.getElementById('pane-main');
const Command = __webpack_require__(0);
const Breakpoint = __webpack_require__(6);
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
                });
        } else {
            return Breakpoint.remove(`${this.fileUrl}:${lineNumber}:0`)
                .then((result) => {
                    this.toggleBreakpointClassAtLine(lineNumber, false);
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

module.exports = SourceViewer;

/***/ },
/* 2 */,
/* 3 */
/***/ function(module, exports, __webpack_require__) {

const Command = __webpack_require__(0);
const SourceViewer = __webpack_require__(1);
const ResourceViewer = __webpack_require__(5);
const Breakpoint = __webpack_require__(6);
const OverlayExport = __webpack_require__(7);
const OverlayImport = __webpack_require__(8);

const $btnResume = $('#btn-resume');
const $btnPause = $('#btn-pause');
const $btnImport = $('#btn-import');
const $btnExport = $('#btn-export');
const $btnReload = $('#btn-reload');
const $btnClear = $('#btn-clear');


let pausedLineNumber = null;

const onPaused = (lineNumber) => {
    $btnResume.prop('disabled', false);
    $btnPause.prop('disabled', true);
    pausedLineNumber = lineNumber;
};

const onResume = () => {
    $btnResume.prop('disabled', true);
    $btnPause.prop('disabled', false);
    SourceViewer.toggleFocusClassAtLine(pausedLineNumber, /*isAdd*/false);
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
    OverlayExport.show(Breakpoint.exportToStr());
};

const importBreakpoints = () => {
    OverlayImport.show();
};

const clear = () => {
    SourceViewer.clearAllBreakpoints();
}

// get vue.js content
Command('Page.enable', {}).then(() => {
    Command('Page.getResourceTree', {})
        .then((result) => {
            let frame = result.frameTree.frame;
            ResourceViewer.render(result.frameTree);
        });
});

Command('Debugger.enable', {}).then(() => {
    chrome.debugger.onEvent.addListener((source, method, obj) => {
        console.log(`Event:${method}, ${JSON.stringify(obj)}`);
        if (method === 'Debugger.paused'){
            // when script is stopped by breakpoints
            // scroll to it
            if (obj.hitBreakpoints){
                let lineNumber = obj.hitBreakpoints[0].split(':')[2] * 1;
                SourceViewer.toggleBreakpointClassAtLine(lineNumber, /*isAdd*/true);
                SourceViewer.toggleFocusClassAtLine(lineNumber, /*isAdd*/true);
                SourceViewer.showLine(lineNumber);
                onPaused(lineNumber);
            }
        } else if (method === 'Debugger.breakpointResolved'){
            // Breakpoint.collect(obj);
        } else if (method === 'Debugger.resumed'){
            onResume();
        }
    });
});

// document.getElementById('btn-run').addEventListener('click', () => {
//  let expression = document.getElementById('textarea-inject').value;
//  Command('Runtime.evaluate', {
//      expression
//  }).then((result) => {
//      log(result);
//  });
// }, false);

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
/* 4 */,
/* 5 */
/***/ function(module, exports, __webpack_require__) {

const Command = __webpack_require__(0);
const SourceViewer = __webpack_require__(1);
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
/* 6 */
/***/ function(module, exports, __webpack_require__) {

let allBreakpoints = [];
const Command = __webpack_require__(0);
const $btnExport = $('#btn-export');
const $btnClear = $('#btn-clear');

const Breakpoint = {
    collect(obj){
        allBreakpoints.push(obj);
    },

    add(url, lineNumber){
        return Command('Debugger.setBreakpointByUrl', {
            lineNumber,
            url
        }).then((result) => {
            this.collect(result);
            this.sync();
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
        let ids = allBreakpoints.map(item => item.breakpointId);
        let obj = {};
        ids.forEach((id) => {
            let segs = id.split(':');
            let url = segs.slice(0, 2).join(':');
            let other = segs.slice(2, 4).join(':');

            if (!obj[url]){
                obj[url] = [];
            }

            obj[url].push(other);
        });

        let result = {
            v: 1,
            breakpoints: obj
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
    }
}

chrome.runtime.sendMessage({msg:'GET_ALL_BREAKPOINTS'}, (res) => {
    allBreakpoints.push(...res);
    Breakpoint.updateBtns();
});

module.exports = Breakpoint;

/***/ },
/* 7 */
/***/ function(module, exports) {

const $overlayExport = $('#overlay-export');
const $input = $overlayExport.find('textarea');

const OverlayExport = {
	show(text){
		$input.val(text || '');
		$overlayExport.show();
		$input.select();
	},

	hide(){
		$overlayExport.hide();
	}
}

$overlayExport.on('click', '.cancel', ()=> OverlayExport.hide());
$overlayExport.on('click', '.confirm', ()=> {
	if ($input.val()){

	}
});

module.exports = OverlayExport;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

const $overlayImport = $('#overlay-import');
const $input = $overlayImport.find('textarea');
const SourceViewer = __webpack_require__(1);
const Breakpoint = __webpack_require__(6);

const OverlayImport = {
	show(){
		$input.val('');
		$overlayImport.show();
	},

	hide(){
		$overlayImport.hide();
	},

	import(str){
		let breakpointIds = [];
		try {
			let data = JSON.parse(str.trim());
			for(let url in data.breakpoints){
				data.breakpoints[url].forEach((line) => {
					breakpointIds.push(url + ':' + line);
				});
			}
		} catch(e){
			alert('format invalid');
			return;
		}

		SourceViewer.clearAllBreakpoints();

		breakpointIds.forEach((item) => {
			let segs = item.split(':');
			let url = segs.slice(0, 2).join(':');
			let lineNumber = segs[2] * 1;

			Breakpoint.add(url, lineNumber);

			if (url === SourceViewer.fileUrl){
				SourceViewer.toggleBreakpointClassAtLine(lineNumber, true);
			}
		});

		this.hide();
	}
}

$overlayImport.on('click', '.cancel', ()=> OverlayImport.hide());
$overlayImport.on('click', '.confirm', ()=> {
	OverlayImport.import($input.val());
});

module.exports = OverlayImport;

/***/ }
/******/ ]);