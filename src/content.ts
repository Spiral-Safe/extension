
function contentMain() {
    console.log("Content Script Running");
    injectScript("inject.js");
    registerMessageListener();
}

function registerMessageListener() {
    window.addEventListener('message', (event) => {
        console.log("contentMessageListener", event);
        // We only accept messages from our own page context to avoid security risks
        if (event.source !== window || !event.data || event.data.sender !== 'spiralSafe') {
            return;
        }
    
        const { type, payload, sender } = event.data;
    
        if (type === 'OPEN_EXTENSION_PAGE' && sender === 'spiralSafe') {
            // Use chrome.runtime.sendMessage to communicate with the background script
            chrome.runtime.sendMessage({ 
                type: 'OPEN_EXTENSION_PAGE', 
                payload 
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error opening extension page:', chrome.runtime.lastError.message);
                } else {
                    console.log('Extension page opened successfully');
                }
            });
        }
    });
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("Content script received message:", message, sender);
        if (message.type === 'SPIRALSAFE_KEYPAIR_RESPONSE') {
            // Forward the message to the web page context
            window.postMessage(
                {
                    type: 'SPIRALSAFE_KEYPAIR_RESPONSE',
                    payload: message.payload,
                    sender: 'spiralSafeExtension'
                },
                window.origin
            );
            sendResponse({ status: 'Keypair sent to web page' });
            return true;
        }
    });
}

function injectScript(scriptName: string) {
    try {
      const container = document.head || document.documentElement;
      const scriptTag = document.createElement("script");
      scriptTag.setAttribute("async", "false");
      scriptTag.src = chrome.runtime.getURL(scriptName);
      container.insertBefore(scriptTag, container.children[0]);
      container.removeChild(scriptTag);
    } catch (error) {
      console.error("provider injection failed.", error);
    }
  }

contentMain();