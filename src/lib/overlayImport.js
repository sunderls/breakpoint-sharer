/**
 * overlay of export
 */
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
