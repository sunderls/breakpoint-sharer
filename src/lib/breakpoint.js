const allBreakpoints = [];
const Command = require('./command');

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
		});
	}
}

window.allBreakpoints = allBreakpoints;
module.exports = Breakpoint;