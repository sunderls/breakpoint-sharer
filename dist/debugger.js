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
		debuggee, "Debugger.setBreakpointByUrl", {
			lineNumber: 572,
			url: 'https://jp.vuejs.org/js/vue.js'
		}, (result) => {
			if (chrome.runtime.lastError){
				log(chrome.runtime.lastError);
			} else {
				log('set breakpoints:' + JSON.stringify(result));
			}
		});

	chrome.debugger.onEvent.addListener((source, method, obj) => {
		log(`Event: ${method}, ${JSON.stringify(obj)}`);
	});
}

chrome.debugger.sendCommand(
	debuggee, "Page.getResourceTree", {},
	onDebuggerEnabled.bind(null, debuggee));

chrome.debugger.sendCommand(
	debuggee, "Debugger.enable", {},
	onDebuggerEnabled.bind(null, debuggee));



document.getElementById('btn-run').addEventListener('click', () => {
	let expression = document.getElementById('textarea-inject').value;
	chrome.debugger.sendCommand(
		debuggee, "Runtime.evaluate", {
			expression
		}, (result) => {
			log(result);
		});
}, false);


document.getElementById('btn-resume').addEventListener('click', () => {
	chrome.debugger.sendCommand(
		debuggee, "Debugger.resume", {}, (result) => {
			log(result);
		});
}, false);
