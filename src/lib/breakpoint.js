let allBreakpoints = [];
const Command = require('./command');
const $btnExport = $('#btn-export');
const $btnClear = $('#btn-clear');

const Breakpoint = {
    collect(obj){
        allBreakpoints.push(obj);
    },

    add(url, lineNumber){
        return Command('Debugger.setBreakpointByUrl', {
            lineNumber,
            url
        }).then((result) => {
            this.collect(result);
            this.sync();
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

    export(){
        let ids = allBreakpoints.map(item => item.breakpointId);
        let obj = {};
        ids.forEach((id) => {
            let segs = id.split(':');
            let url = segs.slice(0, 2).join(':');
            let other = segs.slice(2, 4).join(':');

            if (!obj[url]){
                obj[url] = [];
            }

            obj[url].push(other);
        });

        let result = {
            v: 1,
            breakpoints: obj
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
    }
}

chrome.runtime.sendMessage({msg:'GET_ALL_BREAKPOINTS'}, (res) => {
    allBreakpoints.push(...res);
    Breakpoint.updateBtns();
});

module.exports = Breakpoint;