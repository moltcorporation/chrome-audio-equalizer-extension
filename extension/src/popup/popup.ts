const API_BASE = "https://chrome-audio-equalizer-extension-moltcorporation.vercel.app";

// Preset definitions
const PRESETS: Record<string, Record<number, number>> = {
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

let isPro = false;
let userEmail = "";
let customPresets: Array<{ id: number; name: string; eqValues: Record<number, number>; volume: number }> = [];

// Initialize UI
async function initializeUI() {
  const eqSliders = document.querySelectorAll(".eq-slider") as NodeListOf<HTMLInputElement>;
  const volumeSlider = document.getElementById("volumeSlider") as HTMLInputElement;
  const presetSelect = document.getElementById("presetSelect") as HTMLSelectElement;
  const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
  const upgradeBtn = document.getElementById("upgradeBtn") as HTMLButtonElement;
  const savePresetBtn = document.getElementById("savePresetBtn") as HTMLButtonElement;
  const logoutBtn = document.getElementById("logoutBtn") as HTMLButtonElement;
  const siteProfileToggle = document.getElementById("siteProfileToggle") as HTMLInputElement;

  // Load saved state
  chrome.storage.sync.get(["eqValues", "volume", "proEmail"], async (data) => {
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
    if (data.proEmail) {
      await checkProStatus(data.proEmail);
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
    const value = target.value;

    // Check if it's a custom preset (prefixed with "custom:")
    if (value.startsWith("custom:")) {
      const presetId = parseInt(value.replace("custom:", ""));
      const preset = customPresets.find(p => p.id === presetId);
      if (preset) {
        applyEQValues(preset.eqValues as Record<number, number>, preset.volume);
      }
    } else {
      applyPreset(value);
    }
  });

  // Reset button
  resetBtn.addEventListener("click", () => {
    applyPreset("flat");
    volumeSlider.value = "0";
    updateVolumeDisplay(volumeSlider);
  });

  // Upgrade button
  upgradeBtn.addEventListener("click", async () => {
    const emailInput = document.getElementById("emailInput") as HTMLInputElement;
    const email = emailInput.value.trim();
    if (!email || !email.includes("@")) {
      emailInput.style.borderColor = "#e74c3c";
      return;
    }
    emailInput.style.borderColor = "";

    try {
      upgradeBtn.textContent = "Loading...";
      upgradeBtn.disabled = true;

      const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.url) {
        chrome.tabs.create({ url: data.url });
        // Save email so we can check status later
        chrome.storage.sync.set({ proEmail: email });
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      upgradeBtn.textContent = "Upgrade to Pro - $0.49/mo";
      upgradeBtn.disabled = false;
    }
  });

  // Save preset button (Pro only)
  savePresetBtn.addEventListener("click", async () => {
    const name = prompt("Preset name:");
    if (!name) return;

    const eqValues = getCurrentEQValues();
    const volume = parseInt(volumeSlider.value);

    try {
      const res = await fetch(`${API_BASE}/api/presets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, name, eqValues, volume }),
      });
      const data = await res.json();
      if (data.preset) {
        customPresets.push(data.preset);
        updatePresetDropdown();
      }
    } catch (err) {
      console.error("Save preset error:", err);
    }
  });

  // Logout button
  logoutBtn.addEventListener("click", () => {
    chrome.storage.sync.remove("proEmail");
    isPro = false;
    userEmail = "";
    customPresets = [];
    updateUIForFree();
  });

  // Site profile toggle
  siteProfileToggle.addEventListener("change", async () => {
    if (!isPro) return;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;

    const hostname = new URL(tab.url).hostname;

    if (siteProfileToggle.checked) {
      // Save current EQ as site profile
      const eqValues = getCurrentEQValues();
      const volume = parseInt(volumeSlider.value);

      await fetch(`${API_BASE}/api/site-profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, sitePattern: hostname, eqValues, volume }),
      });
    } else {
      // Load site profiles, find and delete this one
      const res = await fetch(`${API_BASE}/api/site-profiles?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      const profile = data.profiles?.find((p: { sitePattern: string }) => p.sitePattern === hostname);
      if (profile) {
        await fetch(`${API_BASE}/api/site-profiles?id=${profile.id}&email=${encodeURIComponent(userEmail)}`, {
          method: "DELETE",
        });
      }
    }
  });
}

async function checkProStatus(email: string) {
  try {
    const res = await fetch(`${API_BASE}/api/license?email=${encodeURIComponent(email)}`);
    const data = await res.json();

    if (data.pro) {
      isPro = true;
      userEmail = email;
      updateUIForPro(email);
      await loadCustomPresets();
      await loadSiteProfile();
    }
  } catch (err) {
    console.error("License check error:", err);
  }
}

async function loadCustomPresets() {
  try {
    const res = await fetch(`${API_BASE}/api/presets?email=${encodeURIComponent(userEmail)}`);
    const data = await res.json();
    customPresets = data.presets || [];
    updatePresetDropdown();
  } catch (err) {
    console.error("Load presets error:", err);
  }
}

async function loadSiteProfile() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;

    const hostname = new URL(tab.url).hostname;
    const res = await fetch(`${API_BASE}/api/site-profiles?email=${encodeURIComponent(userEmail)}`);
    const data = await res.json();
    const profile = data.profiles?.find((p: { sitePattern: string }) => p.sitePattern === hostname);

    const toggle = document.getElementById("siteProfileToggle") as HTMLInputElement;
    if (profile) {
      toggle.checked = true;
      applyEQValues(profile.eqValues as Record<number, number>, profile.volume);
    }
  } catch (err) {
    console.error("Load site profile error:", err);
  }
}

function updateUIForPro(email: string) {
  const freeAccount = document.getElementById("freeAccount") as HTMLElement;
  const proAccount = document.getElementById("proAccount") as HTMLElement;
  const proEmail = document.getElementById("proEmail") as HTMLElement;
  const savePresetBtn = document.getElementById("savePresetBtn") as HTMLElement;
  const siteProfileSection = document.getElementById("siteProfileSection") as HTMLElement;

  freeAccount.style.display = "none";
  proAccount.style.display = "flex";
  proEmail.textContent = email;
  savePresetBtn.style.display = "inline-block";
  siteProfileSection.style.display = "block";
}

function updateUIForFree() {
  const freeAccount = document.getElementById("freeAccount") as HTMLElement;
  const proAccount = document.getElementById("proAccount") as HTMLElement;
  const savePresetBtn = document.getElementById("savePresetBtn") as HTMLElement;
  const siteProfileSection = document.getElementById("siteProfileSection") as HTMLElement;
  const presetSelect = document.getElementById("presetSelect") as HTMLSelectElement;

  freeAccount.style.display = "block";
  proAccount.style.display = "none";
  savePresetBtn.style.display = "none";
  siteProfileSection.style.display = "none";

  // Remove custom presets from dropdown
  const customOptions = presetSelect.querySelectorAll("option[data-custom]");
  customOptions.forEach(opt => opt.remove());
}

function updatePresetDropdown() {
  const presetSelect = document.getElementById("presetSelect") as HTMLSelectElement;

  // Remove existing custom options
  const existing = presetSelect.querySelectorAll("option[data-custom]");
  existing.forEach(opt => opt.remove());

  // Add custom presets
  if (customPresets.length > 0) {
    const separator = document.createElement("option");
    separator.disabled = true;
    separator.textContent = "── Custom ──";
    separator.setAttribute("data-custom", "true");
    presetSelect.appendChild(separator);

    customPresets.forEach(preset => {
      const option = document.createElement("option");
      option.value = `custom:${preset.id}`;
      option.textContent = preset.name;
      option.setAttribute("data-custom", "true");
      presetSelect.appendChild(option);
    });
  }
}

function getCurrentEQValues(): Record<number, number> {
  const eqSliders = document.querySelectorAll(".eq-slider") as NodeListOf<HTMLInputElement>;
  const eqValues: Record<number, number> = {};
  eqSliders.forEach((slider) => {
    const freq = parseInt(slider.dataset.freq || "0");
    eqValues[freq] = parseInt(slider.value);
  });
  return eqValues;
}

function applyEQValues(eqValues: Record<number, number>, volume: number) {
  const eqSliders = document.querySelectorAll(".eq-slider") as NodeListOf<HTMLInputElement>;
  const volumeSlider = document.getElementById("volumeSlider") as HTMLInputElement;

  eqSliders.forEach((slider) => {
    const freq = parseInt(slider.dataset.freq || "0");
    slider.value = String(eqValues[freq] || 0);
    updateValueDisplay(slider);
  });

  volumeSlider.value = String(volume);
  updateVolumeDisplay(volumeSlider);
  saveEQState();
  sendToServiceWorker();
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

function applyPreset(presetName: string) {
  const preset = PRESETS[presetName];
  if (!preset) return;
  applyEQValues(preset, 0);
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
