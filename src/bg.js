// store all 

const allBreakpoints = [];
let targetTab = null

let debuggerWindow = null;

chrome.browserAction.onClicked.addListener((tab) => {
    let debuggee = {tabId: tab.id};
    targetTab = tab;
    chrome.debugger.attach(debuggee, '1.0', () => {
        debuggerWindow = chrome.windows.create({
            url: `debugger.html?tabId=${tab.id}`,
            type: 'popup',
            width: 600,
            height: 700
        });
    });
});

chrome.debugger.onEvent.addListener((debuggeeId, method) => {
	//
});

chrome.debugger.onDetach.addListener((debuggeeId) => {
	allBreakpoints.splice(0);
	targetTab = null;
	debuggerWindow.close();
});