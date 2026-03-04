<div align="center">

# ⚡ USOS Registration Bot

### Secure your preferred course groups — automatically.

A browser extension that **automatically registers you for university courses** the moment enrollment opens — built for the [USOS](https://www.usos.edu.pl/) system used by **over 50 Polish universities**.

[![Chrome](https://img.shields.io/badge/Chrome-Supported-4285F4?logo=googlechrome&logoColor=white)](#-installation)
[![Edge](https://img.shields.io/badge/Edge-Supported-0078D7?logo=microsoftedge&logoColor=white)](#-installation)
[![Opera](https://img.shields.io/badge/Opera-Supported-FF1B2D?logo=opera&logoColor=white)](#-installation)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](#)

</div>

<br>

<div align="center">
  <img src="assets/popup_screenshot.png" alt="Popup Screenshot" width="400">
</div>

---


## 🎯 The Problem

Every semester, thousands of university students face the same stressful situation: **course group registration opens at a fixed time** (often early in the morning), and the most popular groups fill up within seconds.

Students who want a schedule that works around their other commitments — say, a lab group that doesn't overlap with another lecture, or a tutorial slot on a day they prefer — have to compete with hundreds of others clicking "Register" at the exact same moment. Even a one-second delay can mean the difference between your ideal schedule and being stuck with the last remaining slot.

**This extension solves that problem.** You configure which group number you want for each course, set the registration time, and the bot handles the rest — clicking the registration button with sub-second precision so you don't have to race anyone manually.

---

## 🚀 How It Works

Once configured, the extension runs silently on any USOSweb registration page:

```
  📡 DETECT    →    Identifies the course from the page header
  🎯 TARGET    →    Selects your preferred group (checkbox / radio)
  ⏱️  WAIT      →    Counts down to the exact registration time
  ⚡ FIRE      →    Precision click at T+500ms with visual feedback
  🔄 RECOVER   →    Auto-refreshes at T+25s if the server lagged
```

Open the registration page beforehand, walk away, and come back to a confirmed enrollment.

---

## ✨ Features

### Core
- **Millisecond-precision timing** — fires at a calculated offset from the registration opening, accounting for server response time
- **Automatic course detection** — reads the course name from the USOS page header and matches it to your saved configuration
- **Smart group selection** — finds and pre-checks the correct checkbox or radio button for your target group number

### Reliability
- **Multi-tab support** — open multiple registration pages in separate tabs; each tab generates a random 0–400ms delay offset to avoid firing at the exact same millisecond
- **Pre-fire activation** — the bot arms itself 3 seconds before the target time to ensure timers are queued with zero overhead
- **Auto-refresh recovery** — if nothing happens after 25 seconds (server lag), the bot automatically clicks the refresh button
- **Session-aware retry** — uses `sessionStorage` to prevent infinite refresh loops

### User Experience
- **Live status overlay** — a HUD panel on every USOS page showing:
  - Detected course name and target group
  - Countdown timer with color-coded urgency
  - Group detection status (✅ Found / ⚠️ Row only / ❌ Searching)
  - Registration button readiness
- **Popup settings panel** — configure courses and timing directly from the extension icon
- **Dynamic course management** — add any course name and group number you need (not limited to a fixed list)
- **Live config sync** — change settings from the popup while on the page; updates apply instantly via `chrome.storage.onChanged`
- **Visual target markers** — found buttons and group rows are highlighted with colored borders for easy identification

### Legacy: Tampermonkey Userscript
- A standalone `registration_bot.user.js` is also included for quick, single-course registrations without installing an extension
- Uses a burst-click strategy (8 rapid clicks over 2 seconds) to handle server lag

---

## 📦 Installation

### Option A — Chrome Extension *(Recommended)*

| Step | Action |
|:---:|---|
| **1** | Download or clone this repository |
| **2** | Open `chrome://extensions` in your browser |
| **3** | Toggle **Developer mode** on (top-right corner) |
| **4** | Click **Load unpacked** |
| **5** | Select the `extension/` folder |
| **6** | Done — the extension icon appears in your toolbar |

> Works with **Google Chrome**, **Microsoft Edge**, **Opera**, **Brave**, and any Chromium-based browser.

### Option B — Tampermonkey *(Legacy / Single-course)*

1. Install [Tampermonkey](https://www.tampermonkey.net/)
2. Create a new script and paste the contents of `registration_bot.user.js`
3. Edit the config constants at the top (`TARGET_GROUP_NUMBER`, `TARGET_HOUR`, etc.)
4. Save — the script activates automatically on any USOS page

---

## ⚙️ Configuration

Click the extension icon to open the settings popup:

| Setting | Description |
|---|---|
| **Courses** | Add each course by typing its name and the desired group number. You can add, remove, and manage courses freely. |
| **Registration time** | Set the exact HH:MM:SS when enrollment opens (default: `05:59:59` — the bot fires 500ms after `06:00:00`). |
| **Save** | Persists settings to `chrome.storage.local` and pushes them to all open USOS tabs in real time. |

> **Tip:** Set the time to `05:59:59`. The bot arms at T−3s and fires at T+500ms — giving the USOS server time to actually open registration before the click lands.

---

## 🔧 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USOS PAGE LOADED                      │
├─────────────────────────────────────────────────────────┤
│  content.js injected (Manifest V3 content_script)       │
│  ↓                                                      │
│  loadConfig() ← reads chrome.storage.local              │
│  ↓                                                      │
│  Main loop (setInterval @ 50ms = 20 ticks/sec)          │
│  ┌───────────────────────────────────────┐              │
│  │  detectCourseContext()                │  ← H1 parse  │
│  │  findAndSelectGroup()                 │  ← checkbox  │
│  │  findRegistrationButton()             │  ← DOM scan  │
│  │  findRefreshButton()                  │  ← fallback  │
│  │  checkTimeAndAct()                    │  ← timer     │
│  │  updateStatusPanel()                  │  ← HUD       │
│  └───────────────────────────────────────┘              │
│                                                          │
│  @ T-3s:   Arms executePrecisionAttack()                │
│  @ T+500ms: Click with visual burst                     │
│  @ T+25s:  Auto-refresh via tryRefreshAndRetry()        │
└─────────────────────────────────────────────────────────┘
```

The 50ms polling loop ensures the bot adapts to dynamic USOS page changes (lazy-loaded forms, AJAX updates) without missing a beat.

---

## 📁 Project Structure

```
studia_rejestracje/
├── extension/                      # Chrome Extension (Manifest V3)
│   ├── manifest.json               # Extension config, permissions, content script injection
│   ├── content.js                  # Core bot logic — detection, selection, precision timing
│   ├── popup.html                  # Settings UI
│   ├── popup.css                   # Popup styling
│   ├── popup.js                    # Dynamic course management + config persistence
│   └── INSTRUKCJA_INSTALACJI.txt   # Installation guide (Polish)
│
├── registration_bot.user.js        # Standalone Tampermonkey userscript (legacy)
├── simulation.html                 # Local mock USOS page for testing
└── README.md
```

---

## 🧪 Testing

Open `simulation.html` in your browser — it's a local replica of a USOS registration page with mock course groups and buttons. Use it to verify the bot works correctly without touching a live server.

**To test the timing:**
1. Set the target time in the popup to 1–2 minutes from now
2. Open `simulation.html` (or any matching USOS URL)
3. Watch the HUD count down and fire

---

## ⚠️ Disclaimer

This project is shared for **educational and personal-use purposes only**. It demonstrates browser extension development, DOM manipulation, and precision timing techniques.

Use responsibly and in accordance with your university's regulations. The author assumes no liability for any consequences arising from the use of this tool.

---

## 📄 License

This project is unlicensed — feel free to use, modify, and share. Attribution is appreciated but not required.

---

<div align="center">

_Built to solve the universal student problem of fighting for course registration spots._

**If this saved your semester, consider ⭐ starring the repo.**

</div>
