// Audio processor for the page
let audioContext: AudioContext | null = null;
let filterChain: BiquadFilterNode[] = [];
let gainNode: GainNode | null = null;
const processedElements = new WeakSet<HTMLMediaElement>();
const FREQUENCIES = [31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

// Initialize audio context
function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window as any).AudioContext();
    createFilterChain();
  }
  return audioContext;
}

// Create the filter chain
function createFilterChain() {
  if (!audioContext) return;

  // Clear existing filters
  filterChain = [];

  // Create gain node for volume control
  if (!gainNode) {
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
  }

  // Create biquad filters for each frequency band
  let currentNode: AudioNode = gainNode;
  for (const freq of FREQUENCIES) {
    const filter = audioContext.createBiquadFilter();
    filter.type = "peaking";
    filter.frequency.value = freq;
    filter.Q.value = 1.0;
    filter.gain.value = 0;
    filter.connect(currentNode);
    filterChain.unshift(filter);
    currentNode = filter;
  }
}

// Process audio elements and apply EQ
function processAudioElement(element: HTMLMediaElement) {
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
    // createMediaElementAudioSourceNode throws if already connected — safe to ignore
  }
}

// Find and process all audio elements
function processAllAudioElements() {
  const audioElements = document.querySelectorAll("audio, video");
  audioElements.forEach((el) => {
    if (el instanceof HTMLMediaElement) {
      processAudioElement(el);
    }
  });
}

// Update EQ filters
function updateEQFilters(eqValues: Record<number, number>, volume: number) {
  if (!audioContext || !gainNode) {
    initAudioContext();
  }

  if (gainNode) {
    gainNode.gain.value = Math.pow(10, (volume / 20));
  }

  FREQUENCIES.forEach((freq, index) => {
    if (filterChain[index]) {
      filterChain[index].gain.value = eqValues[freq] || 0;
    }
  });
}

// Listen for messages from popup or service worker
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === "UPDATE_EQ") {
    updateEQFilters(request.eqValues, request.volume);
  }
});

// Load saved EQ state on init so navigating doesn't reset the EQ
chrome.storage.sync.get(["eqValues", "volume"], (data) => {
  if (data.eqValues) {
    updateEQFilters(data.eqValues, data.volume ?? 0);
  }
});

// Watch for new audio/video elements
const observer = new MutationObserver(() => {
  processAllAudioElements();
});

// Start observing the document
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

// Process existing elements
processAllAudioElements();
