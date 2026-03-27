// src/background/service-worker.ts
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "UPDATE_EQ") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.tabs.sendMessage(tabId, request).catch(() => {
        });
      }
    });
  }
  return false;
});
chrome.runtime.onInstalled.addListener(() => {
  console.log("Audio Equalizer extension installed");
});
