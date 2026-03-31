const api = typeof browser !== "undefined" ? browser : chrome;

const EMULATORJS_BASE_EMU_URL = "https://badcase.org/arcade/emulatorjs/";

const WEBRETRO_BASE_EMU_URL = "https://badcase.org/arcade/webretro/";

let BASE_EMU_URL = EMULATORJS_BASE_EMU_URL;

let useWebRetro = false; // default to EmulatorJS

const CORE_NAMES = {
  n64: "Nintendo 64",
  gb: "Nintendo GB/GBC",
  gba: "Nintendo GBA",
  nds: "Nintendo DS",
  nes: "Nintendo NES",
  snes: "Nintendo SNES",
  segaMD: "Sega Mega Drive / Genesis",
  segaMS: "Sega Master System",
  segaGG: "Sega Game Gear",
  atari2600: "Atari 2600",
  atari5200: "Atari 5200",
  atari7800: "Atari 7800",
  jaguar: "Atari Jaguar",
  lynx: "Atari Lynx",
  mame: "MAME 2003",
  ngp: "SNK Neo Geo Pocket",
  ws: "Bandai WonderSwan",
  psx: "Sony PlayStation",
  pce: "NEC TurboGrafx 16",
  arcade: "Arcade",
  pce: "PC Engine / TurboGrafx 16",
};
const WEBRETRO_CORE_MAP = {
  n64: "mupen64plus_next",
  gb: "mgba",
  gba: "mgba",
  nds: "melonds",
  nes: "nestopia",
  snes: "snes9x",
  segaMD: "genesis_plus_gx",
  segaMS: "genesis_plus_gx",
  segaGG: "genesis_plus_gx",
  atari2600: "stella2014",
  atari5200: "a5200",
  atari7800: "prosystem",
  jaguar: "virtualjaguar",
  lynx: "handy",
  ngp: "mednafen_ngp",
  ws: "mednafen_wswan",
  psx: "mednafen_psx_hw",
};

const WEBRETRO_CONTROLLER_MAP = {
  jaguar: "atari-jaguar",
  atari2600: "atari-2600",
  snes: "super-nintendo",
  gb: "gameboy-color",
  gba: "gameboy-advance",
  nds: "nintendo-ds",
  ws: "bandai-wonderswan",
  lynx: "atari-lynx",
  ngp: "neo-geo-pocket-color",
  atari5200: "atari-5200",
  atari7800: "atari-7800",
  n64: "nintendo-64",
  segaMD: "genesis",
  segaGG: "game-gear",
  segaMS: "master-system",
  psx: "playstation",
  nes: "nintendo-entertainment-system",
};
const imageCache = {}; // cache loaded JSONs
const AVAILABLE_IMAGE_JSONS = new Set([
  "gba",
  "atari2600",
  "atari5200",
  "atari7800",
  "jaguar",
  "lynx",
  "segaMD",
  "segaGG",
  "pce",
  "nes",
  "snes",
  "n64",
  "nds",
  "gb",
  "ngp",
  "ws",
  "psx",
  "mame",
]);

let currentGameIndex = null;

const dialog = document.getElementById("edit-dialog");
const editNameInput = document.getElementById("edit-name");
const saveBtn = document.getElementById("save-btn");
const deleteBtn = document.getElementById("delete-btn");
const cancelBtn = document.getElementById("cancel-btn");
const editImg = document.getElementById("edit-img");
const editImgInput = document.getElementById("edit-image");

function openDialog(game, index, thumbnail) {
  currentGameIndex = index;
  editNameInput.value = normalizeName(game.name, true, true);
  const emulatorjsRom = document.getElementById("emulatorjs_rom");
  const webretroRom = document.getElementById("webretro_rom");

  if (!game.image) {
    editImg.src = thumbnail;
  } else {
    editImg.src = game.image;
  }

  if (game.useWebRetro) {
    emulatorjsRom.checked = false;
    webretroRom.checked = true;
  } else {
    emulatorjsRom.checked = true;
    webretroRom.checked = false;
  }
  dialog.style.display = "flex";
}

function closeDialog() {
  dialog.style.display = "none";
  currentGameIndex = null;
}

// =====================
// Launch game
// =====================

function launchGame(url, core, romUseWebRetro) {
  console.log("[launchGame] Launching", url, core);
  if (useWebRetro || romUseWebRetro) {
    BASE_EMU_URL = WEBRETRO_BASE_EMU_URL;
    const finalUrl = `${BASE_EMU_URL}?fullscreen=true&core=${WEBRETRO_CORE_MAP[core]}&controller=${WEBRETRO_CONTROLLER_MAP[core]}&rom=${encodeURIComponent(url)}`;
    window.open(finalUrl, "_blank");
  } else {
    BASE_EMU_URL = EMULATORJS_BASE_EMU_URL;
    const finalUrl = `${BASE_EMU_URL}?fullscreen=true&core=${core}&url=${encodeURIComponent(url)}`;
    window.open(finalUrl, "_blank");
  }
}

// =====================
// Render games as cards
// =====================
async function renderList(games) {
  console.log("[renderList] Rendering", games.length, "games");
  const container = document.getElementById("list");
  container.innerHTML = "";

  if (!games.length) {
    container.innerHTML = "<div>No recent games</div>";
    return;
  }

  for (const game of games) {
    console.log("[renderList] Game:", game.name);

    // ----------------------------
    // Load JSON for this core ONCE
    // ----------------------------
    const coreData = await loadImageData(game.core); // contains file_names + base_url

    // ----------------------------
    // Find metadata for this game
    // ----------------------------
    const gameMeta = await findGameData(game.name, game.core); // full object: name, year, genre, etc.
    // ----------------------------
    // Create card
    // ----------------------------
    const card = document.createElement("div");
    card.className = "game-card";

    // Thumbnail
    const img = document.createElement("img");
    img.className = "thumbnail";
    img.style.display = "none";
    card.appendChild(img);

    // Info container
    const info = document.createElement("div");
    info.className = "info";

    // Name
    const nameDiv = document.createElement("div");
    nameDiv.textContent = normalizeName(game.name, true, true);
    nameDiv.className = "game-name";

    info.appendChild(nameDiv);

    // Optional metadata container (genre, manufacturer, year)
    const extraMetaDiv = document.createElement("div");
    extraMetaDiv.className = "extra-meta";

    // Add year if exists
    if (gameMeta?.year) {
      const yearSpan = document.createElement("span");
      yearSpan.textContent = gameMeta.year;
      yearSpan.className = "year";

      extraMetaDiv.appendChild(yearSpan);
    }

    // Add manufacturer if exists
    if (gameMeta?.manufacturer) {
      const manufSpan = document.createElement("span");
      manufSpan.textContent = gameMeta.manufacturer;
      manufSpan.className = "manufacturer";

      extraMetaDiv.appendChild(manufSpan);
    }

    // Add genre if exists
    if (gameMeta?.genre) {
      const genreSpan = document.createElement("span");
      genreSpan.textContent = gameMeta.genre;
      genreSpan.className = "genre";

      extraMetaDiv.appendChild(genreSpan);
    }

    // Append extra metadata container
    info.appendChild(extraMetaDiv);
    // =====================
    // NEW WRAPPER for Core Label + Play Button
    // =====================
    const actionWrapper = document.createElement("div");
    actionWrapper.className = "action-wrapper";

    // Core / system label
    const metaDiv = document.createElement("div");
    metaDiv.textContent = CORE_NAMES[game.core] || game.core;
    metaDiv.className = "core-label";
    actionWrapper.appendChild(metaDiv);

    // Play button
    const playBtn = document.createElement("button");
    playBtn.textContent = "Play Game";
    playBtn.className = "play-btn";

    playBtn.onclick = (e) => {
      e.stopPropagation();
      launchGame(game.url, game.core, game.useWebRetro);
    };

    actionWrapper.appendChild(playBtn);

    // Add the wrapper to the info section
    info.appendChild(actionWrapper);
    card.appendChild(info);

    // Attach metadata if available
    if (gameMeta) {
      card.dataset.year = gameMeta.year || "";
      card.dataset.manufacturer = gameMeta.manufacturer || "";
      card.dataset.genre = gameMeta.genre || "";
      card.dataset.rating = gameMeta.rating || "";
    }
    // ----------------------------
    // Set image
    // ----------------------------
    const normalized = normalizeName(game.name);
    if (game.image) {
      img.src = game.image;
    } else {
      img.src = findImage(normalized, coreData);
    }
    img.style.display = "block";
    // Card click → open dialog
    card.onclick = (e) => {
      if (playBtn.contains(e.target)) return;

      const index = recentGames.findIndex(
        (g) => g.url === game.url && g.core === game.core,
      );

      if (index !== -1) openDialog(game, index, img.src);
    };

    container.appendChild(card);
  }
}
// =====================
// Normalize filenames
// =====================
function normalizeName(filename, keepCase = false, keepBrackets = false) {
  if (!filename) return "";

  let name = filename.split("/").pop();

  try {
    name = decodeURIComponent(name);
  } catch (e) {}

  const parenIndex = name.indexOf(" (");
  const bracketIndex = name.indexOf(" [");
  let cutIndex = -1;

  if (!keepBrackets) {
    if (parenIndex !== -1 && bracketIndex !== -1) {
      cutIndex = Math.min(parenIndex, bracketIndex);
    } else if (parenIndex !== -1) {
      cutIndex = parenIndex;
    } else if (bracketIndex !== -1) {
      cutIndex = bracketIndex;
    }
  }

  if (cutIndex !== -1) {
    name = name.substring(0, cutIndex);
  } else {
    name = name.replace(/\.[^/.]+$/, "");
  }

  return keepCase ? name.trim() : name.trim().toLowerCase();
}
// =====================
// Load image JSON
// =====================
async function loadImageData(core) {
  if (!AVAILABLE_IMAGE_JSONS.has(core)) return null;
  if (core in imageCache) return imageCache[core];

  try {
    const url = api.runtime.getURL(`json/${core}_images.json`);
    const res = await fetch(url);
    if (!res.ok) {
      imageCache[core] = null;
      return null;
    }

    const data = await res.json();
    if (!data || !Array.isArray(data.file_names) || !data.base_url) {
      imageCache[core] = null;
      return null;
    }

    imageCache[core] = data;
    return data;
  } catch {
    imageCache[core] = null;
    return null;
  }
}

// =====================
// Match image by substring with fallback placeholder
// =====================
function findImage(normalizedName, imageData) {
  const PLACEHOLDER = "https://placehold.co/600x450?text=No+Image";

  if (!imageData) return PLACEHOLDER;

  const base = imageData.base_url;

  for (const fileName of imageData.file_names) {
    if (!fileName) continue;

    const cleaned = normalizeName(fileName);
    if (cleaned.includes(normalizedName) || normalizedName.includes(cleaned)) {
      return base + fileName;
    }
  }

  // No match found → return placeholder
  return PLACEHOLDER;
}

// =====================
// Find game object by name + core
// =====================
async function findGameData(name, core) {
  if (!name || !core) return null;

  // Load JSON for this core
  let data;
  try {
    const url = api.runtime.getURL(`json/${core}_data.json`);
    const res = await fetch(url);
    if (!res.ok) return null;
    data = await res.json();
  } catch {
    return null;
  }

  if (!Array.isArray(data)) return null;

  const normalizedName = normalizeName(name);

  for (const item of data) {
    if (!item || !item.name) continue;

    const cleaned = normalizeName(item.name);
    if (cleaned.includes(normalizedName) || normalizedName.includes(cleaned)) {
      // Return full object
      return {
        name: item.name || "",
        image: item.image || "",
        year: item.year || "",
        manufacturer: item.manufacturer || "",
        genre: item.genre || "",
        rating: item.rating || "",
      };
    }
  }

  return null; // no match found
}
// =====================
// FILTER & SORTING (Console + Genre + Search + Sort)
// =====================
const filterDropdown = document.getElementById("console-filter");
const genreFilter = document.getElementById("genre-filter");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");

let recentGames = [];
let gameMetadataCache = new Map(); // cache: "core:name" → metadata

// Pre-load metadata for all recent games (for fast genre filtering)
async function preloadMetadata() {
  for (const game of recentGames) {
    const key = `${game.core}:${game.name}`;
    if (!gameMetadataCache.has(key)) {
      const meta = await findGameData(game.name, game.core);
      if (meta) gameMetadataCache.set(key, meta);
    }
  }
}

// Populate Genre dropdown with unique genres
function populateGenreFilter() {
  const genres = new Set();

  for (const game of recentGames) {
    const key = `${game.core}:${game.name}`;
    const meta = gameMetadataCache.get(key);
    if (meta?.genre) {
      genres.add(meta.genre.trim());
    }
  }

  genreFilter.innerHTML = '<option value="all">All Genres</option>';

  Array.from(genres)
    .sort()
    .forEach((genre) => {
      const opt = document.createElement("option");
      opt.value = genre;
      opt.textContent = genre;
      genreFilter.appendChild(opt);
    });
}

// Main filter + sort function
function applyFilters() {
  let filtered = [...recentGames];

  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedConsole = filterDropdown.value;
  const selectedGenre = genreFilter.value;
  const sortMode = sortSelect.value;

  // 1. Filter by console
  if (selectedConsole !== "all") {
    filtered = filtered.filter((game) => game.core === selectedConsole);
  }

  // 2. Filter by genre
  if (selectedGenre !== "all") {
    filtered = filtered.filter((game) => {
      const key = `${game.core}:${game.name}`;
      const meta = gameMetadataCache.get(key);
      return meta && meta.genre === selectedGenre;
    });
  }

  // 3. Filter by search term
  if (searchTerm) {
    filtered = filtered.filter((game) =>
      normalizeName(game.name, false, false).includes(searchTerm),
    );
  }

  // 4. Sort
  filtered.sort((a, b) => {
    switch (sortMode) {
      case "name-asc":
        return normalizeName(a.name, false, false).localeCompare(
          normalizeName(b.name, false, false),
        );

      case "name-desc":
        return normalizeName(b.name, false, false).localeCompare(
          normalizeName(a.name, false, false),
        );

      case "year-desc":
        return (parseInt(b.year) || 0) - (parseInt(a.year) || 0);

      case "year-asc":
        return (parseInt(a.year) || 0) - (parseInt(b.year) || 0);

      case "recent":
      default:
        return 0; // keep original recent order
    }
  });

  renderList(filtered);
}

// Load recent games from storage
api.storage.local.get(["recentGames"], async (data) => {
  recentGames = data.recentGames || [];
  console.log("[storage] recentGames loaded:", recentGames.length);

  await preloadMetadata(); // load metadata once
  populateGenreFilter(); // fill genre dropdown
  applyFilters(); // initial render
});

// Attach event listeners
searchInput.addEventListener("input", applyFilters);
filterDropdown.addEventListener("change", applyFilters);
genreFilter.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);

// =====================
// SETTINGS PANEL
// =====================
const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings-panel");
const backupBtn = document.getElementById("backup-btn");
const restoreBtn = document.getElementById("restore-btn");
const restoreFileInput = document.getElementById("restore-file");
const deleteAllBtn = document.getElementById("delete-all-btn");

// Toggle settings panel
settingsBtn.addEventListener("click", () => {
  const settingsIcon = settingsBtn.querySelector("img");
  settingsIcon.src =
    settingsPanel.style.display === "block"
      ? api.runtime.getURL("img/gears-white.svg")
      : api.runtime.getURL("img/square-xmark-red.svg");
  settingsPanel.style.display =
    settingsPanel.style.display === "block" ? "none" : "block";
});

// Backup (Export)
backupBtn.addEventListener("click", () => {
  const dataStr = JSON.stringify(recentGames, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
  const exportFileDefaultName = `recent-games-backup-${new Date().toISOString().slice(0, 10)}.json`;

  const link = document.createElement("a");
  link.setAttribute("href", dataUri);
  link.setAttribute("download", exportFileDefaultName);
  link.click();

  console.log(`[Backup] Exported ${recentGames.length} games`);
});

// Restore (Import)
restoreBtn.addEventListener("click", () => {
  restoreFileInput.click();
});

restoreFileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const importedGames = JSON.parse(event.target.result);

      if (!Array.isArray(importedGames)) {
        alert("Invalid backup file: Expected an array of games.");
        return;
      }

      if (
        confirm(
          `Import ${importedGames.length} games?\nThis will REPLACE your current recent games list.`,
        )
      ) {
        recentGames = importedGames;
        api.storage.local.set({ recentGames }, () => {
          applyFilters();
          settingsPanel.style.display = "none";
          alert("✅ Restore successful!");
        });
      }
    } catch (err) {
      alert(
        "Failed to read the backup file. Please make sure it's a valid JSON.",
      );
    }
  };
  reader.readAsText(file);
  restoreFileInput.value = ""; // reset
});

// Delete All Data
deleteAllBtn.addEventListener("click", () => {
  if (recentGames.length === 0) {
    alert("No recent games to delete.");
    return;
  }

  if (
    confirm(
      `WARNING: This will permanently delete ALL ${recentGames.length} games.\n\nAre you sure?`,
    )
  ) {
    recentGames = [];
    api.storage.local.set({ recentGames }, () => {
      applyFilters();
      settingsPanel.style.display = "none";
      alert("All recent games have been deleted.");
    });
  }
});
// =====================
// Save / Delete handlers
// =====================
saveBtn.onclick = () => {
  if (currentGameIndex === null) return;
  const webretroRom = document.getElementById("webretro_rom");
  if (
    editImgInput.value !== "" &&
    editImg.src.length > 5 &&
    !editImg.src.includes("placehold")
  ) {
    recentGames[currentGameIndex].image = editImgInput.value;
  }
  if (webretroRom.checked) {
    recentGames[currentGameIndex].useWebRetro = true;
  } else {
    recentGames[currentGameIndex].useWebRetro = false;
  }

  recentGames[currentGameIndex].name = editNameInput.value;
  Toast.success(`${recentGames[currentGameIndex].name} Updated`);

  api.storage.local.set({ recentGames }, () => {
    applyFilters(); // refresh with current filters
    closeDialog();
  });
};

deleteBtn.onclick = () => {
  if (
    confirm(`WARNING: This will permanently delete this game.\n\nAre you sure?`)
  ) {
    if (currentGameIndex === null) return;

    recentGames.splice(currentGameIndex, 1);

    api.storage.local.set({ recentGames }, () => {
      applyFilters();
      closeDialog();
    });
  }
};

cancelBtn.onclick = closeDialog;
// Select all emulator radios
const EMULATOR_STORAGE_KEY = "selectedEmulator";

const emulatorRadios = document.querySelectorAll('input[name="emulator"]');

// Save settings function
function saveEmulatorSetting() {
  const value = useWebRetro ? "WebRetro" : "EmulatorJS";
  localStorage.setItem(EMULATOR_STORAGE_KEY, value);
  console.log("Emulator setting saved:", value);
}

// Load settings function
function loadEmulatorSetting() {
  const savedValue = localStorage.getItem(EMULATOR_STORAGE_KEY);
  if (savedValue) {
    useWebRetro = savedValue === "WebRetro";
    // Update the radio buttons visually
    emulatorRadios.forEach((radio) => {
      radio.checked = radio.value === savedValue;
    });
    console.log("Emulator setting loaded:", savedValue);
  }
}

// Attach change events
emulatorRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    if (radio.checked) {
      useWebRetro = radio.value === "WebRetro";
      console.log("Selected emulator:", radio.value);
      saveEmulatorSetting(); // Save immediately
    }
  });
});

const emulatorRadiosRom = document.querySelectorAll(
  'input[name="rom_emulator"]',
);

// Attach change events
emulatorRadiosRom.forEach((radio) => {
  radio.addEventListener("change", () => {
    if (radio.checked) {
      console.log("Selected emulator:", radio.value);
    }
  });
});

// Load saved setting on page load
window.addEventListener("DOMContentLoaded", loadEmulatorSetting);

// Fallback image URL
const placeholderImg = "https://placehold.co/600x450?text=Invalid+Image"; // replace with your preferred placeholder

// Function to update image with fallback
function updateEditImage(url) {
  editImg.src = url || placeholderImg;

  // If image fails to load, use placeholder
  editImg.onerror = () => {
    editImg.src = placeholderImg;
  };
}

editImgInput.addEventListener("input", () => {
  updateEditImage(editImgInput.value);
});

editImgInput.addEventListener("change", () => {
  updateEditImage(editImgInput.value);
});

// =========================================
// Toast Notification System
// =========================================

const Toast = (() => {
  const icons = {
    success: api.runtime.getURL("img/badge-check-white.svg"),
    error: api.runtime.getURL("img/diamond-exclamation-white.svg"),
    warning: api.runtime.getURL("img/bell-exclamation-white.svg"),
    info: api.runtime.getURL("img/circle-info-white.svg"),
  };

  let root;
  const containers = {};
  const injectedGlowTypes = new Set();

  // Ensure root container exists
  function ensureRoot() {
    if (root) return root;

    root = document.getElementById("bc-toast-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "bc-toast-root";
      Object.assign(root.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "0",
        zIndex: "2147483647",
        pointerEvents: "none",
      });
      document.documentElement.appendChild(root);
    }
    return root;
  }

  // Glow keyframes per type
  function ensureGlow(type, color) {
    if (injectedGlowTypes.has(type)) return;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes bc-toast-glow-${type} {
        0%   { box-shadow: 0 0 0 ${color}; }
        50%  { box-shadow: 0 0 14px ${color}; }
        100% { box-shadow: 0 0 0 ${color}; }
      }
    `;
    document.documentElement.appendChild(style);
    injectedGlowTypes.add(type);
  }

  function getGlowColor(type) {
    switch (type) {
      case "success":
        return "rgba(46, 204, 113, 0.6)";
      case "error":
        return "rgba(231, 76, 60, 0.6)";
      case "warning":
        return "rgba(241, 196, 15, 0.6)";
      default:
        return "rgba(52, 152, 219, 0.6)";
    }
  }

  // Create/get per-position container
  function getContainer(position) {
    if (containers[position]) return containers[position];

    const el = document.createElement("div");
    el.className = `bc-toast-container ${position}`;
    Object.assign(el.style, {
      position: "fixed",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      padding: "10px",
      pointerEvents: "none",
    });

    const posMap = {
      top: { top: "0", left: "50%", transform: "translateX(-50%)" },
      bottom: { bottom: "0", left: "50%", transform: "translateX(-50%)" },
      "top-left": { top: "0", left: "0" },
      "top-right": { top: "0", right: "0" },
      "bottom-left": { bottom: "0", left: "0" },
      "bottom-right": { bottom: "0", right: "0" },
    };

    Object.assign(el.style, posMap[position] || posMap["top"]);
    ensureRoot().appendChild(el);
    containers[position] = el;
    return el;
  }

  function getBg(type) {
    switch (type) {
      case "success":
        return "#1f7a3a";
      case "error":
        return "#7a1f1f";
      case "warning":
        return "#7a5a1f";
      default:
        return "#1f3a7a";
    }
  }

  // Show toast
  function show(message, opts = {}) {
    const {
      type = "info",
      duration = 3000,
      position = "top",
      icon,
      closable = false,
    } = opts;

    const container = getContainer(position);
    const toast = document.createElement("div");

    let removed = false;
    let timeoutId = null;

    Object.assign(toast.style, {
      minWidth: "220px",
      maxWidth: "320px",
      background: getBg(type),
      color: "#fff",
      borderRadius: "8px",
      padding: "10px 12px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      pointerEvents: "auto",
      opacity: "0",
      transform: "translateY(10px)",
      transition: "all 0.2s ease",
      fontFamily: "system-ui",
      fontSize: "12px",
      cursor: closable ? "pointer" : "default",
    });

    // Glow only if closable
    if (closable) {
      const glowColor = getGlowColor(type);
      ensureGlow(type, glowColor);
      toast.style.animation = `bc-toast-glow-${type} 1.5s ease-in-out infinite`;
      // Hover effect
      toast.addEventListener(
        "mouseenter",
        () => (toast.style.opacity = "0.85"),
      );
      toast.addEventListener("mouseleave", () => (toast.style.opacity = "1"));
    }

    // Icons
    const leftIcon = document.createElement("img");
    leftIcon.src = icon || icons[type];
    leftIcon.style.width = "18px";
    const rightIcon = leftIcon.cloneNode();

    // Text
    const textEl = document.createElement("div");
    textEl.textContent = message;
    Object.assign(textEl.style, {
      flex: "1",
      textAlign: "center",
    });

    toast.appendChild(leftIcon);
    toast.appendChild(textEl);
    toast.appendChild(rightIcon);

    // Click-to-dismiss only if closable
    if (closable) {
      toast.addEventListener("click", () => {
        if (removed) return;
        removed = true;
        toast.style.animation = ""; // stop glow
        if (timeoutId) clearTimeout(timeoutId);
        removeToast(toast);
      });
    }

    // Animate in
    requestAnimationFrame(() => {
      if (removed) return;
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    // Auto-remove
    if (duration > 0) {
      timeoutId = setTimeout(() => {
        if (removed) return;
        removed = true;
        toast.style.animation = ""; // stop glow
        removeToast(toast);
      }, duration);
    }

    container.appendChild(toast);
    return toast;
  }

  function removeToast(toast) {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.animation = "";
    setTimeout(() => toast.remove(), 200);
  }

  return {
    show,
    success: (msg, opts = {}) => show(msg, { ...opts, type: "success" }),
    error: (msg, opts = {}) => show(msg, { ...opts, type: "error" }),
    warning: (msg, opts = {}) => show(msg, { ...opts, type: "warning" }),
    info: (msg, opts = {}) => show(msg, { ...opts, type: "info" }),
  };
})();
