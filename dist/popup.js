const start = () => {
    chrome.tabs.query({
        active: true,
        currentWindow: true 
    }, (tabs) => {
        let tab = tabs[0];
        let debuggee = {tabId: tab.id};
        chrome.debugger.attach(debuggee, '1.0', () => {
            chrome.windows.create({
                url: `debugger.html?tabId=${tab.id}`,
                type: 'popup',
                width: 600,
                height: 700
            });
        });
    });
}

document.getElementById('btn-start').addEventListener('click', start, false);