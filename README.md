# Retro Arcade Browser Extension

![Retro Arcade Logo](./badcases-arcade/img/icon128.png) <!-- Replace with your actual icon path -->

**Retro Arcade** is a browser extension that 
---

## 📖 Table of Contents

- [Key Features](#key-features)  
- [Screenshots](#screenshots)  
- [Installation](#installation)  

---

## Key Features

- **Smart ROM Detection**: Scans any webpage instantly for links to common ROM file extensions.

- **One-Click Play**: Injects a "Play" button directly next to detected links for immediate access.

- **Native Browser Emulator**: Launches games directly in your browser—no external software or setup required.

- **Dynamic Arcade Dashboard**: Automatically saves played ROMs to a sleek, searchable library.

- **Custom Library Curation**: Personalize your collection by editing box art and ROM titles within the dashboard.

- **Universal Compatibility**: Optimized for a seamless retro gaming experience on both desktop and mobile.

---

## Screenshots

**Injected Buttons**  
<img src="./img/buttons.png" alt="Injected Buttons" width="100%">

**User Dashboard**  
<img src="./img/arcade-dashboard.png" alt="User Dashboard" width="100%">
---

## Installation

### Chrome Desktop (Recommended for Desktop)

1. Download the latest ZIP release from [Releases](https://github.com/BadCaseDotOrg/RetroArcade/releases).
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle top-right).
4. Click **Load unpacked** and select the extracted folder from the ZIP.

---

### Quetta Mobile (Recommended for Mobile)

1. Download the latest ZIP release from [Releases](https://github.com/BadCaseDotOrg/RetroArcade/releases).
2. Open **[Quetta Mobile](https://play.google.com/store/apps/details?id=net.quetta.browser)**, go to **Settings → Extensions**, and scroll to the bottom and select **Developer options**.
3. Enable **Developer mode** (toggle in the upper right).
4. Tap **(from .zip/.crx/.user.js)** and select the downloaded ZIP file.
5. The extension will now be installed and appear in your Quetta extensions list.

---

### Firefox Nightly Desktop (using CRX Installer)

1. Download the latest CRX release from [Releases](https://github.com/BadCaseDotOrg/RetroArcade/releases).
2. Download and install **Firefox Nightly**:  
   - **Desktop:** [Firefox Nightly for Windows/macOS/Linux](https://www.mozilla.org/firefox/channel/desktop/)
3. Install the **CRX Installer** add-on from [Mozilla Add-ons](https://addons.mozilla.org/en-US/firefox/addon/crxinstaller/).
4. Go to `about:config` in the address bar and disable `xpinstall.signatures.required` to allow unsigned extensions.
5. Open **CRX Installer** from the Firefox extension menu, tap **Choose File**, and select the downloaded CRX file, a prompt will appear to install the extension.
6. The extension will now appear in your add-ons list and is active.


### Firefox Nightly Mobile (using CRX Installer)

1. Download the latest CRX release from [Releases](https://github.com/BadCaseDotOrg/RetroArcade/releases).
2. Download and install **Firefox Nightly**:  
   - **Android:** [Firefox Nightly for Developers on Google Play](https://play.google.com/store/apps/details?id=org.mozilla.fenix)
3. Install the **CRX Installer** add-on from [Mozilla Add-ons](https://addons.mozilla.org/en-US/firefox/addon/crxinstaller/).
4. Go to `about:config` in the address bar and disable `xpinstall.signatures.required` to allow unsigned extensions.
5. Open **CRX Installer** from the Firefox extension menu, tap **Choose File**, and select the downloaded CRX file — it will automatically create a `.xpi` file.
6. Enable the **Debug menu** in Firefox Nightly:  
   - Go to **Settings → About Firefox Nightly**.
   - Tap the **Firefox logo** multiple times until you see “Debug menu enabled”.
7. Go back to **Settings → Install extension from file**, and select the `.xpi` file that CRX Installer created.
8. The extension will now appear in your add-ons list and is active.

