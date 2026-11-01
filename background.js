// Sip – background script. Runs as a service worker in Chrome and an event page in Firefox (MV3).
const api = globalThis.browser ?? globalThis.chrome;
const isFirefox = typeof globalThis.browser !== 'undefined' && !!globalThis.browser.runtime?.getBrowserInfo;

const ALARM = 'sip-reminder';
const NOTIF = 'sip-notification';
const DEFAULTS = {
  enabled: true,
  interval: 45,          // minutes between reminders
  goal: 8,               // glasses per day
  activeHoursOnly: false,
  startHour: 9,
  endHour: 18,
  skipWhenIdle: true,    // hold reminders while you're away, show them when you're back
  count: 0,
  day: '',
  pending: false,        // a reminder fired but hasn't been answered yet
  history: {},           // { 'YYYY-MM-DD': glasses }, last 30 days
  lastError: '',         // last notification failure, shown in the popup
  reminderStyle: 'notification',   // or 'window'
};

function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function getState() {
  const s = await api.storage.local.get(DEFAULTS);
  const today = dayKey();
  if (s.day !== today) {               // new day: reset the counter
    s.day = today;
    s.count = 0;
    await api.storage.local.set({ day: today, count: 0 });
  }
  return s;
}

function inActiveHours(s) {
  if (!s.activeHoursOnly) return true;
  const h = new Date().getHours();
  return h >= s.startHour && h < s.endHour;
}

function setBadge(on) {
  api.action.setBadgeText({ text: on ? '!' : '' });
  if (on) api.action.setBadgeBackgroundColor({ color: '#2f80ed' });
}

// Alarms (not setInterval) so reminders survive the worker being shut down.
async function schedule(firstDelay) {
  const s = await getState();
  await api.alarms.clear(ALARM);
  if (!s.enabled) { setBadge(false); return; }
  api.alarms.create(ALARM, {
    delayInMinutes: firstDelay ?? s.interval,
    periodInMinutes: s.interval,
  });
}

async function notify() {
  const s = await getState();
  const options = {
    type: 'basic',
    iconUrl: api.runtime.getURL('icons/icon128.png'),
    title: 'Time for some water',
    message: isFirefox
      ? `${s.count} of ${s.goal} glasses today. Click to log one.`
      : `${s.count} of ${s.goal} glasses today.`,
  };
  // Firefox rejects notification buttons, so it gets click-to-log instead.
  if (!isFirefox) {
    options.buttons = [{ title: 'I drank' }, { title: 'Snooze 10 min' }];
    options.requireInteraction = true;   // stays on screen until you answer it
  }
  try {
    await api.notifications.create(NOTIF, options);
    await api.storage.local.set({ lastError: '' });
    return { ok: true };
  } catch (e) {
    const error = String(e?.message ?? e);
    await api.storage.local.set({ lastError: error });
    return { ok: false, error };
  }
}

// Fallback that doesn't depend on system notification settings: a small always-visible window.
async function showWindow() {
  const { reminderWin } = await api.storage.local.get({ reminderWin: 0 });
  if (reminderWin) { try { await api.windows.remove(reminderWin); } catch {} }
  try {
    const win = await api.windows.create({
      url: api.runtime.getURL('reminder.html'), type: 'popup', width: 330, height: 240, focused: true,
    });
    await api.storage.local.set({ reminderWin: win.id, lastError: '' });
    return { ok: true };
  } catch (e) {
    const error = String(e?.message ?? e);
    await api.storage.local.set({ lastError: error });
    return { ok: false, error };
  }
}

async function remind() {
  const s = await getState();
  return s.reminderStyle === 'window' ? showWindow() : notify();
}

async function logGlass() {
  const s = await getState();
  const count = s.count + 1;
  const history = { ...s.history, [s.day]: count };
  const kept = Object.keys(history).sort().slice(-30);
  await api.storage.local.set({
    count,
    history: Object.fromEntries(kept.map((k) => [k, history[k]])),
    pending: false,
  });
  setBadge(false);
  api.notifications.clear(NOTIF);
  await schedule();                    // restart the countdown from now
}

async function snooze(minutes = 10) {
  await api.storage.local.set({ pending: false });
  setBadge(false);
  api.notifications.clear(NOTIF);
  await schedule(minutes);
}

api.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM) return;
  const s = await getState();
  if (!s.enabled || !inActiveHours(s)) return;

  await api.storage.local.set({ pending: true });
  setBadge(true);

  if (s.skipWhenIdle) {
    const state = await api.idle.queryState(300);
    if (state !== 'active') return;    // away: badge stays, notification waits
  }
  remind();
});

// Back at the keyboard with a reminder waiting.
api.idle.setDetectionInterval(300);
api.idle.onStateChanged.addListener(async (state) => {
  if (state !== 'active') return;
  const s = await getState();
  if (s.enabled && s.pending && s.skipWhenIdle && inActiveHours(s)) remind();
});

api.notifications.onClicked.addListener((id) => { if (id === NOTIF) logGlass(); });
api.notifications.onButtonClicked?.addListener((id, index) => {
  if (id !== NOTIF) return;
  index === 0 ? logGlass() : snooze(10);
});

api.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  const ok = () => ({ ok: true });
  const job =
    msg?.type === 'log' ? logGlass().then(ok) :
    msg?.type === 'snooze' ? snooze(10).then(ok) :
    msg?.type === 'test' ? remind() : null;
  if (!job) return;
  job.then(sendResponse);
  return true;
});

// Changing the interval or the on/off switch reschedules the alarm.
api.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes.enabled || changes.interval)) schedule();
});

api.runtime.onInstalled.addListener(() => schedule());
api.runtime.onStartup.addListener(async () => {
  if (!(await api.alarms.get(ALARM))) schedule();
});
