// Lightweight service worker — no audio processing here.
// All Web Audio runs in the content script via media element hooks.

// Relay EQ updates from popup to the active tab's content script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "UPDATE_EQ") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.tabs.sendMessage(tabId, request).catch(() => {
          // Content script may not be injected yet — safe to ignore
        });
      }
    });
  }
  return false;
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Audio Equalizer extension installed");
});
