exports.debounce = function(func, skip){
    let timer = null;
    return function(){
        clearTimeout(timer);
        timer = setTimeout(func, skip || 100);
    };
};
