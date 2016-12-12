// store all breakpoints
let allBreakpoints = [];
let targetTab = null
let debuggerWindow = null;

chrome.browserAction.onClicked.addListener((tab) => {
    if (debuggerWindow){
        alert('Debugger Window is already displayed');
    } else {
        let debuggee = {tabId: tab.id};
        targetTab = tab;
        chrome.debugger.attach(debuggee, '1.0', () => {
            debuggerWindow = chrome.windows.create({
                url: `debugger.html?tabId=${tab.id}`,
                type: 'popup',
                width: 600,
                height: 700
            }, (a) => {
                debuggerWindow = a;
            });
        });
    }
});

chrome.debugger.onEvent.addListener((debuggeeId, method) => {
    //
});

chrome.debugger.onDetach.addListener((debuggeeId) => {
    allBreakpoints.splice(0);
    debuggerWindow = null;
    targetTab = null;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.msg === "GET_ALL_BREAKPOINTS"){
        sendResponse(allBreakpoints);
    } else if (request.msg === 'SYNC_ALL_BREAKPOINTS'){
        allBreakpoints = request.breakpoints;
    }
});

chrome.windows.onRemoved.addListener((windowId) => {
    if (debuggerWindow.id === windowId){
        chrome.debugger.detach({tabId: targetTab.id}, (result) => {
            debuggerWindow = null;
            targetTab = null;
        });
    }
});