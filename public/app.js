// AC Rangers Timeclock — Phase 1: clock in/out + My Day.

const $ = id => document.getElementById(id);

const METRIC_LABELS = {
  callsIn:        'inbound',
  callsOut:       'outbound',
  jobsCreated:    'jobs created',
  jobsDispatched: 'dispatched',
  estSent:        'estimates sent',
  audits:         'audits',
  invoices:       'invoices'
};

let me = null;
let status = null;
let dayDate = azTodayStr();
let tickHandle = null;

// fetch() does not throw on 400/500 — an unchecked res.ok turns a failure into a silent success.
async function api(url, opts = {}) {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  if (res.status === 401) { showLogin(); throw new Error('Not signed in'); }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { msg = (await res.json()).error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// ─── Arizona time (UTC-7, no DST) ──────────────────────────────────────────

function azTodayStr() {
  return new Date(Date.now() - 7 * 3600 * 1000).toISOString().split('T')[0];
}

function azHourOf(iso) {
  const d = new Date(iso);
  return (d.getUTCHours() - 7 + 24) % 24;
}

function azDateOf(iso) {
  const d = new Date(iso);
  let date = d.toISOString().split('T')[0];
  if (d.getUTCHours() < 7) {
    const prev = new Date(d);
    prev.setUTCDate(prev.getUTCDate() - 1);
    date = prev.toISOString().split('T')[0];
  }
  return date;
}

function shiftDate(dateStr, days) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

const fmtTime = iso => new Date(iso).toLocaleTimeString('en-US', {
  hour: 'numeric', minute: '2-digit', timeZone: 'America/Phoenix'
});

const fmtDay = dateStr => new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('en-US', {
  weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC'
});

function fmtHour(h) {
  const suffix = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour} ${suffix}`;
}

function fmtMinutes(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

function fmtElapsed(fromIso) {
  const secs = Math.max(0, Math.floor((Date.now() - new Date(fromIso).getTime()) / 1000));
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Views ─────────────────────────────────────────────────────────────────

function showView(name) {
  ['login', 'clock', 'day'].forEach(v => { $(v).hidden = v !== name; });
  $('tabs').hidden = name === 'login';
  document.querySelectorAll('.tabs button').forEach(b => {
    b.classList.toggle('active', b.dataset.view === name);
  });
  if (name === 'day') loadDay();
}

function showLogin() {
  me = null;
  clearInterval(tickHandle);
  showView('login');
  loadUsers();
}

// ─── Sign in ───────────────────────────────────────────────────────────────

async function loadUsers() {
  try {
    const users = await api('/api/auth/users');
    $('login-user').innerHTML = '<option value="">Select your name</option>' +
      users.map(u => `<option value="${u.username}" data-registered="${u.registered}">${u.name}</option>`).join('');
  } catch (e) {
    $('login-error').textContent = e.message;
    $('login-error').hidden = false;
  }
}

function onUserPick() {
  const opt = $('login-user').selectedOptions[0];
  const picked = !!$('login-user').value;
  $('pin-block').hidden = !picked;
  $('login-btn').disabled = true;
  $('login-pin').value = '';
  $('login-error').hidden = true;

  if (!picked) return;
  const registered = opt.dataset.registered === 'true';
  $('pin-label').textContent = registered ? 'Enter your PIN' : 'Create a 4-digit PIN';
  $('pin-hint').textContent = registered
    ? ''
    : 'This is your first sign-in. Pick a 4-digit PIN — you will use it every time.';
  $('login-pin').focus();
}

async function doLogin() {
  const username = $('login-user').value;
  const pin = $('login-pin').value;
  $('login-error').hidden = true;
  $('login-btn').disabled = true;
  try {
    me = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, pin }) });
    dayDate = azTodayStr();
    await start();
  } catch (e) {
    $('login-error').textContent = e.message;
    $('login-error').hidden = false;
    $('login-btn').disabled = false;
    $('login-pin').value = '';
    $('login-pin').focus();
  }
}

// ─── Clock ─────────────────────────────────────────────────────────────────

async function loadStatus() {
  status = await api('/api/time/status');
  renderClock();
}

function renderClock() {
  $('clock-who').textContent = me?.name || '';
  const open = status?.open;

  $('clock-status').textContent = open ? 'Clocked in' : 'Not clocked in';
  $('clock-btn').textContent = open ? 'Clock Out' : 'Clock In';
  $('clock-btn').classList.toggle('out', !!open);
  $('clock-btn').disabled = false;

  $('clock-today').textContent = status
    ? `${fmtMinutes(status.minutesToday)} today`
    : '';

  clearInterval(tickHandle);
  if (open) {
    const tick = () => { $('clock-timer').textContent = fmtElapsed(open.clock_in); };
    tick();
    tickHandle = setInterval(tick, 1000);
  } else {
    $('clock-timer').textContent = '—';
  }
}

async function onClockButton() {
  if (status?.open) { openOutModal(); return; }
  $('clock-btn').disabled = true;
  try {
    await api('/api/time/clock-in', { method: 'POST' });
    await loadStatus();
  } catch (e) {
    alert(e.message);
    $('clock-btn').disabled = false;
  }
}

function openOutModal() {
  $('out-note').value = '';
  $('out-job').value = '';
  $('out-error').hidden = true;
  $('out-modal').hidden = false;
  $('out-note').focus();
}

async function confirmClockOut() {
  const note = $('out-note').value.trim();
  if (!note) {
    $('out-error').textContent = 'Add a short note about what you worked on.';
    $('out-error').hidden = false;
    return;
  }
  $('out-confirm').disabled = true;
  try {
    await api('/api/time/clock-out', {
      method: 'POST',
      body: JSON.stringify({ note, jobNumber: $('out-job').value.trim() })
    });
    $('out-modal').hidden = true;
    await loadStatus();
  } catch (e) {
    $('out-error').textContent = e.message;
    $('out-error').hidden = false;
  } finally {
    $('out-confirm').disabled = false;
  }
}

// ─── My Day ────────────────────────────────────────────────────────────────

async function loadDay() {
  $('day-date').textContent = dayDate === azTodayStr() ? 'Today' : fmtDay(dayDate);
  $('day-next').disabled = dayDate >= azTodayStr();
  $('day-hours').innerHTML = '<p class="empty">Loading…</p>';
  $('day-sessions').innerHTML = '';
  $('day-stamp').textContent = '';

  try {
    const day = await api(`/api/time/day?date=${dayDate}`);
    renderDay(day);
  } catch (e) {
    $('day-hours').innerHTML = `<p class="empty">${e.message}</p>`;
  }
}

function renderDay(day) {
  const { sessions, activity, minutesTotal } = day;

  $('day-sessions').innerHTML = sessions.length
    ? sessions.map(s => `
        <div class="session">
          <div class="range">${fmtTime(s.clock_in)} – ${s.clock_out ? fmtTime(s.clock_out) : 'still clocked in'}</div>
          ${s.note ? `<div class="note">${escapeHtml(s.note)}</div>` : ''}
          ${s.job_number ? `<div class="job">Job #${escapeHtml(s.job_number)}</div>` : ''}
        </div>`).join('') + `<div class="stamp">${fmtMinutes(minutesTotal)} total</div>`
    : '<div class="session"><div class="quiet">No clock-in recorded for this day.</div></div>';

  // Hours you were clocked in, plus any hour that has tracked activity — a forgotten
  // clock-in should still show its work rather than hiding it.
  const covered = new Set();
  sessions.forEach(s => {
    if (azDateOf(s.clock_in) !== day.date) return;
    const end = s.clock_out || new Date().toISOString();
    const last = azDateOf(end) === day.date ? azHourOf(end) : 23;
    for (let h = azHourOf(s.clock_in); h <= last; h++) covered.add(h);
  });

  const rows = activity.hours.filter(h => covered.has(h.hour) || h.total > 0);

  $('day-hours').innerHTML = rows.length
    ? rows.map(h => renderHour(h, covered.has(h.hour))).join('')
    : '<p class="empty">Nothing here yet. Clock in and your hours will fill in as you work.</p>';

  if (activity.cachedAt) {
    const mins = Math.round((Date.now() - new Date(activity.cachedAt).getTime()) / 60000);
    $('day-stamp').textContent = `Tracker activity updated ${mins < 1 ? 'just now' : `${mins} min ago`}`;
  }
}

function renderHour(h, clockedIn) {
  const chips = Object.entries(h.metrics)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `<span class="chip"><b>${n}</b> ${METRIC_LABELS[k]}</span>`)
    .join('');

  const body = chips
    ? `<div class="chips">${chips}</div>`
    : `<div class="quiet">No tracked activity this hour.</div>`;

  return `
    <div class="hour${clockedIn ? '' : ' outside'}">
      <div class="h">${fmtHour(h.hour)}</div>
      <div class="body">
        ${clockedIn ? '' : '<div class="tag">Not clocked in</div>'}
        ${body}
      </div>
    </div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// ─── Boot ──────────────────────────────────────────────────────────────────

async function start() {
  showView('clock');
  await loadStatus();
}

$('login-user').addEventListener('change', onUserPick);
$('login-pin').addEventListener('input', e => {
  e.target.value = e.target.value.replace(/\D/g, '');
  $('login-btn').disabled = e.target.value.length !== 4;
});
$('login-pin').addEventListener('keydown', e => { if (e.key === 'Enter' && !$('login-btn').disabled) doLogin(); });
$('login-btn').addEventListener('click', doLogin);

$('clock-btn').addEventListener('click', onClockButton);
$('signout').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
  showLogin();
});

$('out-cancel').addEventListener('click', () => { $('out-modal').hidden = true; });
$('out-confirm').addEventListener('click', confirmClockOut);

$('day-prev').addEventListener('click', () => { dayDate = shiftDate(dayDate, -1); loadDay(); });
$('day-next').addEventListener('click', () => {
  if (dayDate >= azTodayStr()) return;
  dayDate = shiftDate(dayDate, 1);
  loadDay();
});

document.querySelectorAll('.tabs button').forEach(b => {
  b.addEventListener('click', () => showView(b.dataset.view));
});

(async () => {
  try {
    me = await api('/api/me');
    await start();
  } catch {
    showLogin();
  }
})();
