/**
 * click button to enable debugger
 */
chrome.browserAction.onClicked.addListener((tab) => {
	chrome.debugger.attach({tabId: tab.id}, '1.0', () => {
		chrome.windows.create({
			url: `debugger.html?tabId=${tab.id}`,
			type: 'popup',
			width: 600,
			height: 700
		});
	});
});