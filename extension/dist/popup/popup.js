// src/popup/popup.ts
var API_BASE = "https://chrome-audio-equalizer-extension-moltcorporation.vercel.app";
var PRESETS = {
  flat: {
    31: 0,
    63: 0,
    125: 0,
    250: 0,
    500: 0,
    1e3: 0,
    2e3: 0,
    4e3: 0,
    8e3: 0,
    16e3: 0
  },
  "bass-boost": {
    31: 6,
    63: 5,
    125: 3,
    250: 1,
    500: 0,
    1e3: 0,
    2e3: 0,
    4e3: 0,
    8e3: 0,
    16e3: 0
  },
  "treble-boost": {
    31: 0,
    63: 0,
    125: 0,
    250: 0,
    500: 0,
    1e3: 0,
    2e3: 2,
    4e3: 4,
    8e3: 5,
    16e3: 6
  },
  vocal: {
    31: -3,
    63: -2,
    125: 0,
    250: 2,
    500: 3,
    1e3: 4,
    2e3: 3,
    4e3: 1,
    8e3: 0,
    16e3: -1
  },
  rock: {
    31: 4,
    63: 3,
    125: 2,
    250: -1,
    500: -2,
    1e3: 0,
    2e3: 2,
    4e3: 3,
    8e3: 4,
    16e3: 5
  },
  pop: {
    31: 2,
    63: 1,
    125: 0,
    250: 1,
    500: 2,
    1e3: 2,
    2e3: 1,
    4e3: 0,
    8e3: -1,
    16e3: -1
  },
  jazz: {
    31: 1,
    63: 2,
    125: 1,
    250: 0,
    500: -1,
    1e3: 0,
    2e3: 1,
    4e3: 2,
    8e3: 2,
    16e3: 1
  },
  classical: {
    31: 0,
    63: 0,
    125: 1,
    250: 2,
    500: 1,
    1e3: 0,
    2e3: 1,
    4e3: 2,
    8e3: 3,
    16e3: 3
  }
};
var isPro = false;
var userEmail = "";
var customPresets = [];
async function initializeUI() {
  const eqSliders = document.querySelectorAll(".eq-slider");
  const volumeSlider = document.getElementById("volumeSlider");
  const presetSelect = document.getElementById("presetSelect");
  const resetBtn = document.getElementById("resetBtn");
  const upgradeBtn = document.getElementById("upgradeBtn");
  const savePresetBtn = document.getElementById("savePresetBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const siteProfileToggle = document.getElementById("siteProfileToggle");
  chrome.storage.sync.get(["eqValues", "volume", "proEmail"], async (data) => {
    if (data.eqValues) {
      eqSliders.forEach((slider) => {
        const freq = parseInt(slider.dataset.freq || "0");
        slider.value = data.eqValues[freq] || "0";
        updateValueDisplay(slider);
      });
    }
    if (data.volume !== void 0) {
      volumeSlider.value = data.volume;
      updateVolumeDisplay(volumeSlider);
    }
    if (data.proEmail) {
      await checkProStatus(data.proEmail);
    }
  });
  eqSliders.forEach((slider) => {
    slider.addEventListener("input", (e) => {
      const target = e.target;
      updateValueDisplay(target);
      saveEQState();
      sendEQToContentScript();
    });
  });
  volumeSlider.addEventListener("input", (e) => {
    const target = e.target;
    updateVolumeDisplay(target);
    saveEQState();
    sendEQToContentScript();
  });
  presetSelect.addEventListener("change", (e) => {
    const target = e.target;
    const value = target.value;
    if (value.startsWith("custom:")) {
      const presetId = parseInt(value.replace("custom:", ""));
      const preset = customPresets.find((p) => p.id === presetId);
      if (preset) {
        applyEQValues(preset.eqValues, preset.volume);
      }
    } else {
      applyPreset(value);
    }
  });
  resetBtn.addEventListener("click", () => {
    applyPreset("flat");
    volumeSlider.value = "0";
    updateVolumeDisplay(volumeSlider);
  });
  upgradeBtn.addEventListener("click", async () => {
    const emailInput = document.getElementById("emailInput");
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
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.url) {
        chrome.tabs.create({ url: data.url });
        chrome.storage.sync.set({ proEmail: email });
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      upgradeBtn.textContent = "Upgrade to Pro - $0.49/mo";
      upgradeBtn.disabled = false;
    }
  });
  savePresetBtn.addEventListener("click", async () => {
    const name = prompt("Preset name:");
    if (!name) return;
    const eqValues = getCurrentEQValues();
    const volume = parseInt(volumeSlider.value);
    try {
      const res = await fetch(`${API_BASE}/api/presets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, name, eqValues, volume })
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
  logoutBtn.addEventListener("click", () => {
    chrome.storage.sync.remove("proEmail");
    isPro = false;
    userEmail = "";
    customPresets = [];
    updateUIForFree();
  });
  siteProfileToggle.addEventListener("change", async () => {
    if (!isPro) return;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;
    const hostname = new URL(tab.url).hostname;
    if (siteProfileToggle.checked) {
      const eqValues = getCurrentEQValues();
      const volume = parseInt(volumeSlider.value);
      await fetch(`${API_BASE}/api/site-profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, sitePattern: hostname, eqValues, volume })
      });
    } else {
      const res = await fetch(`${API_BASE}/api/site-profiles?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      const profile = data.profiles?.find((p) => p.sitePattern === hostname);
      if (profile) {
        await fetch(`${API_BASE}/api/site-profiles?id=${profile.id}&email=${encodeURIComponent(userEmail)}`, {
          method: "DELETE"
        });
      }
    }
  });
}
async function checkProStatus(email) {
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
    const profile = data.profiles?.find((p) => p.sitePattern === hostname);
    const toggle = document.getElementById("siteProfileToggle");
    if (profile) {
      toggle.checked = true;
      applyEQValues(profile.eqValues, profile.volume);
    }
  } catch (err) {
    console.error("Load site profile error:", err);
  }
}
function updateUIForPro(email) {
  const freeAccount = document.getElementById("freeAccount");
  const proAccount = document.getElementById("proAccount");
  const proEmail = document.getElementById("proEmail");
  const savePresetBtn = document.getElementById("savePresetBtn");
  const siteProfileSection = document.getElementById("siteProfileSection");
  freeAccount.style.display = "none";
  proAccount.style.display = "flex";
  proEmail.textContent = email;
  savePresetBtn.style.display = "inline-block";
  siteProfileSection.style.display = "block";
}
function updateUIForFree() {
  const freeAccount = document.getElementById("freeAccount");
  const proAccount = document.getElementById("proAccount");
  const savePresetBtn = document.getElementById("savePresetBtn");
  const siteProfileSection = document.getElementById("siteProfileSection");
  const presetSelect = document.getElementById("presetSelect");
  freeAccount.style.display = "block";
  proAccount.style.display = "none";
  savePresetBtn.style.display = "none";
  siteProfileSection.style.display = "none";
  const customOptions = presetSelect.querySelectorAll("option[data-custom]");
  customOptions.forEach((opt) => opt.remove());
}
function updatePresetDropdown() {
  const presetSelect = document.getElementById("presetSelect");
  const existing = presetSelect.querySelectorAll("option[data-custom]");
  existing.forEach((opt) => opt.remove());
  if (customPresets.length > 0) {
    const separator = document.createElement("option");
    separator.disabled = true;
    separator.textContent = "\u2500\u2500 Custom \u2500\u2500";
    separator.setAttribute("data-custom", "true");
    presetSelect.appendChild(separator);
    customPresets.forEach((preset) => {
      const option = document.createElement("option");
      option.value = `custom:${preset.id}`;
      option.textContent = preset.name;
      option.setAttribute("data-custom", "true");
      presetSelect.appendChild(option);
    });
  }
}
function getCurrentEQValues() {
  const eqSliders = document.querySelectorAll(".eq-slider");
  const eqValues = {};
  eqSliders.forEach((slider) => {
    const freq = parseInt(slider.dataset.freq || "0");
    eqValues[freq] = parseInt(slider.value);
  });
  return eqValues;
}
function applyEQValues(eqValues, volume) {
  const eqSliders = document.querySelectorAll(".eq-slider");
  const volumeSlider = document.getElementById("volumeSlider");
  eqSliders.forEach((slider) => {
    const freq = parseInt(slider.dataset.freq || "0");
    slider.value = String(eqValues[freq] || 0);
    updateValueDisplay(slider);
  });
  volumeSlider.value = String(volume);
  updateVolumeDisplay(volumeSlider);
  saveEQState();
  sendEQToContentScript();
}
function updateValueDisplay(slider) {
  const valueSpan = slider.parentElement?.querySelector(".eq-value");
  if (valueSpan) {
    valueSpan.textContent = slider.value;
  }
}
function updateVolumeDisplay(slider) {
  const valueSpan = document.getElementById("volumeValue");
  if (valueSpan) {
    valueSpan.textContent = slider.value;
  }
}
function applyPreset(presetName) {
  const preset = PRESETS[presetName];
  if (!preset) return;
  applyEQValues(preset, 0);
}
function saveEQState() {
  const eqSliders = document.querySelectorAll(".eq-slider");
  const volumeSlider = document.getElementById("volumeSlider");
  const eqValues = {};
  eqSliders.forEach((slider) => {
    const freq = parseInt(slider.dataset.freq || "0");
    eqValues[freq] = parseInt(slider.value);
  });
  chrome.storage.sync.set({
    eqValues,
    volume: parseInt(volumeSlider.value)
  });
}
async function sendEQToContentScript() {
  const eqSliders = document.querySelectorAll(".eq-slider");
  const volumeSlider = document.getElementById("volumeSlider");
  const eqValues = {};
  eqSliders.forEach((slider) => {
    const freq = parseInt(slider.dataset.freq || "0");
    eqValues[freq] = parseInt(slider.value);
  });
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: "UPDATE_EQ",
      eqValues,
      volume: parseInt(volumeSlider.value)
    }).catch(() => {
    });
  }
}
document.addEventListener("DOMContentLoaded", initializeUI);
