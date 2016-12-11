let params = location.search.slice(1).split('&').reduce((pre, curr) => {
	let pair = curr.split('=');
	pre[pair[0]] = pair[1];
	return pre;
}, {});

let debuggee = {
	tabId: params.tabId * 1
}

let log = (line) => {
	let l = line;
	if (typeof line === 'object'){
		l = JSON.stringify(line);
	}
	let p = document.createElement('p');
	p.textContent = l;
	document.body.appendChild(p);
}

const onDebuggerEnabled = (debuggee, result) => {
    chrome.debugger.sendCommand(
		debuggee, 'Debugger.setBreakpointByUrl', {
			lineNumber: 3318,
			url: 'https://jp.vuejs.org/js/vue.js'
		}, (result) => {
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
}

// get vue.js content
chrome.debugger.sendCommand(
	debuggee, 'Page.enable', {}, () => {
		chrome.debugger.sendCommand(
			debuggee, 'Page.getResourceTree', {},
			(result) => {
				let frame = result.frameTree.frame;
				let url = 'https://jp.vuejs.org/js/vue.js';
				chrome.debugger.sendCommand(debuggee, 'Page.getResourceContent', {
					frameId: frame.id,
					url
				}, log);
			});
	});

chrome.debugger.sendCommand(
	debuggee, 'Debugger.enable', {},
	onDebuggerEnabled.bind(null, debuggee));



document.getElementById('btn-run').addEventListener('click', () => {
	let expression = document.getElementById('textarea-inject').value;
	chrome.debugger.sendCommand(
		debuggee, 'Runtime.evaluate', {
			expression
		}, (result) => {
			log(result);
		});
}, false);


document.getElementById('btn-resume').addEventListener('click', () => {
	chrome.debugger.sendCommand(
		debuggee, 'Debugger.resume', {}, (result) => {
			log(result);
		});
}, false);

document.getElementById('btn-pause').addEventListener('click', () => {
	chrome.debugger.sendCommand(
		debuggee, 'Debugger.pause', {}, (result) => {
			log(result);
		});
}, false);
