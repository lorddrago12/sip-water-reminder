const api = globalThis.browser ?? globalThis.chrome;
const $ = (id) => document.getElementById(id);
const ALARM = 'sip-reminder';
const DEFAULTS = { enabled: true, interval: 45, goal: 8, count: 0, day: '', history: {}, lastError: '', reminderStyle: 'notification' };

const key = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const fmtMins = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);

function dayRow(date, name, count, goal) {
  const met = count >= goal;
  const li = document.createElement('li');
  const chip = Object.assign(document.createElement('span'), { className: `chip${met ? ' met' : ''}`, textContent: name[0] });
  const label = Object.assign(document.createElement('span'), { className: 'name', textContent: name });
  const meter = Object.assign(document.createElement('span'), { className: `meter${met ? ' met' : ''}` });
  const fill = document.createElement('i');
  fill.style.width = `${Math.round(Math.min(count / goal, 1) * 100)}%`;
  meter.append(fill);
  const num = Object.assign(document.createElement('span'), { className: 'num', textContent: count });
  li.append(chip, label, meter, num);
  return li;
}

async function render() {
  const s = await api.storage.local.get(DEFAULTS);
  const today = key();
  const count = s.day === today ? s.count : 0;
  const hist = { ...s.history, [today]: count };

  $('enabled').checked = s.enabled;
  if (document.activeElement !== $('style')) $('style').value = s.reminderStyle;
  for (const id of ['interval', 'goal']) {
    if (document.activeElement !== $(id)) $(id).value = s[id];
  }

  $('sToday').textContent = `${count}/${s.goal}`;
  let streak = 0;
  for (let n = count >= s.goal ? 0 : 1; n < 400; n++) {
    if ((hist[key(daysAgo(n))] || 0) >= s.goal) streak++; else break;
  }
  $('sStreak').textContent = streak;

  const segs = $('segs');
  if (segs.children.length !== s.goal) {
    segs.replaceChildren(...Array.from({ length: s.goal }, () => document.createElement('i')));
  }
  [...segs.children].forEach((el, i) => el.classList.toggle('on', i < count));
  segs.classList.toggle('done', count >= s.goal);
  segs.setAttribute('aria-valuemax', s.goal);
  segs.setAttribute('aria-valuenow', Math.min(count, s.goal));
  $('cap').textContent = count >= s.goal ? 'Goal reached' : `${s.goal - count} to go`;

  $('days').replaceChildren(...[1, 2, 3].map((n) => {
    const d = daysAgo(n);
    const name = n === 1 ? 'Yesterday' : d.toLocaleDateString(undefined, { weekday: 'long' });
    return dayRow(d, name, hist[key(d)] || 0, s.goal);
  }));

  let blocked = false;
  try { blocked = (await api.notifications.getPermissionLevel?.()) === 'denied'; } catch {}
  const warning = blocked
    ? 'Your browser is blocking notifications. Turn them on in your system settings.'
    : s.lastError ? `Couldn't show the last notification: ${s.lastError}` : '';
  $('warn').textContent = warning;
  $('warn').hidden = !warning;

  $('dot').classList.toggle('off', !s.enabled);
  $('status').textContent = s.enabled ? `Reminders every ${s.interval} min` : 'Reminders off';
  if (!s.enabled) {
    $('sNext').textContent = 'Off';
  } else {
    const alarm = await api.alarms.get(ALARM);
    const mins = alarm ? Math.max(1, Math.round((alarm.scheduledTime - Date.now()) / 60000)) : null;
    $('sNext').textContent = mins ? fmtMins(mins) : '-';
  }
}

$('enabled').addEventListener('change', () => api.storage.local.set({ enabled: $('enabled').checked }));

const limits = { interval: [1, 240], goal: [1, 30] };
for (const [id, [min, max]] of Object.entries(limits)) {
  $(id).addEventListener('change', () => {
    const v = Math.min(max, Math.max(min, Math.round(Number($(id).value)) || DEFAULTS[id]));
    $(id).value = v;
    api.storage.local.set({ [id]: v });
  });
}

$('drink').addEventListener('click', () => api.runtime.sendMessage({ type: 'log' }).then(render));
$('style').addEventListener('change', () => api.storage.local.set({ reminderStyle: $('style').value }));

$('test').addEventListener('click', async () => {
  $('testMsg').textContent = 'Sending...';
  const r = await api.runtime.sendMessage({ type: 'test' });
  $('testMsg').textContent = r?.ok
    ? "Sent. If you don't see it, check your system notification settings for this browser."
    : `Couldn't show it: ${r?.error ?? 'unknown error'}`;
});
$('toggle').addEventListener('click', () => {
  const open = $('prefs').hidden;
  $('prefs').hidden = !open;
  $('home').hidden = open;
  $('toggle').textContent = open ? 'Done' : 'Settings';
});

api.storage.onChanged.addListener(render);
setInterval(render, 15000);
render();
