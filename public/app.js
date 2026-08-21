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
  invoices:       'invoices',
  warranty:       'warranty'
};
const METRIC_ORDER = Object.keys(METRIC_LABELS);

let me = null;
let dayDate = azTodayStr();
let mineMode = 'day';
let weekDay = null;          // which day the week view's Day Report is showing
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

// Outbound calls are worth half a point, so totals land on .5 often enough to matter.
const fmtPoints = n => (Number.isInteger(n) ? n : n.toFixed(1));

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
}

// ─── Sign in ───────────────────────────────────────────────────────────────

async function doLogin() {
  const username = $('login-user').value.trim();
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
    $('login-pin').value = '';
    readyToSignIn();
    $('login-pin').focus();
  }
}

// ─── Calendar ──────────────────────────────────────────────────────────────
//
// Day, week, and the team coverage board are the same thing drawn three ways: a
// 24-hour axis with a set of columns beside it. A column is one date or one person.

// A week has to fit seven columns, so its rows stay tight and show counts. A single
// day has room to name each thing that happened, so its rows are tall enough to.
// Each hour is twelve rows of five minutes; events in the same five minutes sit side
// by side. Stacking them down the hour instead made a burst of four calls at 1:38 look
// like work spread across the hour, which is the opposite of what happened.
//
// Measured over three days: a five-minute slot holds 1 event at the median, 2 at the
// 90th, 6 at the very most — so columns can show every one and nothing is hidden.
const HOUR_PX = 44;
const SLOTS_PER_HOUR = 12;
const PILL_PX = 17;
const HOUR_PX_DAY = SLOTS_PER_HOUR * PILL_PX;

const EVENT_LABELS = {
  callsIn:        'Inbound',
  callsOut:       'Outbound',
  jobsCreated:    'Job Created',
  jobsDispatched: 'Dispatched',
  estSent:        'Estimate Sent',
  audits:         'Audit',
  invoices:       'Invoice',
  warranty:       'Warranty'
};

function fmtDur(hms) {
  const m = /^(\d+):(\d+):(\d+)/.exec(hms || '');
  if (!m) return '';
  const secs = +m[1] * 3600 + +m[2] * 60 + +m[3];
  if (!secs) return '';
  return secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
}

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
const UNPAID = new Set(['Meal']);

function punchMinutes(s, date) {
  if (s.minutes != null) return s.minutes;
  const on = date || s._date;
  if (!s.started_at || on !== azTodayStr()) return 0;
  return Math.max(0, Math.round((Date.now() - new Date(s.started_at)) / 60000));
}

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
function overtimeOf(shifts, date) {
  const paid = shifts.reduce((n, s) => n + (UNPAID.has(s.timesheet_code) ? 0 : punchMinutes(s, date)), 0);
  return Math.max(0, paid - OT_MINUTES);
}

// What the clocked total is actually made of. Overtime is part of the paid time,
// not another slice of it, so it is worded to say so rather than added alongside.
function splitLine(shifts, date, ot) {
  const by = new Map();
  shifts.forEach(s => {
    const code = s.timesheet_code || 'Other';
    by.set(code, (by.get(code) || 0) + punchMinutes(s, date));
  });
  if (!by.size) return '';

  const chips = [...by.entries()]
    .sort((x, y) => y[1] - x[1])
    .filter(([, mins]) => mins > 0)
    .map(([code, mins]) => `<span class="codechip${UNPAID.has(code) ? ' unpaid' : ''}">${
      escapeHtml(code)} <b>${fmtMinutes(mins)}</b>${UNPAID.has(code) ? ' unpaid' : ''}</span>`);

  if (ot > 0) chips.push(`<span class="codechip ot">of that <b>${fmtMinutes(ot)}</b> overtime</span>`);
  return chips.join('');
}

// The row says when, to the nearest five minutes; the columns say how much happened
// in those five minutes. Four calls in one slot read as four abreast, not as four
// stacked down an hour they did not occupy.
function pillsFor(hour, hourPx) {
  const band = hour.hour * hourPx;
  const rowPx = hourPx / SLOTS_PER_HOUR;

  const slots = Array.from({ length: SLOTS_PER_HOUR }, () => []);
  hour.details.forEach(ev => {
    const slot = Math.min(SLOTS_PER_HOUR - 1, Math.floor(new Date(ev.at).getUTCMinutes() / (60 / SLOTS_PER_HOUR)));
    slots[slot].push(ev);
  });

  return slots.flatMap((events, row) => events.map((ev, i) => ({
    ...ev,
    top: band + row * rowPx,
    left: (i / events.length) * 100,
    width: 100 / events.length
  })));
}

// columns: [{ key, label, sub, date, shifts, hours, notes }]
function renderCalendar(el, columns, { editable = false, detailed = false } = {}) {
  const hourPx = detailed ? HOUR_PX_DAY : HOUR_PX;
  const axis = Array.from({ length: 24 }, (_, h) =>
    `<div class="tick" style="height:${hourPx}px">${fmtHour(h)}</div>`).join('');

  const cols = columns.map(col => {
    const byHour = Object.fromEntries((col.hours || []).map(h => [h.hour, h.total]));
    const covered = coveredHours(col.shifts || [], col.date);
    const notes = col.notes || [];

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
                ${n && !detailed ? `<b>${n}</b>` : ''}${notesInHour(notes, h).length && !detailed ? '<i class="dot"></i>' : ''}
              </div>`;
    }).join('');

    // Named events, laid out in their ten-minute row. The lane keeps them clear of
    // the shift spine, so the percentages are of the space actually available.
    // Tasks join the hour they start in, then everything lays out together.
    const tasks = detailed ? (notes || []) : [];
    const taskBlocks = tasks.length ? `<div class="tasklane">${
      packColumns(tasks).map(({ n, col: c, of }) => `
        <div class="taskblk ${n.category || 'other'}" data-note="${n.id}"
             style="top:${n.start_min / 60 * hourPx}px;height:${Math.max((n.end_min - n.start_min) / 60 * hourPx - 2, 16)}px;
                    left:${(c / of) * 100}%;width:${100 / of}%"
             title="${evText(taskEvent(n, col.date), true)}">
          ${evText(taskEvent(n, col.date))}
        </div>`).join('')
    }</div>` : '';

    // The activity lane gives up room only when there is something to give it to.
    const pills = !detailed ? '' : `<div class="lane"${tasks.length ? ' style="left:38%"' : ''}>${
      (col.hours || []).filter(h => h.total).flatMap(h => pillsFor(h, hourPx)).map(ev => `
        <div class="pill ${ev.kind}"
             style="top:${ev.top}px;left:${ev.left}%;width:${ev.width}%"
             title="${evText(ev, true)}">
          ${evText(ev)}
        </div>`).join('')
    }</div>`;

    return `<div class="col">
              <div class="colhead">${escapeHtml(col.label)}${col.sub ? `<span>${escapeHtml(col.sub)}</span>` : ''}</div>
              <div class="colbody" style="height:${24 * hourPx}px">${blocks}${cells}${taskBlocks}${pills}</div>
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
  $('day-resetpin').hidden = mine || !me?.isManager;
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
      $('day-total').innerHTML = totalLine(d.minutes, 'clocked', d.activity.points);
      $('day-split').innerHTML = splitLine(d.shifts, d.date, overtimeOf(d.shifts, d.date));
      myDays = [d];
      renderCalendar($('day-cal'), [{
        key: d.date, label: fmtDay(d.date), date: d.date,
        shifts: d.shifts, hours: d.activity.hours, notes: d.notes
      }], { editable: mine, detailed: true });
      renderBreakdown(d, mine);
      $('week-summary').hidden = true;
      $('day-picker').hidden = true;
      stamp('day-stamp', d.activity.cachedAt);
    } else {
      const w = mine
        ? await api(`/api/time/week?start=${dayDate}`)
        : await api(`/api/manager/person-week?start=${dayDate}${who}`);
      $('day-date').textContent = `${fmtDay(w.start)} – ${fmtDay(w.end)}`;
      // Overtime is per day — eight hours is a daily line, not a weekly one.
      const weekOt = w.days.reduce((n, d) => n + overtimeOf(d.shifts, d.date), 0);
      const weekPts = w.days.reduce((n, d) => n + d.activity.points, 0);
      $('day-total').innerHTML = totalLine(w.minutes, 'clocked this week', weekPts);
      $('day-split').innerHTML = splitLine(
        w.days.flatMap(d => d.shifts.map(s => ({ ...s, _date: d.date }))),
        null, weekOt);
      myDays = w.days;
      renderCalendar($('day-cal'), w.days.map(d => ({
        key: d.date, label: fmtDay(d.date).split(' ')[0], sub: d.date.slice(5).replace('-', '/'),
        date: d.date, shifts: d.shifts, hours: d.activity.hours, notes: d.notes
      })), { editable: mine });
      renderWeekBreakdown(w, mine);
      renderWeekSummary(w);
      $('week-summary').hidden = false;
      stamp('day-stamp', w.days[0]?.activity.cachedAt);
    }
  } catch (e) {
    $('day-cal').innerHTML = `<p class="empty">${escapeHtml(e.message)}</p>`;
  }
}

const totalLine = (minutes, label, points) =>
  (minutes ? `${fmtMinutes(minutes)} ${label}` : 'No ServiceTitan clock-in') +
  (points ? ` <span class="pts-tag">${fmtPoints(points)} points</span>` : '');

// The hour-by-hour list under the calendar: what the tracker saw, and the note.
function renderBreakdown(day, editable) {
  const covered = coveredHours(day.shifts, day.date);
  const rows = day.activity.hours.filter(h => covered.has(h.hour) || h.total > 0 || notesInHour(day.notes, h.hour).length);
  $('day-hours').innerHTML = rows.length
    ? rows.map(h => hourRow(h, covered.has(h.hour), notesInHour(day.notes, h.hour), day.date, editable)).join('')
    : '<p class="empty">Nothing recorded for this day.</p>';
}

const chipsOf = metrics => Object.entries(metrics || {})
  .filter(([, n]) => n > 0)
  .map(([k, n]) => `<span class="chip"><b>${n}</b> ${METRIC_LABELS[k]}</span>`)
  .join('');

// One day at a time, chosen from the Sun–Sat strip. Seven days stacked meant
// scrolling past Monday to reach Thursday.
function renderWeekBreakdown(week, editable) {
  const worked = d => d.shifts.length || d.activity.hours.some(h => h.total);
  if (!week.days.some(d => d.date === weekDay)) {
    weekDay = (week.days.find(d => d.date === azTodayStr()) && azTodayStr())
      || week.days.filter(worked).pop()?.date
      || week.days[0].date;
  }

  $('day-picker').hidden = false;
  $('day-picker').innerHTML = week.days.map(d => `
    <button class="${d.date === weekDay ? 'on' : ''}${worked(d) ? '' : ' bare'}" data-date="${d.date}">
      ${fmtDay(d.date).split(',')[0]}<i>${Number(d.date.slice(8))}</i>
    </button>`).join('');

  const d = week.days.find(x => x.date === weekDay);
  const covered = coveredHours(d.shifts, d.date);
  const rows = d.activity.hours.filter(h => covered.has(h.hour) || h.total > 0 || notesInHour(d.notes, h.hour).length);
  const ot = overtimeOf(d.shifts, d.date);

  $('day-hours').innerHTML = `
    <div class="dayhead">
      <h4>${fmtDay(d.date)}</h4>
      <span class="mins">${d.minutes ? fmtMinutes(d.minutes) : 'no clock-in'}${
        ot > 0 ? ` <b class="ot-tag">${fmtMinutes(ot)} OT</b>` : ''}${
        d.activity.points ? ` <b class="pts-tag">${fmtPoints(d.activity.points)} pts</b>` : ''}</span>
      <div class="chips">${chipsOf(d.activity.totals)}</div>
    </div>
    ${rows.length
      ? rows.map(h => hourRow(h, covered.has(h.hour), notesInHour(d.notes, h.hour), d.date, editable, true)).join('')
      : '<p class="empty">Nothing recorded on this day.</p>'}`;
}

function renderWeekSummary(week) {
  const totals = {};
  METRIC_ORDER.forEach(k => { totals[k] = week.days.reduce((n, d) => n + (d.activity.totals[k] || 0), 0); });
  const ot = week.days.reduce((n, d) => n + overtimeOf(d.shifts, d.date), 0);
  const pts = week.days.reduce((n, d) => n + d.activity.points, 0);
  const worked = week.days.filter(d => d.minutes).length;

  $('week-summary-body').innerHTML = `
    <div class="sumline">
      <b>${fmtMinutes(week.minutes)}</b> over ${worked} day${worked === 1 ? '' : 's'}
      ${ot > 0 ? `<span class="ot-tag">${fmtMinutes(ot)} overtime</span>` : ''}
      ${pts ? `<span class="pts-tag">${fmtPoints(pts)} points</span>` : ''}
    </div>
    <div class="chips">${chipsOf(totals)}</div>
    <table class="sumtable">
      <tbody>${week.days.map(d => {
        const dot = overtimeOf(d.shifts, d.date);
        return `<tr${d.date === weekDay ? ' class="on"' : ''}>
                  <td>${fmtDay(d.date)}</td>
                  <td class="n">${d.minutes ? fmtMinutes(d.minutes) : '—'}</td>
                  <td class="n">${dot > 0 ? `<b class="ot-tag">${fmtMinutes(dot)}</b>` : ''}</td>
                  <td class="n">${d.activity.points ? fmtPoints(d.activity.points) : ''}</td>
                </tr>`;
      }).join('')}</tbody>
    </table>`;
}

function hourRow(h, clockedIn, notes, date, editable, withEvents = false) {
  const chips = chipsOf(h.metrics);
  const events = !withEvents ? '' : (h.details || []).map(ev => `
    <span class="pill ${ev.kind}">
      ${evText(ev)}
    </span>`).join('');

  return `
    <div class="hour${clockedIn ? '' : ' outside'}${editable ? ' tappable' : ''}"
         data-date="${date}" data-hour="${h.hour}">
      <div class="h">${fmtHour(h.hour)}${h.points ? `<i class="pts-tag">${fmtPoints(h.points)}</i>` : ''}</div>
      <div class="body">
        ${clockedIn ? '' : '<div class="tag">Not clocked in</div>'}
        ${chips ? `<div class="chips">${chips}</div>` : '<div class="quiet">No tracked activity this hour.</div>'}
        ${events ? `<div class="evlist">${events}</div>` : ''}
        ${(notes || []).length ? `<div class="evlist tasks">${(notes || []).map(n => `<span class="pill task ${n.category || 'other'}" data-note="${n.id}">${evText(taskEvent(n))}</span>`).join('')}</div>` : ''}
        ${editable ? '<div class="add">+ add what you did</div>' : ''}
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

// Duration first, then what it was about — for a call the length is the useful part.
const evExtra = ev =>
  (ev.dur && fmtDur(ev.dur) ? ` · ${fmtDur(ev.dur)}` : '') +
  (ev.label ? ` · ${escapeHtml(ev.label)}` : '');

// Category · title · time · job for a task; kind · time · detail for an activity.
function evText(ev, plain = false) {
  const b = t => (plain ? t : `<b>${t}</b>`);
  if (ev.kind === 'task') {
    return b(CATEGORIES[ev.cat] || 'Others') + ' · ' + escapeHtml(ev.title) +
           ' · ' + ev.span + (ev.job ? ` · Job #${escapeHtml(ev.job)}` : '');
  }
  return b(EVENT_LABELS[ev.kind] || ev.kind) + ', ' + fmtClock(ev.at) + evExtra(ev);
}

function chipsFor(hour) {
  return Object.entries(hour?.metrics || {})
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `<span class="chip"><b>${n}</b> ${METRIC_LABELS[k]}</span>`)
    .join('');
}

let hourContext = null;

function openHourModal({ date, hour, day, editable, person }) {
  const h = day.activity.hours[hour];
  const chips = chipsFor(h);
  hourContext = { date, hour, editable };

  const events = (h?.details || []).map(ev => `
    <div class="ev">
      <span class="t">${fmtClock(ev.at)}</span>
      <span class="k">${EVENT_LABELS[ev.kind] || ev.kind}</span>
      <span class="l">${ev.dur && fmtDur(ev.dur) ? fmtDur(ev.dur) + ' · ' : ''}${escapeHtml(ev.label || '')}</span>
    </div>`).join('');

  const notes = notesInHour(day.notes, hour).map(n => `
    <span class="pill task ${n.category || 'other'}${editable ? ' tappable' : ''}" data-note="${n.id}">
      ${evText(taskEvent(n))}
    </span>`).join('');

  $('hour-title').textContent = `${fmtHour(hour)} · ${fmtDay(date)}`;
  $('hour-detail').innerHTML =
    (person ? `<div class="who">${escapeHtml(person)}</div>` : '') +
    (chips ? `<div class="chips">${chips}</div>` : '') +
    (events || (chips ? '' : '<div class="quiet">No tracked activity this hour.</div>')) +
    (notes ? `<div class="evlist">${notes}</div>` : '');

  // Only your own calendar offers to add to it.
  $('hour-add').hidden = !editable;
  $('hour-modal').hidden = false;
}

// ─── Notes ─────────────────────────────────────────────────────────────────
//
// A note is a span of time you draw on your own calendar, on the quarter hour.

const CATEGORIES = { admin: 'Admin', meeting: 'Meeting', other: 'Others' };

const QUARTER = 15;
const QUARTERS = Array.from({ length: (24 * 60) / QUARTER + 1 }, (_, i) => i * QUARTER);

// Arizona minutes back to an instant, for placing a task on the axis.
const minToIso = (m, date) => {
  const d = new Date(`${date || dayDate}T00:00:00Z`);
  return new Date(d.getTime() + (m + 7 * 60) * 60000).toISOString();
};

const fmtMin = m => {
  const h = Math.floor(m / 60) % 24, mm = m % 60;
  if (m >= 24 * 60) return 'midnight';
  return `${h % 12 === 0 ? 12 : h % 12}:${String(mm).padStart(2, '0')}${h < 12 ? 'am' : 'pm'}`;
};

const quarterOptions = sel => QUARTERS
  .map(m => `<option value="${m}"${m === sel ? ' selected' : ''}>${fmtMin(m)}</option>`).join('');

// Two tasks that overlap in time each take half the strip; three take a third. The
// column count is per overlapping group, so an isolated task still gets the full width.
function packColumns(notes) {
  const sorted = notes.slice().sort((a, b) => a.start_min - b.start_min || a.end_min - b.end_min);
  const out = [];
  let group = [], groupEnd = -1;

  const flush = () => {
    group.forEach((n, i) => out.push({ n, col: i, of: group.length }));
    group = []; groupEnd = -1;
  };

  for (const n of sorted) {
    if (group.length && n.start_min >= groupEnd) flush();
    group.push(n);
    groupEnd = Math.max(groupEnd, n.end_min);
  }
  flush();
  return out;
}

// A manual task is drawn exactly like a tracked one: same lane, same five-minute
// row, same column split. Sharing the layout is what stops it covering anything.
const taskEvent = (n, date) => ({
  kind: 'task',
  cat: n.category || 'other',
  id: n.id,
  at: minToIso(n.start_min, date),
  span: `${fmtMin(n.start_min)}–${fmtMin(n.end_min)}`,
  title: n.note,
  job: n.job_number || null
});

// Which hours a note touches, for the week view's dot and the hour list.
const notesInHour = (notes, hour) =>
  (notes || []).filter(n => n.start_min < (hour + 1) * 60 && n.end_min > hour * 60);

let editingNote = null;
let chosenCategory = 'other';

function pickCategory(cat) {
  chosenCategory = cat;
  document.querySelectorAll('#note-cat button').forEach(b => {
    b.classList.toggle('on', b.dataset.cat === cat);
  });
}

function editNote(id) {
  for (const d of myDays) {
    const n = (d.notes || []).find(x => String(x.id) === String(id));
    if (n) return openNote({ date: d.date, startMin: n.start_min, note: n });
  }
}

function openNote({ date, startMin, note }) {
  editingNote = { date, id: note?.id || null };
  const start = note ? note.start_min : startMin;
  const end = note ? note.end_min : Math.min(startMin + 30, 24 * 60);

  $('note-title').textContent = note ? 'Edit what you did' : 'Add what you did';
  $('note-date').textContent = fmtDay(date);
  $('note-start').innerHTML = quarterOptions(start);
  $('note-end').innerHTML = quarterOptions(end);
  $('note-text').value = note ? note.note : '';
  $('note-job').value = note?.job_number || '';
  pickCategory(note?.category || 'other');
  $('note-delete').hidden = !note;
  $('note-error').hidden = true;
  $('note-modal').hidden = false;
  $('note-text').focus();
}

async function saveNote() {
  if (!editingNote) return;
  const body = {
    id: editingNote.id,
    date: editingNote.date,
    start: Number($('note-start').value),
    end: Number($('note-end').value),
    note: $('note-text').value.trim(),
    category: chosenCategory,
    jobNumber: $('note-job').value.trim()
  };
  $('note-save').disabled = true;
  try {
    await api('/api/time/notes', { method: 'PUT', body: JSON.stringify(body) });
    $('note-modal').hidden = true;
    loadDay();
  } catch (e) {
    $('note-error').textContent = e.message;
    $('note-error').hidden = false;
  } finally {
    $('note-save').disabled = false;
  }
}

async function deleteNote() {
  if (!editingNote?.id) return;
  try {
    await api('/api/time/notes', { method: 'DELETE', body: JSON.stringify({ id: editingNote.id }) });
    $('note-modal').hidden = true;
    loadDay();
  } catch (e) {
    $('note-error').textContent = e.message;
    $('note-error').hidden = false;
  }
}

// ─── Team ──────────────────────────────────────────────────────────────────

// Hours silently reading zero is indistinguishable from everyone taking a day off,
// so a broken sync has to say so on the screen the manager actually looks at. A sync
// that simply stopped running says nothing at all, which is how it went unnoticed for
// four days — so staleness is banner-worthy even with no error.
async function renderSyncBanner() {
  try {
    const s = await api('/api/manager/sync-state');
    const stale = s.last_run_at && (Date.now() - new Date(s.last_run_at).getTime()) > 30 * 60000;
    $('team-banner').hidden = s.configured !== false && !s.last_error && !stale;
    // Not configured is not the same as behind: no amount of refreshing will help.
    if (s.configured === false) {
      $('team-banner').textContent =
        'ServiceTitan is not connected on this server, so clocked hours cannot update. ' +
        'Activity below is live. The ST_* environment variables need to be set on the service.';
      $('team-resync').hidden = true;
      return;
    }
    $('team-resync').hidden = false;
    if (s.last_error) {
      $('team-banner').textContent = /403|scope/i.test(s.last_error)
        ? 'ServiceTitan hours are not syncing: the API app is missing the timesheet permission. Activity below is still accurate; clocked hours will read zero until that is granted.'
        : `ServiceTitan hours are not syncing: ${s.last_error}`;
    } else if (stale) {
      const mins = Math.round((Date.now() - new Date(s.last_run_at).getTime()) / 60000);
      const ago = mins > 120 ? `${Math.round(mins / 60)} hours` : `${mins} minutes`;
      $('team-banner').textContent =
        `Hours last synced ${ago} ago. Activity below is live; clocked hours may be behind — press Refresh hours.`;
    }
  } catch { $('team-banner').hidden = true; }
}

async function resyncWeek() {
  const btn = $('team-resync');
  const was = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Refreshing…';
  try {
    const r = await api('/api/manager/resync', { method: 'POST', body: JSON.stringify({ start: teamDate }) });
    btn.textContent = `${r.saved} punches`;
    await loadTeam();
  } catch (e) {
    btn.textContent = e.message.slice(0, 40);
  } finally {
    setTimeout(() => { btn.textContent = was; btn.disabled = false; }, 2500);
  }
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

    // Zero activity for everyone is either a very quiet day or a missing feed, and
    // only one of those is worth acting on.
    if (data.activityAvailable === false) {
      $('team-banner').hidden = false;
      $('team-banner').textContent =
        'The tracker has no activity data right now, so every activity count and point ' +
        'below reads zero. Clocked hours are still accurate. This comes from the HVAC ' +
        'Tracker rebuilding its scoreboard — it usually returns on its own within ten minutes.';
    }

    // Everyone on the list shows, including people with no hours — that is the part
    // that says who was off.
    $('team-list').innerHTML = data.people.length
      ? data.people.map(p => {
          const ot = overtimeOf(p.shifts, data.date);
          const acts = Object.values(p.activity).reduce((a, b) => a + b, 0);
          return `
            <button class="person" data-person="${escapeHtml(p.person)}">
              <span class="nm">${escapeHtml(p.person)}${p.role ? `<i>${escapeHtml(p.role)}</i>` : ''}</span>
              <span class="hrs">
                ${p.minutes ? fmtMinutes(p.minutes) : '<em>off</em>'}
                ${ot > 0 ? `<b class="ot-tag">+${fmtMinutes(ot)} OT</b>` : ''}
                ${p.openShift ? '<b class="warn" title="No clock-out">•</b>' : ''}
              </span>
              <span class="act" title="${acts} tracked actions">${acts || ''}</span>
              <span class="pts">${p.points ? `${fmtPoints(p.points)}<i>pts</i>` : ''}</span>
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

const readyToSignIn = () => {
  $('login-btn').disabled = !($('login-user').value.trim() && $('login-pin').value.length === 4);
};
$('login-user').addEventListener('input', readyToSignIn);
$('login-pin').addEventListener('input', e => {
  e.target.value = e.target.value.replace(/\D/g, '');
  readyToSignIn();
});
$('login-user').addEventListener('keydown', e => { if (e.key === 'Enter') $('login-pin').focus(); });
$('login-pin').addEventListener('keydown', e => { if (e.key === 'Enter' && !$('login-btn').disabled) doLogin(); });
$('login-btn').addEventListener('click', doLogin);

async function signOut() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
  showLogin();
}
$('signout').addEventListener('click', signOut);
$('team-signout').addEventListener('click', signOut);
$('team-resync').addEventListener('click', resyncWeek);

$('day-prev').addEventListener('click', () => { dayDate = shiftDate(dayDate, mineMode === 'day' ? -1 : -7); loadDay(); });
$('day-next').addEventListener('click', () => {
  if (dayDate >= azTodayStr()) return;
  dayDate = shiftDate(dayDate, mineMode === 'day' ? 1 : 7);
  loadDay();
});
$('mine-day').addEventListener('click', () => { mineMode = 'day'; loadDay(); });
$('mine-week').addEventListener('click', () => { mineMode = 'week'; loadDay(); });

// The week is already loaded, so switching days is a redraw, not a round trip.
// The header label opens the browser's own date picker, so jumping to a date is one
// click rather than a run of arrow presses.
function openDatePicker(id, current) {
  const el = $(id);
  el.value = current;
  el.max = azTodayStr();
  if (el.showPicker) {
    try { el.showPicker(); return; } catch { /* not user-activated; fall through */ }
  }
  el.focus();
  el.click();
}

$('day-date').addEventListener('click', () => openDatePicker('day-date-input', dayDate));
$('day-date-input').addEventListener('change', e => {
  if (!e.target.value) return;
  dayDate = e.target.value;
  // Picking a day in week mode should land the Day Report on that day, not on today.
  weekDay = dayDate;
  loadDay();
});

$('team-range').addEventListener('click', () => openDatePicker('team-date-input', teamDate));
$('team-date-input').addEventListener('change', e => {
  if (!e.target.value) return;
  teamDate = e.target.value;
  loadTeam();
});

$('day-picker').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  weekDay = b.dataset.date;
  const week = { days: myDays, minutes: myDays.reduce((n, d) => n + d.minutes, 0) };
  renderWeekBreakdown(week, !viewing);
  renderWeekSummary(week);
});

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

// Clearing someone's PIN so they can set a new one. Confirmed first, because they
// cannot sign in again until they do.
$('day-resetpin').addEventListener('click', async () => {
  if (!viewing) return;
  if (!confirm(`Reset ${viewing}'s PIN?\n\nThey will choose a new one the next time they sign in, and cannot sign in until they do.`)) return;
  const btn = $('day-resetpin');
  btn.disabled = true;
  try {
    const r = await api('/api/manager/reset-pin', { method: 'POST', body: JSON.stringify({ person: viewing }) });
    alert(r.alreadyUnset
      ? `${r.person} had no PIN set, so there was nothing to reset. They will choose one when they first sign in.`
      : `Done. ${r.person} will choose a new PIN the next time they sign in.`);
  } catch (e) {
    alert(e.message);
  } finally {
    btn.disabled = false;
  }
});

// One listener per screen rather than per element — both redraw constantly.
$('day-cal').addEventListener('click', e => {
  const np = e.target.closest('[data-note]');
  if (np && !viewing) return editNote(np.dataset.note);
  const cel = e.target.closest('.cel');
  if (!cel) return;
  const day = myDays.find(d => d.date === cel.dataset.col);
  if (day) openHourModal({ date: day.date, hour: Number(cel.dataset.hour), day, editable: !viewing, person: viewing });
});

$('day-hours').addEventListener('click', e => {
  const nd = e.target.closest('[data-note]');
  if (nd && !viewing) return editNote(nd.dataset.note);
  const row = e.target.closest('.hour');
  if (!row) return;
  const day = myDays.find(d => d.date === row.dataset.date);
  if (day) openHourModal({ date: day.date, hour: Number(row.dataset.hour), day, editable: !viewing, person: viewing });
});

$('hour-cancel').addEventListener('click', () => { $('hour-modal').hidden = true; });
$('hour-add').addEventListener('click', () => {
  $('hour-modal').hidden = true;
  openNote({ date: hourContext.date, startMin: hourContext.hour * 60 });
});

$('note-cat').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b) pickCategory(b.dataset.cat);
});
$('note-cancel').addEventListener('click', () => { $('note-modal').hidden = true; });
$('note-save').addEventListener('click', saveNote);
$('note-delete').addEventListener('click', deleteNote);
// Keep the end after the start without arguing with the person doing the typing.
$('note-start').addEventListener('change', () => {
  if (Number($('note-end').value) <= Number($('note-start').value)) {
    $('note-end').value = String(Math.min(Number($('note-start').value) + 15, 24 * 60));
  }
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
