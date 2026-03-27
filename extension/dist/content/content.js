// src/content/content.ts
var audioContext = null;
var filterChain = [];
var gainNode = null;
var processedElements = /* @__PURE__ */ new WeakSet();
var FREQUENCIES = [31, 63, 125, 250, 500, 1e3, 2e3, 4e3, 8e3, 16e3];
function initAudioContext() {
  if (!audioContext) {
    audioContext = new window.AudioContext();
    createFilterChain();
  }
  return audioContext;
}
function createFilterChain() {
  if (!audioContext) return;
  filterChain = [];
  if (!gainNode) {
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
  }
  let currentNode = gainNode;
  for (const freq of FREQUENCIES) {
    const filter = audioContext.createBiquadFilter();
    filter.type = "peaking";
    filter.frequency.value = freq;
    filter.Q.value = 1;
    filter.gain.value = 0;
    filter.connect(currentNode);
    filterChain.unshift(filter);
    currentNode = filter;
  }
}
function processAudioElement(element) {
  if (processedElements.has(element)) return;
  processedElements.add(element);
  const ctx = initAudioContext();
  if (!ctx) return;
  try {
    const source = ctx.createMediaElementAudioSourceNode(element);
    if (filterChain.length > 0) {
      source.connect(filterChain[0]);
    } else {
      source.connect(ctx.destination);
    }
  } catch (error) {
  }
}
function processAllAudioElements() {
  const audioElements = document.querySelectorAll("audio, video");
  audioElements.forEach((el) => {
    if (el instanceof HTMLMediaElement) {
      processAudioElement(el);
    }
  });
}
function updateEQFilters(eqValues, volume) {
  if (!audioContext || !gainNode) {
    initAudioContext();
  }
  if (gainNode) {
    gainNode.gain.value = Math.pow(10, volume / 20);
  }
  FREQUENCIES.forEach((freq, index) => {
    if (filterChain[index]) {
      filterChain[index].gain.value = eqValues[freq] || 0;
    }
  });
}
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === "UPDATE_EQ") {
    updateEQFilters(request.eqValues, request.volume);
  }
});
chrome.storage.sync.get(["eqValues", "volume"], (data) => {
  if (data.eqValues) {
    updateEQFilters(data.eqValues, data.volume ?? 0);
  }
});
var observer = new MutationObserver(() => {
  processAllAudioElements();
});
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
processAllAudioElements();
