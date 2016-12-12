let params = location.search.slice(1).split('&').reduce((pre, curr) => {
    let pair = curr.split('=');
    pre[pair[0]] = pair[1];
    return pre;
}, {});

let debuggee = {
    tabId: params.tabId * 1
};

const Command = (command, params) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand(
            debuggee, command, params, (result) => {
                if (chrome.runtime.lastError){
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result);
                }
            });
    });
}

module.exports = Command;