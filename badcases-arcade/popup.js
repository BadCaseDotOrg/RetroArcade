const api = typeof browser !== "undefined" ? browser : chrome;

const toggle = document.getElementById("injectToggle");

// 1. On Popup Open: Set the initial toggle state
api.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (!tab?.url) return;
  
  const domain = new URL(tab.url).hostname;

  api.storage.local.get([domain], (result) => {
    const isEnabled = result[domain] || false;
    updateButtonUI(isEnabled);
  });
});

  console.log("[background] Extension icon clicked, opening arcadeTab.html");

// 2. Handle Toggle Change
toggle.addEventListener("change", () => {
  api.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab?.url) return;
    
    const domain = new URL(tab.url).hostname;
    const newState = toggle.checked;

    api.storage.local.set({ [domain]: newState }, () => {
      updateButtonUI(newState);
      //send message to content to inject play buttons on this domain
      api.tabs.sendMessage(tab.id, { 
        type: "TOGGLE_INJECT", 
        enabled: newState 
      });
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
    const arcadeBtn = document.getElementById('openArcadeBtn');
    const arcadeUrl = api.runtime.getURL("arcadeTab.html");

    arcadeBtn.addEventListener('click', () => {
        // 1. Look for any existing tab with this URL
        api.tabs.query({ url: arcadeUrl }, (tabs) => {
            if (tabs.length > 0) {
                // 2. If found, jump to it and focus the window
                const existingTab = tabs[0];
                api.tabs.update(existingTab.id, { active: true });
                api.windows.update(existingTab.windowId, { focused: true });
            } else {
                // 3. If not found, create a new one
                api.tabs.create({ url: arcadeUrl });
            }
        });
    });
});
// 3. Update UI Function
function updateButtonUI(isEnabled) {
  toggle.checked = isEnabled;
}