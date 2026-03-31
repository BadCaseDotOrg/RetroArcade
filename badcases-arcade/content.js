// === CONFIG ===
const BASE_EMU_URL = "https://badcase.org/arcade/emulatorjs/";

const ROM_MAP = {
  ".nes": ["nes"],                  // Nintendo Entertainment System
  ".gb": ["gb"],                    // Game Boy
  ".gbc": ["gb"],                   // Game Boy Color
  ".gba": ["gba"],                  // Game Boy Advance
  ".nds": ["nds"],                  // Nintendo DS
  ".gg": ["segaGG"],                // Sega Game Gear
  ".bin": ["segaMD", "sega32x"],   // Genesis / 32X
  ".md": ["segaMD"],                // Genesis
  ".iso": ["psx"],           // PlayStation
  ".chd": ["psx"],           // PlayStation
  ".zip": [
    "nes", "snes", "gba", "arcade", "n64", "gb", "nds", "segaGG", "segaMD", "psx", "atari2600", "atari5200",
    "atari7800", "jaguar", "lynx", "ngp", "ws", "mame", "pce"
  ],
  ".7z": [
    "nes", "snes", "gba", "arcade", "n64", "gb", "nds", "segaGG", "segaMD", "psx", "atari2600", "atari5200",
    "atari7800", "jaguar", "lynx", "ngp", "ws", "mame", "pce"
  ],
  ".sfc": ["snes"],                 // Super Nintendo
  ".smc": ["snes"],                 // Super Nintendo
  ".n64": ["n64"],                  // Nintendo 64
  ".z64": ["n64"],                  // Nintendo 64
  ".a26": ["atari2600"],            // Atari 2600
  ".a52": ["atari5200"],            // Atari 5200
  ".a78": ["atari7800"],            // Atari 7800
  ".jag": ["jaguar"],               // Atari Jaguar
  ".lynx": ["lynx"],                // Atari Lynx
  ".lnx": ["lynx"],                // Atari Lynx
  ".ngp": ["ngp"],                  // SNK Neo Geo Pocket
  ".ws": ["ws"],                    // Bandai WonderSwan
  ".pce": ["pce"]                   // NEC TurboGrafx 16
};

const CORE_NAMES = {
  "n64": "Nintendo 64",
  "gb": "Nintendo GB/GBC",
  "gba": "Nintendo GBA",
  "nds": "Nintendo DS",
  "nes": "Nintendo NES",
  "snes": "Nintendo SNES",
  "segaMD": "Sega Mega Drive / Genesis",
  "segaMS": "Sega Master System",
  "segaGG": "Sega Game Gear",
  "atari2600": "Atari 2600",
  "atari5200": "Atari 5200",
  "atari7800": "Atari 7800",
  "jaguar": "Atari Jaguar",
  "lynx": "Atari Lynx",
  "mame": "MAME 2003",
  "ngp": "SNK Neo Geo Pocket",
  "ws": "Bandai WonderSwan",
  "psx": "Sony PlayStation",
  "pce": "NEC TurboGrafx 16",
  "arcade": "Arcade",
  "pce": "PC Engine / TurboGrafx 16"
};

const domain = window.location.hostname;

// --- 1. State Management ---
let injectEnabled = false;
let romObserver = null; // Store the observer globally within the script scope

// Function to start observing and do initial injection
function startInjection() {
    console.log("[Content] Starting injection and observer...");
    injectEnabled = true;
    
    // Initial scan
    findROMLinks();

    // Create and start the observer if it doesn't exist
    if (!romObserver) {
        romObserver = new MutationObserver(findROMLinks);
        romObserver.observe(document.body, { childList: true, subtree: true });
    }
}

// Function to stop observing and cleanup
function stopInjection() {
    console.log("[Content] Stopping injection and disconnecting observer...");
    injectEnabled = false;

    // Stop watching for new elements
    if (romObserver) {
        romObserver.disconnect();
        romObserver = null;
    }

    // Remove existing buttons
    removePlayButtons();
}

function findROMLinks() {
    if (!injectEnabled) return;

    const links = document.querySelectorAll("a[href]");
    links.forEach(link => {
        let href = link.href;
        const ext = getExtension(href);
        if (!ROM_MAP[ext]) return;

        if (link.dataset.romInjected) return; // prevent duplicates
        link.dataset.romInjected = "true";

        href = rewriteArchiveLink(href);

        const button = document.createElement("button");
        button.textContent = "▶ Play";
        button.className = "rom-launcher-button";
        button.onclick = (e) => {
            e.preventDefault(); // Stop the download link from firing
            handleLaunch(href, ROM_MAP[ext]);
        };

        link.parentNode.insertBefore(button, link);
    });
}

function removePlayButtons() {
    const buttons = document.querySelectorAll(".rom-launcher-button");
    buttons.forEach(btn => btn.remove());
    
    // Reset the data attributes on the links so they can be re-injected if toggled back on
    const injectedLinks = document.querySelectorAll("a[data-rom-injected]");
    injectedLinks.forEach(link => {
        delete link.dataset.romInjected;
    });
}

// === UTILITIES ===
function getExtension(url) {
  const cleanUrl = url.split("?")[0].split("#")[0];
  const parts = cleanUrl.split(".");
  return parts.length > 1 ? "." + parts.pop().toLowerCase() : "";
}

function rewriteArchiveLink(url) {
  return url.replace(
    /^https?:\/\/(www\.)?archive\.org\/download\//,
    "https://cors.archive.org/cors/"
  );
}


function handleLaunch(url, cores) {
  if (cores.length === 1) {
    launchGame(url, cores[0]);
  } else {
    showCorePicker(url, cores);
  }
}
const api = typeof browser !== "undefined" ? browser : chrome;

function saveRecentGame(url, core) {
  const name = decodeURIComponent(url.split("/").pop() || "Unknown");

  const entry = {
    url,
    core,
    name,
    timestamp: Date.now()
  };

  api.storage.local.get(["recentGames"], (data) => {
    const list = data.recentGames || [];

    // Optional: prevent duplicates (same url + core)
    const filtered = list.filter(
      g => !(g.url === url && g.core === core)
    );

    filtered.unshift(entry); // add to front

    const trimmed = filtered.slice(0, 50);

    api.storage.local.set({ recentGames: trimmed });
  });
}


function launchGame(url, core) {
  saveRecentGame(url, core);  // ✅ store it

  const encoded = encodeURIComponent(url);
  const finalUrl = `${BASE_EMU_URL}?fullscreen=true&core=${core}&url=${encoded}`;
  window.open(finalUrl, "_blank");
}

function showCorePicker(url, cores) {
  const popup = document.createElement("div");
popup.className = "rom-launcher-popup";
popup.innerHTML = "<h3>Select System</h3><div class='popup-content'></div>";

// Scroll only the content area
const content = popup.querySelector(".popup-content");
content.style.maxHeight = "250px";
content.style.overflowY = "auto";
  // Map cores to {id, name} objects
  const coreList = cores.map(core => ({
    id: core,
    name: CORE_NAMES[core] || core
  }));

  // Sort alphabetically by display name
  coreList.sort((a, b) => a.name.localeCompare(b.name));

  // Create buttons
  coreList.forEach(coreObj => {
    const btn = document.createElement("button");
    btn.textContent = coreObj.name;
    btn.onclick = () => {
      launchGame(url, coreObj.id);
      cleanup();           // ← changed to shared cleanup
    };
    content.appendChild(btn);
  });

  // Add popup to DOM
  document.body.appendChild(popup);

  // Shared cleanup function (removes popup + event listeners)
  function cleanup() {
    document.removeEventListener("click", outsideClickListener);
    document.body.removeChild(popup);
  }

  // Close when clicking outside the popup
  function outsideClickListener(event) {
    // Check if click happened outside the popup
    if (!popup.contains(event.target)) {
      cleanup();
    }
  }

  // Use setTimeout to avoid immediately closing on the initial click
  setTimeout(() => {
    document.addEventListener("click", outsideClickListener);
  }, 0);
}



// --- 2. Initial Load Check ---
api.storage.local.get([domain], (result) => {
    const isEnabled = result[domain] || false;
    if (isEnabled) {
        startInjection();
    }
});

// --- 3. Updated Message Listener ---
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "TOGGLE_INJECT") {
        if (message.enabled) {
            console.log("[Content] Injection enabled for:", domain);
            startInjection();
        } else {
            console.log("[Content] Injection disabled for:", domain);
            stopInjection();
        }
    }
    return true; 
});