const allBreakpoints = [];

const Breakpoint = {
	collect(obj){
		allBreakpoints.push(obj);
	}
}

window.allBreakpoints = allBreakpoints;
module.exports = Breakpoint;