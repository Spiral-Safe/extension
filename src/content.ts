
function main() {
    console.log("Content Script Running");
    injectScript("inject.js");
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

main();