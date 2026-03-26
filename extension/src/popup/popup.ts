// Preset definitions
const PRESETS = {
  flat: {
    31: 0, 63: 0, 125: 0, 250: 0, 500: 0, 1000: 0, 2000: 0, 4000: 0, 8000: 0, 16000: 0
  },
  "bass-boost": {
    31: 6, 63: 5, 125: 3, 250: 1, 500: 0, 1000: 0, 2000: 0, 4000: 0, 8000: 0, 16000: 0
  },
  "treble-boost": {
    31: 0, 63: 0, 125: 0, 250: 0, 500: 0, 1000: 0, 2000: 2, 4000: 4, 8000: 5, 16000: 6
  },
  vocal: {
    31: -3, 63: -2, 125: 0, 250: 2, 500: 3, 1000: 4, 2000: 3, 4000: 1, 8000: 0, 16000: -1
  },
  rock: {
    31: 4, 63: 3, 125: 2, 250: -1, 500: -2, 1000: 0, 2000: 2, 4000: 3, 8000: 4, 16000: 5
  },
  pop: {
    31: 2, 63: 1, 125: 0, 250: 1, 500: 2, 1000: 2, 2000: 1, 4000: 0, 8000: -1, 16000: -1
  },
  jazz: {
    31: 1, 63: 2, 125: 1, 250: 0, 500: -1, 1000: 0, 2000: 1, 4000: 2, 8000: 2, 16000: 1
  },
  classical: {
    31: 0, 63: 0, 125: 1, 250: 2, 500: 1, 1000: 0, 2000: 1, 4000: 2, 8000: 3, 16000: 3
  }
};

// Initialize UI
function initializeUI() {
  const eqSliders = document.querySelectorAll(".eq-slider") as NodeListOf<HTMLInputElement>;
  const volumeSlider = document.getElementById("volumeSlider") as HTMLInputElement;
  const presetSelect = document.getElementById("presetSelect") as HTMLSelectElement;
  const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;

  // Load saved state
  chrome.storage.sync.get(["eqValues", "volume"], (data) => {
    if (data.eqValues) {
      eqSliders.forEach((slider) => {
        const freq = parseInt(slider.dataset.freq || "0");
        slider.value = data.eqValues[freq] || "0";
        updateValueDisplay(slider);
      });
    }
    if (data.volume !== undefined) {
      volumeSlider.value = data.volume;
      updateVolumeDisplay(volumeSlider);
    }
  });

  // EQ slider changes
  eqSliders.forEach((slider) => {
    slider.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      updateValueDisplay(target);
      saveEQState();
      sendToServiceWorker();
    });
  });

  // Volume slider changes
  volumeSlider.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    updateVolumeDisplay(target);
    saveEQState();
    sendToServiceWorker();
  });

  // Preset selection
  presetSelect.addEventListener("change", (e) => {
    const target = e.target as HTMLSelectElement;
    applyPreset(target.value as keyof typeof PRESETS);
  });

  // Reset button
  resetBtn.addEventListener("click", () => {
    applyPreset("flat");
    volumeSlider.value = "0";
    updateVolumeDisplay(volumeSlider);
  });
}

function updateValueDisplay(slider: HTMLInputElement) {
  const valueSpan = slider.parentElement?.querySelector(".eq-value") as HTMLElement;
  if (valueSpan) {
    valueSpan.textContent = slider.value;
  }
}

function updateVolumeDisplay(slider: HTMLInputElement) {
  const valueSpan = document.getElementById("volumeValue") as HTMLElement;
  if (valueSpan) {
    valueSpan.textContent = slider.value;
  }
}

function applyPreset(presetName: keyof typeof PRESETS) {
  const preset = PRESETS[presetName];
  const eqSliders = document.querySelectorAll(".eq-slider") as NodeListOf<HTMLInputElement>;

  eqSliders.forEach((slider) => {
    const freq = parseInt(slider.dataset.freq || "0");
    slider.value = String(preset[freq as keyof typeof preset] || 0);
    updateValueDisplay(slider);
  });

  saveEQState();
  sendToServiceWorker();
}

function saveEQState() {
  const eqSliders = document.querySelectorAll(".eq-slider") as NodeListOf<HTMLInputElement>;
  const volumeSlider = document.getElementById("volumeSlider") as HTMLInputElement;

  const eqValues: Record<number, number> = {};
  eqSliders.forEach((slider) => {
    const freq = parseInt(slider.dataset.freq || "0");
    eqValues[freq] = parseInt(slider.value);
  });

  chrome.storage.sync.set({
    eqValues,
    volume: parseInt(volumeSlider.value)
  });
}

function sendToServiceWorker() {
  const eqSliders = document.querySelectorAll(".eq-slider") as NodeListOf<HTMLInputElement>;
  const volumeSlider = document.getElementById("volumeSlider") as HTMLInputElement;

  const eqValues: Record<number, number> = {};
  eqSliders.forEach((slider) => {
    const freq = parseInt(slider.dataset.freq || "0");
    eqValues[freq] = parseInt(slider.value);
  });

  chrome.runtime.sendMessage({
    type: "UPDATE_EQ",
    eqValues,
    volume: parseInt(volumeSlider.value)
  });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeUI);
