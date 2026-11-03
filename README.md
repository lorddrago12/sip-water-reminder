<div align="center">

# 💧 Sip

**A sip, right on time.**

A small browser extension that reminds you to drink water at the pace you choose, then keeps count so you don't have to.

[![Version](https://img.shields.io/badge/version-1.0.1-3b82f6?style=flat-square)](https://github.com/lorddrago12/sip-water-reminder)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)](#license)
[![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-ff7139?style=flat-square&logo=firefox-browser&logoColor=white)](https://addons.mozilla.org/firefox/addon/sip-water-reminder/)
[![Privacy](https://img.shields.io/badge/privacy-100%25%20local-0ea5e9?style=flat-square)](#privacy)

[**Website**](https://sip-extension.vercel.app/) · [**Get it for Firefox**](https://addons.mozilla.org/firefox/addon/sip-water-reminder/) · [**Download for Chrome / Edge / Brave**](https://sip-extension.vercel.app/sip-chrome.zip) · [**Report a bug**](https://github.com/lorddrago12/sip-water-reminder/issues)

</div>

<!--
  Add a screenshot or GIF of the popup here, e.g.:
  <p align="center"><img src="docs/popup.png" alt="Sip popup" width="360"></p>
-->

---

## Overview

Sip lives in your toolbar. Click the icon and your whole day is right there: how many glasses you've had, when the next reminder lands, and how long your streak is. No new tab, no dashboard, no account.

It runs a timer, shows a reminder, and keeps a tally. That's all it does, and all of it stays on your device.

## Features

- **Glass-by-glass progress bar.** Each segment is one glass toward your daily goal. Tap **I drank** to fill it; it turns green when you reach the goal.
- **Streaks and recent history.** See how many days in a row you've hit your goal, plus how the previous three days went.
- **A pace you set.** Remind me every **1 to 240 minutes**, with a daily goal of **1 to 30 glasses**.
- **Snooze.** In the middle of something? Snooze for 10 minutes.
- **Two reminder styles.** Choose a system notification or a small always-on-top window.
- **Away-aware.** If you've been off the computer for 5 minutes or more, Sip holds the reminder and shows it when you're back. A small badge on the toolbar icon shows it's waiting.
- **Private by design.** No account, no analytics, no server, works offline.

## Install

### Firefox

Install from the official Add-ons listing:

👉 **[Sip on Firefox Add-ons](https://addons.mozilla.org/firefox/addon/sip-water-reminder/)**

Requires desktop Firefox 142 or newer.

### Chrome, Edge, Brave

Sip isn't in the Chrome Web Store yet, so for now it's a manual install:

1. [Download the ZIP](https://sip-extension.vercel.app/sip-chrome.zip) and unzip it.
2. Open `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the unzipped folder.

## How it works

1. **The timer runs.** Your browser keeps an alarm at the interval you set, even when the browser is quiet.
2. **A reminder appears.** When the time comes, you get a notification or a small window, whichever you picked.
3. **Away? It waits.** After 5 minutes of inactivity, the reminder is held until you return.
4. **You answer.** **I drank** adds a glass. **Snooze** asks again in 10 minutes.
5. **Counts stay local.** Your counts live in the browser's own extension storage on this device, for the last 30 days.

## Reminder styles

| Style | What you get | Best for |
|---|---|---|
| **Notification** | A system notification in the corner of your screen. In Chrome it stays until you answer it, with **I drank** and **Snooze** buttons. | Staying out of the way |
| **Small window** | A small window that opens on top of your screen. Hard to miss, and it works even if your system hides notifications. | Never missing a reminder |

## Privacy

Sip has no account and talks to no server. Your settings and counts stay in your browser.

- No account or sign-up
- No analytics or tracking of any kind
- Your counts never leave your device
- No syncing, so each browser profile is separate
- Works offline, because everything is local

### Permissions

| Permission | Why Sip needs it |
|---|---|
| `alarms` | To run the reminder timer at the interval you set. |
| `notifications` | To show the reminder on your screen. |
| `storage` | To save your settings and daily counts on this device. |
| `idle` | To hold a reminder while you're away and show it when you're back. |

## FAQ

<details>
<summary><strong>I don't see the notification. What now?</strong></summary>

Your system may be hiding it. Check that notifications are enabled for your browser and that Do Not Disturb or Focus mode is off. Alternatively, open Sip, go to **Settings**, and switch **Reminder style** to **Small window**. There's also a **Test reminder** button there.
</details>

<details>
<summary><strong>Does it sync between devices?</strong></summary>

No. Data is stored locally per browser profile and doesn't sync anywhere.
</details>

<details>
<summary><strong>Does it work on my phone?</strong></summary>

Not yet. Sip is for desktop browsers for now.
</details>

<details>
<summary><strong>Do I need an account?</strong></summary>

No. There's no sign-up, no login, and no profile of any kind.
</details>

## Development

To run Sip from source:

```bash
git clone https://github.com/lorddrago12/sip-water-reminder.git
cd sip-water-reminder
```

**Chrome / Edge / Brave:** open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the extension folder.

**Firefox:** open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and select the extension's `manifest.json`.

## Contributing

Issues and pull requests are welcome. If you've found a bug or have an idea, [open an issue](https://github.com/lorddrago12/sip-water-reminder/issues) and describe what you're seeing or what you'd like to see.

## License

Released under the [MIT License](LICENSE).

---

<div align="center">

Made by [Drago](https://github.com/lorddrago12) · [sip-extension.vercel.app](https://sip-extension.vercel.app/)

</div>
