const Command = require('./lib/command');
const SourceViewer = require('./lib/sourceViewer');
const ResourceViewer = require('./lib/resourceViewer');
const Breakpoint = require('./lib/breakpoint');

const $btnResume = $('#btn-resume');
const $btnPause = $('#btn-pause');

const onPaused = () => {
	$btnResume.prop('disabled', false);
	$btnPause.prop('disabled', true);
}

const onResume = () => {
	$btnResume.prop('disabled', true);
	$btnPause.prop('disabled', false);
}

const resume = () => {
	Command('Debugger.resume', {}).then((result) => {
		console.log(`Debugger.resume ${JSON.stringify(result)}`)
	});
}

const pause = () => {
	Command('Debugger.pause', {}).then((result) => {
		console.log(`Debugger.pause ${JSON.stringify(result)}`);
	});
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
				SourceViewer.showLine(lineNumber);
				onPaused();
			}
		} else if (method === 'Debugger.breakpointResolved'){
			Breakpoint.collect(obj);
		} else if (method === 'Debugger.resumed'){
			onResume();
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

$btnResume.on('click', resume);

$btnPause.on('click', pause);
