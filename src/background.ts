console.log('Background script running');

function backgroundMain() {
    backgroundListener();
}

function backgroundListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("backgroundListener", message, sender);
        if (message.type === 'OPEN_EXTENSION_PAGE') {
            console.log("OPEN_EXTENSION_PAGE", message);
            chrome.action.openPopup();
            sendResponse({ type: message.type, payload: message.payload, sender: message.sender });
            return true;
        } else if (message.type === 'SPIRALSAFE_KEYPAIR_RESPONSE') {
            console.log("SPIRALSAFE_KEYPAIR_RESPONSE", message);
            // Forward the message to the content script
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
                        console.log('Response from content script:', response);
                    });
                }
            });
            sendResponse({ status: 'Keypair forwarded to content script' });
            return true;
        }
    });
}

backgroundMain();
