<div align="center">

# USOS Registration Sniper

**Be first. Every time.**

A browser extension that gives university students a split-second edge during course registration on [USOS](https://www.usos.edu.pl/) — the enrollment system used by the majority of Polish universities.

[![Chrome](https://img.shields.io/badge/Chrome-Supported-4285F4?logo=googlechrome&logoColor=white)](#installation)
[![Edge](https://img.shields.io/badge/Edge-Supported-0078D7?logo=microsoftedge&logoColor=white)](#installation)
[![Opera](https://img.shields.io/badge/Opera-Supported-FF1B2D?logo=opera&logoColor=white)](#installation)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)](#)

</div>

---

## The Problem

Every semester, thousands of students compete for limited spots in popular course groups. USOS registration opens at a precise moment and the best groups fill up within **seconds**. If you blink — you're stuck with the 7 AM Friday lab for the rest of the semester.

## The Solution

**USOS Registration Sniper** monitors the registration page and fires a precisely-timed burst of clicks the instant registration opens. It automatically:

- Detects which course you're viewing
- Selects your preferred tutorial/lab group
- Waits for the exact registration start time
- Executes a rapid multi-click sequence with sub-second precision
- Staggers requests across multiple open tabs to maximize success

No more refreshing. No more fumbling. Just results.

---

## Features

| Feature | Description |
|---|---|
| **Precision Timing** | Configurable down to the second with pre-fire offsets (`-500ms`, `0ms`, `+250ms`, `+750ms`) to ensure you hit the window |
| **Multi-Course Config** | Set target group numbers for each of your courses via a clean popup UI — no code editing needed |
| **Auto-Detection** | Automatically identifies the course from the page header and applies the correct group config |
| **Live Status Overlay** | A real-time HUD shows countdown, group detection status, and button readiness directly on the page |
| **Multi-Tab Strategy** | Each open tab gets a random delay offset, so parallel tabs fire in a staggered pattern instead of colliding |
| **Auto-Refresh** | Automatically refreshes the page after the initial attempt to retry if the server was slow |
| **Dynamic Updates** | Change settings in the popup while on the page — config applies instantly, no reload required |

---

## Installation

### Option A: Chrome Extension (Recommended)

1. Download or clone this repository
2. Open your browser and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the `extension/` folder from this project
6. The extension icon should appear in your toolbar — you're ready

> Works on **Chrome**, **Edge**, **Opera**, and any Chromium-based browser.

### Option B: Tampermonkey (Legacy)

If you prefer userscripts:

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser
2. Click the Tampermonkey icon → **Create a new script**
3. Replace the default template with the contents of `registration_bot.user.js`
4. Save (`Ctrl+S`)

---

## Configuration

Click the extension icon in your toolbar to open the settings popup:

1. **Group Numbers** — Enter your desired group number for each course
2. **Target Time** — Set the exact hour, minute, and second when registration opens (e.g., `6:00:00`)
3. Hit **Save** — settings are applied immediately to all open USOS tabs

---

## How It Works

```
1.  Navigate to your course's registration page on USOSweb
2.  The bot overlay appears in the top-right corner showing:
      • Detected course name
      • Target group & time
      • Checkbox / button detection status
      • Live countdown
3.  At the configured time, the bot executes a burst of clicks
4.  If needed, it auto-refreshes and retries
```

---

## Project Structure

```
├── extension/
│   ├── manifest.json      # Chrome Extension manifest (V3)
│   ├── content.js         # Core bot logic (injected into USOS pages)
│   ├── popup.html         # Settings UI
│   ├── popup.js           # Settings logic & storage
│   └── ...
├── registration_bot.user.js   # Standalone Tampermonkey userscript (legacy)
├── simulation.html            # Local test page for development
└── README.md
```

---

## Disclaimer

This tool is provided for educational purposes. Use it responsibly and in accordance with your university's terms of service. The authors are not responsible for any consequences resulting from its use.

---

<div align="center">
<sub>Built out of frustration with 6 AM registration scrambles.</sub>
</div>
