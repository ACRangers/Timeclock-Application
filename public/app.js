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
let mineMode = 'day';
let teamDate = azTodayStr();
let teamMode = 'day';
let teamPerson = null;

// The last payload each view rendered, so tapping an hour can show its detail
// without going back to the server.
let myDays = [];
let teamDay = null;
let teamWeek = null;

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

// ─── Calendar ──────────────────────────────────────────────────────────────
//
// Day, week, and the team coverage board are the same thing drawn three ways: a
// 24-hour axis with a set of columns beside it. A column is one date or one person.

const HOUR_PX = 44;

// Minutes from midnight, Arizona, for positioning a block on the axis.
const azMinutes = iso => {
  const d = new Date(iso);
  return ((d.getUTCHours() - 7 + 24) % 24) * 60 + d.getUTCMinutes();
};

// A punch always belongs to one day — ServiceTitan auto-closes at midnight — so a
// block only ever needs clamping at the end, never splitting across columns.
function blockOf(shift, date) {
  const top = azMinutes(shift.started_at);
  let end;
  if (shift.ended_at) {
    end = azDateOf(shift.ended_at) === date ? azMinutes(shift.ended_at) : 1440;
    if (end <= top) end = 1440;                       // ends exactly at midnight
  } else {
    end = date === azTodayStr() ? azMinutes(new Date().toISOString()) : top + 30;
  }
  return { top, height: Math.max(end - top, 18), open: !shift.ended_at, code: shift.timesheet_code };
}

// columns: [{ key, label, sub, date, shifts, hours, notes }]
function renderCalendar(el, columns, { editable = false } = {}) {
  const axis = Array.from({ length: 24 }, (_, h) =>
    `<div class="tick" style="height:${HOUR_PX}px">${fmtHour(h)}</div>`).join('');

  const cols = columns.map(col => {
    const byHour = Object.fromEntries((col.hours || []).map(h => [h.hour, h.total]));
    const covered = coveredHours(col.shifts || [], col.date);
    const notes = col.notes || {};

    const blocks = (col.shifts || []).map(s => {
      const b = blockOf(s, col.date);
      const label = b.code && b.code !== 'Working' ? b.code : '';
      return `<div class="blk${b.open ? ' open' : ''}${b.code === 'Meal' ? ' meal' : ''}"
                   style="top:${b.top / 60 * HOUR_PX}px;height:${b.height / 60 * HOUR_PX}px">
                <span>${label}</span></div>`;
    }).join('');

    // One tappable cell per hour, over the blocks, carrying the activity count.
    const cells = Array.from({ length: 24 }, (_, h) => {
      const n = byHour[h] || 0;
      const on = covered.has(h);
      // Activity with no punch under it is worth a look, but only for someone who
      // punched at all that day — no punches is missing data, not 24 missed hours.
      const orphan = !on && n > 0 && (col.shifts || []).length > 0;
      return `<div class="cel${on ? ' on' : ''}${orphan ? ' orphan' : ''}" style="height:${HOUR_PX}px"
                   data-col="${col.key}" data-hour="${h}">
                ${n ? `<b>${n}</b>` : ''}${notes[h] ? '<i class="dot"></i>' : ''}
              </div>`;
    }).join('');

    return `<div class="col">
              <div class="colhead">${escapeHtml(col.label)}${col.sub ? `<span>${escapeHtml(col.sub)}</span>` : ''}</div>
              <div class="colbody" style="height:${24 * HOUR_PX}px">${blocks}${cells}</div>
            </div>`;
  }).join('');

  el.innerHTML = `<div class="cal${editable ? ' editable' : ''}">
                    <div class="gutter"><div class="colhead"></div>${axis}</div>
                    <div class="cols">${cols}</div>
                  </div>`;

  // Open on the working day rather than on midnight.
  const first = columns.flatMap(c => (c.shifts || []).map(s => azMinutes(s.started_at)));
  const scroller = el.querySelector('.cal');
  if (scroller) scroller.scrollTop = Math.max(0, (first.length ? Math.min(...first) : 420) / 60 * HOUR_PX - HOUR_PX);
}

// ─── My Calendar ───────────────────────────────────────────────────────────

async function loadDay() {
  $('day-who').textContent = me?.name || '';
  $('day-next').disabled = dayDate >= azTodayStr();
  $('day-cal').innerHTML = '<p class="empty">Loading…</p>';
  $('day-stamp').textContent = '';
  document.querySelectorAll('#day .seg button').forEach(b => {
    b.classList.toggle('active', b.id === `mine-${mineMode}`);
  });

  try {
    if (mineMode === 'day') {
      const d = await api(`/api/time/day?date=${dayDate}`);
      $('day-date').textContent = dayDate === azTodayStr() ? 'Today' : fmtDay(dayDate);
      $('day-total').textContent = d.minutes ? `${fmtMinutes(d.minutes)} clocked` : 'No ServiceTitan clock-in for this day';
      myDays = [d];
      renderCalendar($('day-cal'), [{
        key: d.date, label: fmtDay(d.date), date: d.date,
        shifts: d.shifts, hours: d.activity.hours, notes: d.notes
      }], { editable: true });
      stamp('day-stamp', d.activity.cachedAt);
    } else {
      const w = await api(`/api/time/week?start=${dayDate}`);
      $('day-date').textContent = `${fmtDay(w.start)} – ${fmtDay(w.end)}`;
      $('day-total').textContent = `${fmtMinutes(w.minutes)} clocked this week`;
      myDays = w.days;
      renderCalendar($('day-cal'), w.days.map(d => ({
        key: d.date, label: fmtDay(d.date).split(' ')[0], sub: d.date.slice(5).replace('-', '/'),
        date: d.date, shifts: d.shifts, hours: d.activity.hours, notes: d.notes
      })), { editable: true });
      stamp('day-stamp', w.days[0]?.activity.cachedAt);
    }
  } catch (e) {
    $('day-cal').innerHTML = `<p class="empty">${escapeHtml(e.message)}</p>`;
  }
}

function stamp(id, cachedAt) {
  if (!cachedAt) return;
  const mins = Math.round((Date.now() - new Date(cachedAt).getTime()) / 60000);
  $(id).textContent = `Tracker activity updated ${mins < 1 ? 'just now' : `${mins} min ago`}`;
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

// ─── Hour detail ───────────────────────────────────────────────────────────

let openHour = null;

function chipsFor(hour) {
  return Object.entries(hour?.metrics || {})
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `<span class="chip"><b>${n}</b> ${METRIC_LABELS[k]}</span>`)
    .join('');
}

function openHourModal({ date, hour, day, editable, person }) {
  const h = day.activity.hours[hour];
  const chips = chipsFor(h);
  openHour = editable ? { date, hour } : null;

  $('hour-title').textContent = `${fmtHour(hour)} · ${fmtDay(date)}`;
  $('hour-detail').innerHTML =
    (person ? `<div class="who">${escapeHtml(person)}</div>` : '') +
    (chips ? `<div class="chips">${chips}</div>`
           : '<div class="quiet">No tracked activity this hour.</div>') +
    (day.notes?.[hour] && !editable ? `<div class="note">${escapeHtml(day.notes[hour])}</div>` : '');

  const note = day.notes?.[hour] || '';
  $('hour-note').value = note;
  // Managers read notes; the person whose hour it is writes them.
  $('hour-note').hidden = $('hour-note-label').hidden = !editable;
  $('hour-save').hidden = !editable;
  $('hour-delete').hidden = !editable || !note;
  $('hour-error').hidden = true;
  $('hour-modal').hidden = false;
  if (editable) $('hour-note').focus();
}

async function saveNote() {
  if (!openHour) return;
  const note = $('hour-note').value.trim();
  $('hour-save').disabled = true;
  try {
    if (!note) {
      $('hour-error').textContent = 'Write something, or press Delete to clear it.';
      $('hour-error').hidden = false;
      return;
    }
    await api('/api/time/notes', { method: 'PUT', body: JSON.stringify({ ...openHour, note }) });
    $('hour-modal').hidden = true;
    loadDay();
  } catch (e) {
    $('hour-error').textContent = e.message;
    $('hour-error').hidden = false;
  } finally {
    $('hour-save').disabled = false;
  }
}

async function deleteNote() {
  if (!openHour) return;
  try {
    await api('/api/time/notes', { method: 'DELETE', body: JSON.stringify(openHour) });
    $('hour-modal').hidden = true;
    loadDay();
  } catch (e) {
    $('hour-error').textContent = e.message;
    $('hour-error').hidden = false;
  }
}

// ─── Team ──────────────────────────────────────────────────────────────────

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
  $('team-cal').innerHTML = '<p class="empty">Loading…</p>';
  $('team-stamp').textContent = '';
  renderSyncBanner();
  document.querySelectorAll('#team .seg button').forEach(b => {
    b.classList.toggle('active', b.id === `seg-${teamMode}`);
  });
  $('team-next').disabled = teamDate >= azTodayStr();
  $('team-picker').hidden = teamMode !== 'week';

  try {
    if (teamMode === 'day') {
      const data = await api(`/api/manager/day?date=${teamDate}`);
      $('team-range').textContent = teamDate === azTodayStr() ? 'Today' : fmtDay(teamDate);
      teamDay = data;
      // Only people with something that day — 25 empty columns is not a coverage board.
      const shown = data.people.filter(p => p.shifts.length || p.hours.some(h => h.total));
      renderCalendar($('team-cal'), shown.map(p => ({
        key: p.person,
        label: p.person.split(' ')[0],
        sub: p.minutes ? fmtMinutes(p.minutes) : '—',
        date: data.date,
        shifts: p.shifts,
        hours: p.hours,
        notes: p.notes
      })));
      stamp('team-stamp', data.cachedAt);
    } else {
      const data = await api(`/api/manager/person-week?start=${teamDate}&person=${encodeURIComponent(teamPerson || '')}`);
      teamPerson = data.person;
      teamWeek = data;
      $('team-range').textContent = `${fmtDay(data.start)} – ${fmtDay(data.end)}`;
      $('team-person').innerHTML = data.team
        .map(n => `<option${n === data.person ? ' selected' : ''}>${escapeHtml(n)}</option>`).join('');
      renderCalendar($('team-cal'), data.days.map(d => ({
        key: d.date, label: fmtDay(d.date).split(' ')[0], sub: d.date.slice(5).replace('-', '/'),
        date: d.date, shifts: d.shifts, hours: d.activity.hours, notes: d.notes
      })));
      stamp('team-stamp', data.days[0]?.activity.cachedAt);
    }
  } catch (e) {
    $('team-cal').innerHTML = `<p class="empty">${escapeHtml(e.message)}</p>`;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// ─── Boot ──────────────────────────────────────────────────────────────────

async function start() {
  $('tab-team').hidden = !me?.isManager;
  // A manager opens on the team, not on their own timesheet.
  showView(me?.isManager ? 'team' : 'day');
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

$('day-prev').addEventListener('click', () => { dayDate = shiftDate(dayDate, mineMode === 'day' ? -1 : -7); loadDay(); });
$('day-next').addEventListener('click', () => {
  if (dayDate >= azTodayStr()) return;
  dayDate = shiftDate(dayDate, mineMode === 'day' ? 1 : 7);
  loadDay();
});
$('mine-day').addEventListener('click', () => { mineMode = 'day'; loadDay(); });
$('mine-week').addEventListener('click', () => { mineMode = 'week'; loadDay(); });

$('team-prev').addEventListener('click', () => { teamDate = shiftDate(teamDate, teamMode === 'day' ? -1 : -7); loadTeam(); });
$('team-next').addEventListener('click', () => {
  if (teamDate >= azTodayStr()) return;
  teamDate = shiftDate(teamDate, teamMode === 'day' ? 1 : 7);
  loadTeam();
});
$('seg-day').addEventListener('click', () => { teamMode = 'day'; loadTeam(); });
$('seg-week').addEventListener('click', () => { teamMode = 'week'; loadTeam(); });
$('team-person').addEventListener('change', e => { teamPerson = e.target.value; loadTeam(); });

// One listener per screen rather than per cell — the calendar redraws constantly.
$('day-cal').addEventListener('click', e => {
  const cel = e.target.closest('.cel');
  if (!cel) return;
  const day = myDays.find(d => d.date === cel.dataset.col);
  if (day) openHourModal({ date: day.date, hour: Number(cel.dataset.hour), day, editable: true });
});

$('team-cal').addEventListener('click', e => {
  const cel = e.target.closest('.cel');
  if (!cel) return;
  if (teamMode === 'day') {
    const p = teamDay?.people.find(x => x.person === cel.dataset.col);
    // The coverage board carries hour totals, not per-metric detail.
    if (p) openHourModal({
      date: teamDay.date, hour: Number(cel.dataset.hour), person: p.person, editable: false,
      day: { notes: p.notes, activity: { hours: p.hours.map(h => ({ ...h, metrics: null })) } }
    });
  } else {
    const day = teamWeek?.days.find(d => d.date === cel.dataset.col);
    if (day) openHourModal({ date: day.date, hour: Number(cel.dataset.hour), day, editable: false, person: teamWeek.person });
  }
});

$('hour-cancel').addEventListener('click', () => { $('hour-modal').hidden = true; });
$('hour-save').addEventListener('click', saveNote);
$('hour-delete').addEventListener('click', deleteNote);

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
