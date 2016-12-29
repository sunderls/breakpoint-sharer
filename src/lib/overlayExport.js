/**
 * overlay of export
 */
const $overlayExport = $('#overlay-export');
const $input = $overlayExport.find('textarea');
const Breakpoint = require('./breakpoint.js');

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
