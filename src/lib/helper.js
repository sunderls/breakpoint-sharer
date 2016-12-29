exports.debounce = function(func, skip){
    let timer = null;
    return function(){
        clearTimeout(timer);
        timer = setTimeout(func, skip || 100);
    };
};


exports.generateDescription = (value) => {
	// currently not recursive
	switch (value.type) {
		case 'number':
			return value.value;
		case 'string':
			return `'${value.value}'`;
		case 'object':
			if (value.subtype === 'null'){
				return 'null';
			} else {
				return `[object]`;
			}
		case 'undefined':
			return 'undefined';
		case 'function':
			return '[function]';

	}
}