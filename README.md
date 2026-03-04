<div align="center">

# ⚡ USOS Registration

### Never lose a course seat again.

A precision-engineered browser extension that **automatically registers you for university courses** the millisecond enrollment opens — built for the [USOS](https://www.usos.edu.pl/) system that powers **over 50 Polish universities**.

[![Chrome](https://img.shields.io/badge/Chrome-Supported-4285F4?logo=googlechrome&logoColor=white)](#-installation)
[![Edge](https://img.shields.io/badge/Edge-Supported-0078D7?logo=microsoftedge&logoColor=white)](#-installation)
[![Opera](https://img.shields.io/badge/Opera-Supported-FF1B2D?logo=opera&logoColor=white)](#-installation)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](#)

<br>

<img src="https://img.shields.io/badge/status-battle--tested-brightgreen?style=for-the-badge" alt="Battle Tested">

</div>

---

## 🎯 Why This Exists

Every semester, the same nightmare plays out across Polish universities:

> Registration opens at **6:00 AM sharp**. Hundreds of students slam the server at the exact same second. The best lab groups vanish in under **3 seconds**. You click "Register" at 6:00:01 — and you're already too late. Enjoy your Friday 7 AM class.

**USOS Registration Sniper** was built to end that. It turns your browser into an automated enrollment machine that fires with sub-second precision — so you can sleep easy knowing your schedule is locked in.

---

## 🚀 What It Does

Once configured, the extension runs silently on any USOSweb registration page. Here's the sequence:

```
  📡 DETECT    →    Identifies the course from the page header
  🎯 TARGET    →    Selects your preferred group checkbox/radio
  ⏱️  WAIT      →    Counts down to the exact registration time
  ⚡ FIRE      →    Precision click at T+500ms with visual feedback
  🔄 RECOVER   →    Auto-refreshes at T+25s if the server lagged
```

You open the page, walk away, and come back to a confirmed registration.

---

## ✨ Features

### Core
- **Millisecond-precision timing** — fires at a calculated offset from the registration opening, accounting for network overhead
- **Automatic course detection** — reads the course name directly from the USOS page header and matches it to your saved config
- **Smart group selection** — finds and pre-checks the correct checkbox or radio button for your target group number
- **Burst-click strategy** — the legacy userscript version fires 8 rapid clicks over 2 seconds to brute-force through server lag

### Tactical
- **Multi-tab stagger** — each open tab generates a random 0–400ms delay offset, so parallel tabs fire in a "spread pattern" instead of colliding on the same millisecond
- **Pre-fire activation** — the bot arms itself 3 seconds before go-time to ensure all timers are queued with zero overhead
- **Auto-refresh recovery** — if nothing happens after 25 seconds, the bot automatically hits the refresh button and retries
- **Session-aware retry** — uses `sessionStorage` to prevent infinite refresh loops

### UX
- **Live HUD overlay** — a monospace status panel pinned to the top-right of every USOS page showing:
  - Detected course name
  - Target group & scheduled fire time
  - Per-tab random delay offset
  - Group checkbox detection state (✅ Found / ⚠️ Row only / ❌ Searching)
  - Registration button readiness
  - Real-time countdown with color-coded urgency
- **Popup configuration** — clean, dark-themed settings panel right from the extension icon — no code editing required
- **Live config sync** — change group numbers or target times from the popup while on the page; settings apply instantly via `chrome.storage.onChanged`
- **Visual target markers** — found buttons get a purple (DarkViolet) glow border; target group rows are highlighted green

---

## 📦 Installation

### Option A — Chrome Extension *(Recommended)*

| Step | Action |
|:---:|---|
| **1** | Download or clone this repo |
| **2** | Open `chrome://extensions` in your browser |
| **3** | Toggle **Developer mode** on (top-right) |
| **4** | Click **Load unpacked** |
| **5** | Select the `extension/` folder |
| **6** | Done — the icon appears in your toolbar |

> Compatible with **Google Chrome**, **Microsoft Edge**, **Opera**, **Brave**, and any Chromium-based browser.

### Option B — Tampermonkey *(Legacy / Single-course)*

Best for quick one-off registrations without installing an extension:

1. Install [Tampermonkey](https://www.tampermonkey.net/)
2. Create a new script and paste the contents of `registration_bot.user.js`
3. Edit the config constants at the top of the script (`TARGET_GROUP_NUMBER`, `TARGET_HOUR`, etc.)
4. Save — the script auto-activates on any USOS page

---

## ⚙️ Configuration

Click the extension icon to open the settings popup:

<table>
<tr><td><b>Group Numbers</b></td><td>Enter the desired group number for each course (Algebra, Calculus, C++, Discrete Math, Operating Systems, Philosophy)</td></tr>
<tr><td><b>Target Time</b></td><td>Set the <b>exact</b> HH:MM:SS when registration opens (default: <code>05:59:59</code> — fires 500ms after 6:00:00)</td></tr>
<tr><td><b>Save</b></td><td>Persists to <code>chrome.storage.local</code> and pushes to all open USOS tabs in real-time</td></tr>
</table>

> **Tip:** Set the time to `05:59:59`. The bot arms at T-3s and fires its precision click at T+500ms (i.e., 06:00:00.500) — giving the USOS server time to actually open registration before the request hits.

---

## 🔧 How It Works Under the Hood

```
┌─────────────────────────────────────────────────────────┐
│                    USOS PAGE LOADED                      │
├─────────────────────────────────────────────────────────┤
│  content.js injected (manifest V3 content_script)       │
│  ↓                                                      │
│  loadConfig() ← reads chrome.storage.local              │
│  ↓                                                      │
│  Main loop starts (setInterval @ 50ms = 20 ticks/sec)   │
│  ┌───────────────────────────────────────┐              │
│  │  detectCourseContext()                │  ← H1 parse  │
│  │  findAndSelectGroup()                 │  ← checkbox  │
│  │  findRegistrationButton()             │  ← DOM scan  │
│  │  findRefreshButton()                  │  ← fallback  │
│  │  checkTimeAndAct()                    │  ← timer     │
│  │  updateStatusPanel()                  │  ← HUD       │
│  └───────────────────────────────────────┘              │
│                                                          │
│  @ T-3s:  Arms executePrecisionAttack()                 │
│  @ T+500ms: Fires click with DarkViolet visual burst    │
│  @ T+25s: Auto-refresh via tryRefreshAndRetry()         │
└─────────────────────────────────────────────────────────┘
```

The 50ms polling loop ensures the bot adapts to dynamic USOS page changes (lazy-loaded forms, AJAX updates) without missing a beat.

---

## 📁 Project Structure

```
studia_rejestracje/
├── extension/                      # Chrome Extension (Manifest V3)
│   ├── manifest.json               # Extension config, permissions, content script injection
│   ├── content.js                  # Core bot — course detection, group selection, precision attack
│   ├── popup.html                  # Dark-themed settings UI (320px popup)
│   ├── popup.js                    # Config persistence via chrome.storage API
│   └── INSTRUKCJA_INSTALACJI.txt   # Polish installation guide
│
├── registration_bot.user.js        # Standalone Tampermonkey userscript (legacy, single-course)
├── simulation.html                 # Local mock of USOS registration page for testing
└── README.md
```

---

## 🧪 Testing

Open `simulation.html` in your browser — it's a local replica of a USOS registration page with mock course groups and buttons. Perfect for verifying the bot detects elements correctly without touching a live server.

To test timing:
1. Set the target time in the popup to 1–2 minutes from now
2. Open `simulation.html` (or any matching USOS URL)
3. Watch the HUD count down and fire

---

## ⚠️ Disclaimer

This project is shared for **educational and personal-use purposes only**. It demonstrates browser extension development, DOM manipulation, and precision timing techniques.

Use responsibly and in accordance with your university's regulations. The author assumes no liability for any consequences arising from the use of this tool.

---

## 📄 License

This project is unlicensed — feel free to use, modify, and share it. Attribution is appreciated but not required.

---

<div align="center">

_Built out of pure frustration with 6 AM registration scrambles._

**If this saved your semester, consider starring the repo.** ⭐

</div>
