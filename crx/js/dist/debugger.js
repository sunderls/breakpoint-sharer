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
				resolve(result);
			});
	});
}

module.exports = Command;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

const $dom = document.getElementById('pane-main');
const Command = __webpack_require__(0);
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

/***/ },
/* 2 */,
/* 3 */
/***/ function(module, exports, __webpack_require__) {

const Command = __webpack_require__(0);
const SourceViewer = __webpack_require__(1);
const ResourceViewer = __webpack_require__(5);

let log = (line) => {
	let l = line;
	if (typeof line === 'object'){
		l = JSON.stringify(line);
	}
	let p = document.createElement('p');
	p.textContent = l;
	document.body.appendChild(p);
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
		if (method == 'Debugger.paused'){
			log(`Event: ${method}, ${JSON.stringify(obj)}`);
		}
	});
});

// document.getElementById('btn-run').addEventListener('click', () => {
// 	let expression = document.getElementById('textarea-inject').value;
// 	Command('Runtime.evaluate', {
// 		expression
// 	}).then((result) => {
// 		log(result);
// 	});
// }, false);


document.getElementById('btn-resume').addEventListener('click', () => {
	Command('Debugger.resume', {}).then((result) => {
		log(result);
	});
}, false);

document.getElementById('btn-pause').addEventListener('click', () => {
	Command('Debugger.pause', {}).then((result) => {
		log(result);
	});
}, false);


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

/***/ }
/******/ ]);