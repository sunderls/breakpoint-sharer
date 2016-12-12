const $overlayImport = $('#overlay-import');
const $input = $overlayImport.find('textarea');
const SourceViewer = require('./sourceViewer');
const Breakpoint = require('./breakpoint');

const OverlayImport = {
	show(){
		$input.val('');
		$overlayImport.show();
	},

	hide(){
		$overlayImport.hide();
	},

	import(str){
		let breakpointIds = str.trim().split(',');
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