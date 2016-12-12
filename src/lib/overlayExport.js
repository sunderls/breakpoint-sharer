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