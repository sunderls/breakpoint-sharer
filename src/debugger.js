const Command = require('./lib/command');
const SourceViewer = require('./lib/sourceViewer');
const ResourceViewer = require('./lib/resourceViewer');

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
