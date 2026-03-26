// Audio context and filter chains per tab
const audioContexts = new Map<number, AudioContext>();
const filterChains = new Map<number, Array<BiquadFilterNode>>();
const gainNodes = new Map<number, GainNode>();
const streamProcessors = new Map<number, { source: MediaStreamAudioSourceNode; processor: ScriptProcessorNode }>();

// Frequency bands for the 10-band EQ
const FREQUENCIES = [31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

// Initialize audio processing for a tab
async function initAudioProcessing(tabId: number, eqValues: Record<number, number>, volume: number) {
  // Get or create AudioContext
  let context = audioContexts.get(tabId);
  if (!context || context.state === "closed") {
    context = new (window as any).AudioContext();
    audioContexts.set(tabId, context);
  }

  // Resume context if suspended
  if (context.state === "suspended") {
    await context.resume();
  }

  // Create filter chain
  const filters: BiquadFilterNode[] = [];
  let currentNode: AudioNode = context.destination;

  // Create gain node for volume control
  const gainNode = context.createGain();
  gainNode.gain.value = Math.pow(10, (volume / 20)); // Convert dB to linear
  gainNode.connect(context.destination);
  gainNodes.set(tabId, gainNode);
  currentNode = gainNode;

  // Create biquad filters for each frequency band
  for (const freq of FREQUENCIES) {
    const filter = context.createBiquadFilter();
    filter.type = "peaking";
    filter.frequency.value = freq;
    filter.Q.value = 1.0;
    filter.gain.value = eqValues[freq] || 0;
    filter.connect(currentNode);
    filters.push(filter);
    currentNode = filter;
  }

  // Store filter chain
  filterChains.set(tabId, filters);

  return { context, filters, gainNode, currentNode };
}

// Update EQ values for a tab
async function updateEQ(tabId: number, eqValues: Record<number, number>, volume: number) {
  const filters = filterChains.get(tabId);
  const gainNode = gainNodes.get(tabId);

  if (filters && gainNode) {
    // Update gain
    gainNode.gain.value = Math.pow(10, (volume / 20));

    // Update filter values
    FREQUENCIES.forEach((freq, index) => {
      if (filters[index]) {
        filters[index].gain.value = eqValues[freq] || 0;
      }
    });
  } else {
    // Initialize if not already done
    await initAudioProcessing(tabId, eqValues, volume);
  }
}

// Capture and process audio from a tab
async function captureTabAudio(tabId: number) {
  try {
    // Get the current audio stream from the tab
    const stream = await (chrome.tabCapture as any).capture({
      audio: true,
      video: false
    });

    if (!stream) {
      console.log("No audio stream available for tab", tabId);
      return;
    }

    let context = audioContexts.get(tabId);
    if (!context) {
      context = new (window as any).AudioContext();
      audioContexts.set(tabId, context);
    }

    // Create source from the captured stream
    const source = context.createMediaStreamSource(stream);

    // Get the filter chain or create default
    let filters = filterChains.get(tabId);
    if (!filters) {
      const { filters: newFilters } = await initAudioProcessing(tabId, {}, 0);
      filters = newFilters;
    }

    // Connect source to first filter
    if (filters.length > 0) {
      source.connect(filters[filters.length - 1]);
    } else {
      source.connect(context.destination);
    }

    // Store processor reference
    streamProcessors.set(tabId, { source, processor: null as any });
  } catch (error) {
    console.error("Error capturing tab audio:", error);
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "UPDATE_EQ" && sender.tab?.id) {
    const tabId = sender.tab.id;
    updateEQ(tabId, request.eqValues, request.volume).catch(console.error);
  }
});

// Clean up audio context when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  const context = audioContexts.get(tabId);
  if (context && context.state !== "closed") {
    context.close().catch(console.error);
  }
  audioContexts.delete(tabId);
  filterChains.delete(tabId);
  gainNodes.delete(tabId);
  streamProcessors.delete(tabId);
});

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log("Audio Equalizer extension installed");
});
