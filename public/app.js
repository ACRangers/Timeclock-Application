// AC Rangers Timeclock — My Day (self) and Team (managers).
// Hours come from ServiceTitan; activity comes from the tracker. Nobody clocks in here.

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
let dayDate = azTodayStr();
let teamDate = azTodayStr();
let teamMode = 'day';

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

// ─── Views ─────────────────────────────────────────────────────────────────

function showView(name) {
  ['login', 'day', 'team'].forEach(v => { $(v).hidden = v !== name; });
  $('tabs').hidden = name === 'login';
  document.querySelectorAll('.tabs button').forEach(b => {
    b.classList.toggle('active', b.dataset.view === name);
  });
  if (name === 'day') loadDay();
  if (name === 'team') loadTeam();
}

function showLogin() {
  me = null;
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
    me = await api('/api/me');
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

// ─── My Day ────────────────────────────────────────────────────────────────

async function loadDay() {
  $('day-who').textContent = me?.name || '';
  $('day-date').textContent = dayDate === azTodayStr() ? 'Today' : fmtDay(dayDate);
  $('day-next').disabled = dayDate >= azTodayStr();
  $('day-hours').innerHTML = '<p class="empty">Loading…</p>';
  $('day-sessions').innerHTML = '';
  $('day-stamp').textContent = '';

  try {
    renderDay(await api(`/api/time/day?date=${dayDate}`));
  } catch (e) {
    $('day-hours').innerHTML = `<p class="empty">${escapeHtml(e.message)}</p>`;
  }
}

// Which hours a set of ServiceTitan shifts covers on this Arizona day.
function coveredHours(shifts, date) {
  const covered = new Set();
  shifts.forEach(s => {
    if (azDateOf(s.started_at) !== date) return;
    const end = s.ended_at || new Date().toISOString();
    const last = azDateOf(end) === date ? azHourOf(end) : 23;
    for (let h = azHourOf(s.started_at); h <= last; h++) covered.add(h);
  });
  return covered;
}

function renderDay(day) {
  const { shifts, activity, minutesTotal } = day;

  $('day-sessions').innerHTML = shifts.length
    ? shifts.map(s => `
        <div class="session">
          <div class="range">${fmtTime(s.started_at)} – ${s.ended_at ? fmtTime(s.ended_at) : 'still clocked in'}</div>
          ${s.timesheet_code ? `<div class="job">${escapeHtml(s.timesheet_code)}</div>` : ''}
        </div>`).join('') + `<div class="stamp">${fmtMinutes(minutesTotal)} total</div>`
    : '<div class="session"><div class="quiet">No ServiceTitan clock-in for this day.</div></div>';

  // Hours you were clocked in, plus any hour with tracked activity — a forgotten
  // clock-in should still show its work rather than hiding it.
  const covered = coveredHours(shifts, day.date);
  const rows = activity.hours.filter(h => covered.has(h.hour) || h.total > 0);

  $('day-hours').innerHTML = rows.length
    ? rows.map(h => renderHour(h, covered.has(h.hour))).join('')
    : '<p class="empty">Nothing here yet for this day.</p>';

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

// ─── Team ──────────────────────────────────────────────────────────────────

const SHIFT_HOURS = Array.from({ length: 15 }, (_, i) => i + 5);   // 5 AM – 7 PM

// Hours silently reading zero is indistinguishable from everyone taking a day off,
// so a broken sync has to say so on the screen the manager actually looks at.
async function renderSyncBanner() {
  try {
    const s = await api('/api/manager/sync-state');
    $('team-banner').hidden = !s.last_error;
    if (s.last_error) {
      $('team-banner').textContent = /403|scope/i.test(s.last_error)
        ? 'ServiceTitan hours are not syncing: the API app is missing the payroll timesheet permission. Activity below is still accurate; clocked hours will read zero until that is granted.'
        : `ServiceTitan hours are not syncing: ${s.last_error}`;
    }
  } catch { $('team-banner').hidden = true; }
}

async function loadTeam() {
  $('team-grid').innerHTML = '<p class="empty">Loading…</p>';
  $('team-stamp').textContent = '';
  renderSyncBanner();
  document.querySelectorAll('.seg button').forEach(b => {
    b.classList.toggle('active', b.id === `seg-${teamMode}`);
  });
  $('team-next').disabled = teamDate >= azTodayStr();

  try {
    if (teamMode === 'day') {
      const data = await api(`/api/manager/day?date=${teamDate}`);
      $('team-range').textContent = teamDate === azTodayStr() ? 'Today' : fmtDay(teamDate);
      renderTeamDay(data);
    } else {
      const data = await api(`/api/manager/week?start=${teamDate}`);
      $('team-range').textContent = `${fmtDay(data.start)} – ${fmtDay(data.end)}`;
      renderTeamWeek(data);
    }
  } catch (e) {
    $('team-grid').innerHTML = `<p class="empty">${escapeHtml(e.message)}</p>`;
  }
}

function renderTeamDay(data) {
  const rows = data.people.map(p => {
    const covered = coveredHours(p.shifts, data.date);
    const byHour = Object.fromEntries(p.hours.map(h => [h.hour, h.total]));
    const strip = SHIFT_HOURS.map(h => {
      const n = byHour[h] || 0;
      const on = covered.has(h);
      // Activity with no shift under it is worth a manager's eye; a quiet clocked
      // hour is not, so only the first gets called out. Someone with no punches at
      // all is a missing-data problem, not 15 separate missed hours — leave it plain.
      const cls = on ? 'on' : (n > 0 && p.shifts.length ? 'orphan' : 'off');
      return `<td class="cell ${cls}" title="${fmtHour(h)}">${n || ''}</td>`;
    }).join('');

    const total = Object.values(p.activity).reduce((a, b) => a + b, 0);
    return `
      <tr>
        <th class="who">${escapeHtml(p.person)}${p.openShift ? '<span class="warn" title="No clock-out">•</span>' : ''}</th>
        <td class="num">${p.minutes ? fmtMinutes(p.minutes) : '—'}</td>
        <td class="num">${total || '—'}</td>
        ${strip}
      </tr>`;
  }).join('');

  $('team-grid').innerHTML = `
    <table class="grid">
      <thead>
        <tr>
          <th class="who">Person</th><th class="num">Clocked</th><th class="num">Activity</th>
          ${SHIFT_HOURS.map(h => `<th class="cell">${h % 12 === 0 ? 12 : h % 12}</th>`).join('')}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  if (data.cachedAt) {
    const mins = Math.round((Date.now() - new Date(data.cachedAt).getTime()) / 60000);
    $('team-stamp').textContent = `Tracker activity updated ${mins < 1 ? 'just now' : `${mins} min ago`}`;
  }
}

function renderTeamWeek(data) {
  const rows = data.people.map(p => `
    <tr>
      <th class="who">${escapeHtml(p.person)}</th>
      ${p.cells.map(c => `
        <td class="cell ${c.minutes ? 'on' : 'off'}">
          ${c.minutes ? fmtMinutes(c.minutes) : '—'}
          <span class="sub">${c.activity || ''}</span>
          ${c.openShift ? '<span class="warn" title="No clock-out">•</span>' : ''}
        </td>`).join('')}
      <td class="num">${p.minutes ? fmtMinutes(p.minutes) : '—'}</td>
    </tr>`).join('');

  $('team-grid').innerHTML = `
    <table class="grid week">
      <thead>
        <tr>
          <th class="who">Person</th>
          ${data.dates.map(d => `<th class="cell">${fmtDay(d)}</th>`).join('')}
          <th class="num">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// ─── Boot ──────────────────────────────────────────────────────────────────

async function start() {
  $('tab-team').hidden = !me?.isManager;
  showView('day');
}

$('login-user').addEventListener('change', onUserPick);
$('login-pin').addEventListener('input', e => {
  e.target.value = e.target.value.replace(/\D/g, '');
  $('login-btn').disabled = e.target.value.length !== 4;
});
$('login-pin').addEventListener('keydown', e => { if (e.key === 'Enter' && !$('login-btn').disabled) doLogin(); });
$('login-btn').addEventListener('click', doLogin);

$('signout').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
  showLogin();
});

$('day-prev').addEventListener('click', () => { dayDate = shiftDate(dayDate, -1); loadDay(); });
$('day-next').addEventListener('click', () => {
  if (dayDate >= azTodayStr()) return;
  dayDate = shiftDate(dayDate, 1);
  loadDay();
});

$('team-prev').addEventListener('click', () => { teamDate = shiftDate(teamDate, teamMode === 'day' ? -1 : -7); loadTeam(); });
$('team-next').addEventListener('click', () => {
  if (teamDate >= azTodayStr()) return;
  teamDate = shiftDate(teamDate, teamMode === 'day' ? 1 : 7);
  loadTeam();
});
$('seg-day').addEventListener('click', () => { teamMode = 'day'; loadTeam(); });
$('seg-week').addEventListener('click', () => { teamMode = 'week'; loadTeam(); });

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
