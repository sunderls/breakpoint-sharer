const $narration = $('#narration');
const Breakpoint = require('./breakpoint.js');
const Helper = require('./helper.js');
let targetBreakpoint = null;

exports.show = (breakpoint) => {
    targetBreakpoint = breakpoint;
    $narration.text(breakpoint.comment || '').show();
}

exports.hide = () => {
    $narration.hide();
    targetBreakpoint = null;
}

$narration.on('input', Helper.debounce(function(){
    if (targetBreakpoint){
        targetBreakpoint.comment = $narration.text();
        Breakpoint.sync();
    }
}, 100));
