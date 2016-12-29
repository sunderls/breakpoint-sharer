/**
 * manage breakpoints
 */

let allBreakpoints = [];
const Command = require('./command');
const $btnExport = $('#btn-export');
const $btnClear = $('#btn-clear');

const Breakpoint = {
    VERSION: 1,
    collect(obj){
        allBreakpoints.push(obj);
    },

    add(url, lineNumber, comment){
        return Command('Debugger.setBreakpointByUrl', {
            lineNumber,
            url
        }).then((result) => {
            result.comment = comment;
            this.collect(result);
            this.sync();
            return result;
        });
    },

    remove(breakpointId){
        return Command('Debugger.removeBreakpoint', {
            breakpointId
        }).then((result) => {
            let index = -1;
            let i = 0;
            while(i< allBreakpoints.length){
                if (allBreakpoints[i].breakpointId === breakpointId){
                    index = i;
                    break;
                }
                i++;
            };

            if (index > -1){
            allBreakpoints.splice(index, 1);
            }

            this.sync();
        });
    },

    exportToStr(){
        let breakpoints = {};
        let ids = allBreakpoints.forEach(item => {
            let id = item.breakpointId;
            let segs = id.split(':');
            let url = segs.slice(0, 2).join(':');
            let other = [segs.slice(2, 4).join(':')];

            if (item.comment){
                other.push(item.comment);
            }

            if (!breakpoints[url]){
                breakpoints[url] = [];
            }

            breakpoints[url].push(other.join(','));
        });

        let result = {
            v: this.VERSION,
            breakpoints: breakpoints
        };

        return JSON.stringify(result);
    },

    sync(){
        this.updateBtns();
        chrome.runtime.sendMessage({msg:'SYNC_ALL_BREAKPOINTS', breakpoints: allBreakpoints});
    },

    getAll(){
        return allBreakpoints;
    },

    updateBtns(){
        if (allBreakpoints.length > 0){
            $btnExport.prop('disabled', false);
            $btnClear.prop('disabled', false);
        } else {
            $btnExport.prop('disabled', true);
            $btnClear.prop('disabled', true);
        }

        $btnClear.text(`clear all(${allBreakpoints.length})`);
    },

    search(breakpointId){
        return allBreakpoints.filter(bp => bp.breakpointId === breakpointId)[0];
    }
}

chrome.runtime.sendMessage({msg:'GET_ALL_BREAKPOINTS'}, (res) => {
    allBreakpoints.push(...res);
    Breakpoint.updateBtns();
});

module.exports = Breakpoint;
