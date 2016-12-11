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
/***/ function(module, exports) {

const $dom = document.getElementById('pane-main');
const SourceViewer = {
	render(source){
		var myCodeMirror = CodeMirror($dom, {
			value: source.content,
			mode:  "javascript",
			lineNumbers: true
		});
	}
}

module.exports = SourceViewer;

/***/ },
/* 2 */,
/* 3 */
/***/ function(module, exports, __webpack_require__) {

const Command = __webpack_require__(0);
const SourceViewer = __webpack_require__(1);

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
			let url = 'https://jp.vuejs.org/js/vue.js';
			Command('Page.getResourceContent', {
				frameId: frame.id,
				url
			}).then(SourceViewer.render.bind(SourceViewer));
		});
});

Command('Debugger.enable', {}).then(() => {
	Command('Debugger.setBreakpointByUrl', {
			lineNumber: 3318,
			url: 'https://jp.vuejs.org/js/vue.js'
		}).then((result) => {
			if (chrome.runtime.lastError){
				log(chrome.runtime.lastError);
			} else {
				log('set breakpoints:' + JSON.stringify(result));
			}
		});

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


/***/ }
/******/ ]);