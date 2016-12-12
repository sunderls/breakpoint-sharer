let allBreakpoints = [];
const Command = require('./command');
const $btnExport = $('#btn-export');

const Breakpoint = {
    collect(obj){
        allBreakpoints.push(obj);
        $btnExport.prop('disabled', false);
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

    remove(url, lineNumber){
        let breakpointId =  `${url}:${lineNumber}:0`;
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

            if (allBreakpoints.length < 1){
                $btnExport.prop('disabled', true);
            }
            this.sync();
        });
    },

    export(){
        return allBreakpoints.map(item => item.breakpointId).join(',');
    },

    sync(){
        chrome.runtime.sendMessage({msg:'SYNC_ALL_BREAKPOINTS', breakpoints: allBreakpoints});
    },

    getAll(){
        return allBreakpoints;
    }
}

chrome.runtime.sendMessage({msg:'GET_ALL_BREAKPOINTS'}, (res) => {
    allBreakpoints.push(...res);
});

window.allBreakpoints = allBreakpoints;
module.exports = Breakpoint;