const api = globalThis.browser ?? globalThis.chrome;
const $ = (id) => document.getElementById(id);
const key = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

(async () => {
  const s = await api.storage.local.get({ count: 0, goal: 8, day: '' });
  const count = s.day === key() ? s.count : 0;
  $('msg').textContent = `${count} of ${s.goal}`;
})();

async function answer(type) {
  await api.runtime.sendMessage({ type });
  window.close();
}
$('drink').addEventListener('click', () => answer('log'));
$('snooze').addEventListener('click', () => answer('snooze'));
