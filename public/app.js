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
// Whose calendar the person screen is showing: null means mine, a name means a
// manager tapped them in the team list.
let viewing = null;

// The last payload each view rendered, so tapping an hour can show its detail
// without going back to the server.
let myDays = [];
let teamDay = null;

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
  // The shared manager account has no timesheet of its own, so it gets no tab bar.
  $('tabs').hidden = name === 'login' || !!me?.managerOnly;
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

// A week has to fit seven columns, so its rows stay tight and show counts. A single
// day has room to name each thing that happened, so its rows are tall enough to.
// 160px fits 9 events an hour. Measured against three days of real activity that
// names 82% of events outright and leaves a quarter of hours needing "+N more";
// the median hour has 6 events, the busiest seen had 20.
const HOUR_PX = 44;
const HOUR_PX_DAY = 160;
const PILL_PX = 15;

const EVENT_LABELS = {
  callsIn:        'Inbound',
  callsOut:       'Outbound',
  jobsCreated:    'Job Created',
  jobsDispatched: 'Dispatched',
  estSent:        'Estimate Sent',
  audits:         'Audit',
  invoices:       'Invoice'
};

const fmtClock = iso => new Date(iso)
  .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Phoenix' })
  .replace(':00', '').replace(' AM', 'am').replace(' PM', 'pm');

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

const OT_MINUTES = 8 * 60;

// Blue up to eight hours, yellow past it. Split at the exact minute the day crosses
// over, so the yellow part *is* the overtime rather than just a warning that some
// exists. Meal breaks are drawn but do not count toward the eight.
function blocksFor(shifts, date) {
  let paidSoFar = 0;
  return shifts
    .slice()
    .sort((a, b) => new Date(a.started_at) - new Date(b.started_at))
    .flatMap(s => {
      const b = blockOf(s, date);
      if (s.timesheet_code === 'Meal') return [{ ...b, kind: 'meal' }];

      const regular = Math.max(0, Math.min(b.height, OT_MINUTES - paidSoFar));
      const overtime = b.height - regular;
      paidSoFar += b.height;

      const parts = [];
      if (regular > 0) parts.push({ ...b, height: regular, kind: 'reg' });
      if (overtime > 0) parts.push({ ...b, top: b.top + regular, height: overtime, kind: 'ot' });
      return parts;
    });
}

// Paid minutes past the eight-hour mark, for the header line.
function overtimeOf(shifts) {
  const paid = shifts.reduce((n, s) => n + (s.timesheet_code === 'Meal' ? 0 : (s.minutes || 0)), 0);
  return Math.max(0, paid - OT_MINUTES);
}

// Each event sits at the minute it happened, pushed down only as far as it must be
// to clear the one above. A busy hour runs out of room — 20 calls will not fit in
// any honest hour — so the rest collapse into a "+N more" the hour detail opens.
//
// How many fit is decided first, from the row height, so three events late in the
// hour still all show: the stack slides up to fit rather than dropping its tail.
function pillsFor(hour, hourPx) {
  const band = hour.hour * hourPx;
  const limit = band + hourPx - 2;
  const capacity = Math.max(1, Math.floor((hourPx - 2) / (PILL_PX + 1)));

  const overflowing = hour.details.length > capacity;
  const shown = hour.details.slice(0, overflowing ? capacity - 1 : hour.details.length);

  // Forward: put each at its own minute, nudged down past the one above it.
  let next = band;
  const placed = shown.map(ev => {
    const top = Math.max(next, band + (new Date(ev.at).getUTCMinutes() / 60) * hourPx);
    next = top + PILL_PX + 1;
    return { ...ev, top };
  });

  // Backward: pull anything that ran past the bottom back inside, taking the ones
  // above it along. Events late in the hour compress instead of falling off.
  let ceiling = limit - PILL_PX;
  for (let i = placed.length - 1; i >= 0; i--) {
    placed[i].top = Math.min(placed[i].top, ceiling);
    ceiling = placed[i].top - PILL_PX - 1;
  }

  return {
    placed,
    more: hour.details.length - placed.length,
    moreTop: limit - PILL_PX
  };
}

// columns: [{ key, label, sub, date, shifts, hours, notes }]
function renderCalendar(el, columns, { editable = false, detailed = false } = {}) {
  const hourPx = detailed ? HOUR_PX_DAY : HOUR_PX;
  const axis = Array.from({ length: 24 }, (_, h) =>
    `<div class="tick" style="height:${hourPx}px">${fmtHour(h)}</div>`).join('');

  const cols = columns.map(col => {
    const byHour = Object.fromEntries((col.hours || []).map(h => [h.hour, h.total]));
    const covered = coveredHours(col.shifts || [], col.date);
    const notes = col.notes || {};

    const blocks = blocksFor(col.shifts || [], col.date).map(b => {
      const label = b.kind === 'ot' ? 'OT' : (b.code && b.code !== 'Working' ? b.code : '');
      return `<div class="blk ${b.kind}${b.open ? ' open' : ''}"
                   style="top:${b.top / 60 * hourPx}px;height:${b.height / 60 * hourPx}px">
                <span>${label}</span></div>`;
    }).join('');

    // One tappable cell per hour, over the blocks, carrying the activity count.
    const cells = Array.from({ length: 24 }, (_, h) => {
      const n = byHour[h] || 0;
      const on = covered.has(h);
      // Activity with no punch under it is worth a look, but only for someone who
      // punched at all that day — no punches is missing data, not 24 missed hours.
      const orphan = !on && n > 0 && (col.shifts || []).length > 0;
      return `<div class="cel${on ? ' on' : ''}${orphan ? ' orphan' : ''}" style="height:${hourPx}px"
                   data-col="${col.key}" data-hour="${h}">
                ${n && !detailed ? `<b>${n}</b>` : ''}${notes[h] ? '<i class="dot"></i>' : ''}
              </div>`;
    }).join('');

    // Named events, one pill each, only where there is room to read them.
    const pills = !detailed ? '' : (col.hours || []).filter(h => h.total).map(h => {
      const { placed, more, moreTop } = pillsFor(h, hourPx);
      return placed.map(ev => `
        <div class="pill ${ev.kind}" style="top:${ev.top}px"
             title="${escapeHtml(ev.label || '')}">
          <b>${EVENT_LABELS[ev.kind] || ev.kind}</b>, ${fmtClock(ev.at)}${ev.label ? ` · ${escapeHtml(ev.label)}` : ''}
        </div>`).join('')
        + (more ? `<div class="pill more" style="top:${moreTop}px">+${more} more</div>` : '');
    }).join('');

    return `<div class="col">
              <div class="colhead">${escapeHtml(col.label)}${col.sub ? `<span>${escapeHtml(col.sub)}</span>` : ''}</div>
              <div class="colbody" style="height:${24 * hourPx}px">${blocks}${cells}${pills}</div>
            </div>`;
  }).join('');

  el.innerHTML = `<div class="cal${editable ? ' editable' : ''}${detailed ? ' detailed' : ''}">
                    <div class="gutter"><div class="colhead"></div>${axis}</div>
                    <div class="cols">${cols}</div>
                  </div>`;

  // Open on the working day rather than on midnight.
  const first = columns.flatMap(c => (c.shifts || []).map(s => azMinutes(s.started_at)));
  const scroller = el.querySelector('.cal');
  if (scroller) scroller.scrollTop = Math.max(0, (first.length ? Math.min(...first) : 420) / 60 * hourPx - hourPx);
}

// ─── My Calendar ───────────────────────────────────────────────────────────

// viewing === null means me; otherwise a name a manager tapped in the team list.
async function loadDay() {
  const mine = !viewing;
  $('day-who').textContent = mine ? (me?.name || '') : viewing;
  $('day-back').hidden = mine;
  $('signout').hidden = !mine;
  $('day-next').disabled = dayDate >= azTodayStr();
  $('day-cal').innerHTML = '<p class="empty">Loading…</p>';
  $('day-hours').innerHTML = '';
  $('day-stamp').textContent = '';
  document.querySelectorAll('#day .seg button').forEach(b => {
    b.classList.toggle('active', b.id === `mine-${mineMode}`);
  });

  const who = mine ? '' : `&person=${encodeURIComponent(viewing)}`;
  try {
    if (mineMode === 'day') {
      const d = mine
        ? await api(`/api/time/day?date=${dayDate}`)
        : await api(`/api/manager/person-day?date=${dayDate}${who}`);
      $('day-date').textContent = dayDate === azTodayStr() ? 'Today' : fmtDay(dayDate);
      $('day-total').innerHTML = totalLine(d.minutes, overtimeOf(d.shifts), 'clocked');
      myDays = [d];
      renderCalendar($('day-cal'), [{
        key: d.date, label: fmtDay(d.date), date: d.date,
        shifts: d.shifts, hours: d.activity.hours, notes: d.notes
      }], { editable: mine, detailed: true });
      renderBreakdown(d, mine);
      stamp('day-stamp', d.activity.cachedAt);
    } else {
      const w = mine
        ? await api(`/api/time/week?start=${dayDate}`)
        : await api(`/api/manager/person-week?start=${dayDate}${who}`);
      $('day-date').textContent = `${fmtDay(w.start)} – ${fmtDay(w.end)}`;
      const weekOt = w.days.reduce((n, d) => n + overtimeOf(d.shifts), 0);
      $('day-total').innerHTML = totalLine(w.minutes, weekOt, 'clocked this week');
      myDays = w.days;
      renderCalendar($('day-cal'), w.days.map(d => ({
        key: d.date, label: fmtDay(d.date).split(' ')[0], sub: d.date.slice(5).replace('-', '/'),
        date: d.date, shifts: d.shifts, hours: d.activity.hours, notes: d.notes
      })), { editable: mine });
      renderWeekBreakdown(w, mine);
      stamp('day-stamp', w.days[0]?.activity.cachedAt);
    }
  } catch (e) {
    $('day-cal').innerHTML = `<p class="empty">${escapeHtml(e.message)}</p>`;
  }
}

const totalLine = (minutes, ot, label) =>
  (minutes ? `${fmtMinutes(minutes)} ${label}` : 'No ServiceTitan clock-in') +
  (ot > 0 ? ` <span class="ot-tag">${fmtMinutes(ot)} overtime</span>` : '');

// The hour-by-hour list under the calendar: what the tracker saw, and the note.
function renderBreakdown(day, editable) {
  const covered = coveredHours(day.shifts, day.date);
  const rows = day.activity.hours.filter(h => covered.has(h.hour) || h.total > 0 || day.notes[h.hour]);
  $('day-hours').innerHTML = rows.length
    ? rows.map(h => hourRow(h, covered.has(h.hour), day.notes[h.hour], day.date, editable)).join('')
    : '<p class="empty">Nothing recorded for this day.</p>';
}

function renderWeekBreakdown(week, editable) {
  const days = week.days.filter(d => d.shifts.length || d.activity.hours.some(h => h.total));
  $('day-hours').innerHTML = days.length
    ? days.map(d => {
        const covered = coveredHours(d.shifts, d.date);
        const rows = d.activity.hours.filter(h => covered.has(h.hour) || h.total > 0 || d.notes[h.hour]);
        const ot = overtimeOf(d.shifts);
        return `<div class="dayblock">
                  <h4>${fmtDay(d.date)}<span>${fmtMinutes(d.minutes)}${ot > 0 ? ` · <b class="ot-tag">${fmtMinutes(ot)} OT</b>` : ''}</span></h4>
                  ${rows.map(h => hourRow(h, covered.has(h.hour), d.notes[h.hour], d.date, editable)).join('')}
                </div>`;
      }).join('')
    : '<p class="empty">Nothing recorded this week.</p>';
}

function hourRow(h, clockedIn, note, date, editable) {
  const chips = Object.entries(h.metrics || {})
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `<span class="chip"><b>${n}</b> ${METRIC_LABELS[k]}</span>`)
    .join('');

  return `
    <div class="hour${clockedIn ? '' : ' outside'}${editable ? ' tappable' : ''}"
         data-date="${date}" data-hour="${h.hour}">
      <div class="h">${fmtHour(h.hour)}</div>
      <div class="body">
        ${clockedIn ? '' : '<div class="tag">Not clocked in</div>'}
        ${chips ? `<div class="chips">${chips}</div>` : '<div class="quiet">No tracked activity this hour.</div>'}
        ${note ? `<div class="note">${escapeHtml(note)}</div>`
               : (editable ? '<div class="add">+ add what you did</div>' : '')}
      </div>
    </div>`;
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

  // Every event in the hour, so the calendar's "+N more" has somewhere to lead.
  const events = (h?.details || []).map(ev => `
    <div class="ev">
      <span class="t">${fmtClock(ev.at)}</span>
      <span class="k">${EVENT_LABELS[ev.kind] || ev.kind}</span>
      <span class="l">${escapeHtml(ev.label || '')}</span>
    </div>`).join('');

  $('hour-title').textContent = `${fmtHour(hour)} · ${fmtDay(date)}`;
  $('hour-detail').innerHTML =
    (person ? `<div class="who">${escapeHtml(person)}</div>` : '') +
    (chips ? `<div class="chips">${chips}</div>` : '') +
    (events || (chips ? '' : '<div class="quiet">No tracked activity this hour.</div>')) +
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

// The team screen is a list you tap into, not a wall of columns.
async function loadTeam() {
  $('team-list').innerHTML = '<p class="empty">Loading…</p>';
  $('team-stamp').textContent = '';
  renderSyncBanner();
  $('team-next').disabled = teamDate >= azTodayStr();

  try {
    const data = await api(`/api/manager/day?date=${teamDate}`);
    $('team-range').textContent = teamDate === azTodayStr() ? 'Today' : fmtDay(teamDate);
    teamDay = data;

    // Everyone on the list shows, including people with no hours — that is the part
    // that says who was off.
    $('team-list').innerHTML = data.people.length
      ? data.people.map(p => {
          const ot = overtimeOf(p.shifts);
          const acts = Object.values(p.activity).reduce((a, b) => a + b, 0);
          return `
            <button class="person" data-person="${escapeHtml(p.person)}">
              <span class="nm">${escapeHtml(p.person)}${p.role ? `<i>${escapeHtml(p.role)}</i>` : ''}</span>
              <span class="hrs">
                ${p.minutes ? fmtMinutes(p.minutes) : '<em>off</em>'}
                ${ot > 0 ? `<b class="ot-tag">+${fmtMinutes(ot)} OT</b>` : ''}
                ${p.openShift ? '<b class="warn" title="No clock-out">•</b>' : ''}
              </span>
              <span class="act">${acts || ''}</span>
              <span class="chev">›</span>
            </button>`;
        }).join('')
      : '<p class="empty">Nobody clocked in on this day.</p>';

    stamp('team-stamp', data.cachedAt);
  } catch (e) {
    $('team-list').innerHTML = `<p class="empty">${escapeHtml(e.message)}</p>`;
  }
}

// Tapping a person opens their calendar; the tab bar and back button return here.
function openPerson(name) {
  viewing = name;
  dayDate = teamDate;
  showView('day');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// ─── Boot ──────────────────────────────────────────────────────────────────

async function start() {
  $('tab-team').hidden = !me?.isManager;
  // A manager opens on the team, not on their own timesheet.
  viewing = null;
  showView(me?.isManager ? 'team' : 'day');
}

$('login-user').addEventListener('change', onUserPick);
$('login-pin').addEventListener('input', e => {
  e.target.value = e.target.value.replace(/\D/g, '');
  $('login-btn').disabled = e.target.value.length !== 4;
});
$('login-pin').addEventListener('keydown', e => { if (e.key === 'Enter' && !$('login-btn').disabled) doLogin(); });
$('login-btn').addEventListener('click', doLogin);

async function signOut() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
  showLogin();
}
$('signout').addEventListener('click', signOut);
$('team-signout').addEventListener('click', signOut);

$('day-prev').addEventListener('click', () => { dayDate = shiftDate(dayDate, mineMode === 'day' ? -1 : -7); loadDay(); });
$('day-next').addEventListener('click', () => {
  if (dayDate >= azTodayStr()) return;
  dayDate = shiftDate(dayDate, mineMode === 'day' ? 1 : 7);
  loadDay();
});
$('mine-day').addEventListener('click', () => { mineMode = 'day'; loadDay(); });
$('mine-week').addEventListener('click', () => { mineMode = 'week'; loadDay(); });

$('team-prev').addEventListener('click', () => { teamDate = shiftDate(teamDate, -1); loadTeam(); });
$('team-next').addEventListener('click', () => {
  if (teamDate >= azTodayStr()) return;
  teamDate = shiftDate(teamDate, 1);
  loadTeam();
});
$('team-list').addEventListener('click', e => {
  const row = e.target.closest('.person');
  if (row) openPerson(row.dataset.person);
});
$('day-back').addEventListener('click', () => { viewing = null; showView('team'); });

// One listener per screen rather than per element — both redraw constantly.
$('day-cal').addEventListener('click', e => {
  const cel = e.target.closest('.cel');
  if (!cel) return;
  const day = myDays.find(d => d.date === cel.dataset.col);
  if (day) openHourModal({ date: day.date, hour: Number(cel.dataset.hour), day, editable: !viewing, person: viewing });
});

$('day-hours').addEventListener('click', e => {
  const row = e.target.closest('.hour');
  if (!row) return;
  const day = myDays.find(d => d.date === row.dataset.date);
  if (day) openHourModal({ date: day.date, hour: Number(row.dataset.hour), day, editable: !viewing, person: viewing });
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
