require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const crypto       = require('crypto');
const bcrypt       = require('bcryptjs');
const cookieParser = require('cookie-parser');
const axios        = require('axios');
const { Pool }     = require('pg');

const app = express();
app.set('trust proxy', 1);          // Railway terminates TLS, so req.secure needs the forwarded header
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Database ─────────────────────────────────────────────────────────────────
//
// THE ONE RULE: this app CREATES and WRITES only time_* tables. Every other table
// in this database belongs to the HVAC Tracker and is READ-ONLY. The tracker is
// live and runs dispatch and billing.

let pool = null;
if (process.env.DATABASE_URL) {
  const isInternal = process.env.DATABASE_URL.includes('railway.internal');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isInternal ? false : { rejectUnauthorized: false }
  });
  pool.on('error', err => console.error('DB pool error:', err.message));
}

async function initDB() {
  if (!pool) return console.log('No DATABASE_URL — the app cannot run without it');
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS time_users (
        username      TEXT PRIMARY KEY,
        person_name   TEXT NOT NULL,
        pin_hash      TEXT NOT NULL,
        created_at    TIMESTAMPTZ DEFAULT now(),
        last_login_at TIMESTAMPTZ
      )
    `);
    await pool.query(`ALTER TABLE time_users ADD COLUMN IF NOT EXISTS is_manager BOOLEAN DEFAULT FALSE`);
    // Clocked hours mirrored from ServiceTitan. ST owns them; we never write back.
    // raw is kept so a field we mis-mapped can be re-parsed without re-syncing.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS time_st_shifts (
        st_id          BIGINT PRIMARY KEY,
        st_employee_id BIGINT,
        person_name    TEXT,
        started_at     TIMESTAMPTZ,
        ended_at       TIMESTAMPTZ,
        minutes        INTEGER,
        timesheet_code TEXT,
        raw            JSONB,
        synced_at      TIMESTAMPTZ DEFAULT now()
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_st_shifts_person_start ON time_st_shifts(person_name, started_at)`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS time_sync_state (
        key          TEXT PRIMARY KEY,
        cursor       TIMESTAMPTZ,
        last_run_at  TIMESTAMPTZ,
        last_error   TEXT
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS time_audit_log (
        id        SERIAL PRIMARY KEY,
        entity    TEXT NOT NULL,
        entity_id INTEGER,
        action    TEXT NOT NULL,
        before    JSONB,
        after     JSONB,
        by_person TEXT,
        at        TIMESTAMPTZ DEFAULT now()
      )
    `);
    console.log('DB: time_users, time_st_shifts, time_sync_state, time_audit_log ready');
  } catch (e) {
    console.error('DB init error:', e.message);
  }
}

// Every create/edit is recorded. This is what lets the app become payroll-grade
// later without a rewrite, so a failed write must never swallow the action silently.
async function audit(entity, entityId, action, before, after, byPerson) {
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO time_audit_log (entity, entity_id, action, before, after, by_person)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [entity, entityId, action, before ? JSON.stringify(before) : null,
       after ? JSON.stringify(after) : null, byPerson]
    );
  } catch (e) {
    console.error('[AUDIT] write failed:', e.message);
  }
}

// ─── Identity ─────────────────────────────────────────────────────────────────
//
// Copied verbatim from the tracker's public/index.html so both apps agree on names.
// This display name is the join key into the tracker's scoreboard data.

const USERNAME_TO_NAME = {
  'acalyssa':           'Alyssa Power',
  'acbrittany':         'Brittany Magdaleno',
  'acalec':             'Alec Sunga',
  'chamilleMendros':    'Chamille Mendros',
  'accharlet':          'Charlet Butler',
  'acrgio':             'Gio Salvatierra',
  'ackaila':            'Kaila Ferraris',
  'ackenia':            'Kenia Simkins',
  'michael ac rangers': 'Michael Molina',
  'acmiranda':          'Miranda Hahn',
  'actracie':           'Tracie Huss',
  'acrapril':           'April Oviedo',
  'angelacranger':      'Angel Pacaldo',
  'abooth':             'Amber Booth',
  'bradrog':            'Bradley Rogers',
  'rangersedgar':       'Edgar Peraya',
  'ivanrod':            'Ivan Rodriguez',
  'johnacr':            'John Aragon',
  'acrjose':            'Jose',
  'actrina':            'Trina',
  'acclay':             'Ryan Clayton Santos',
  'acranne':            'Anne Frac'
};

// Loose name compare: ST names may differ from login names (e.g. "Ryan Santos" vs "Ryan Clayton Santos")
function namesMatch(a, b) {
  if (!a || !b) return false;
  a = a.trim().toLowerCase(); b = b.trim().toLowerCase();
  if (a === b) return true;
  const aw = a.split(/\s+/), bw = b.split(/\s+/);
  return aw[0] === bw[0] && aw[aw.length - 1] === bw[bw.length - 1];
}

// Manager access is re-applied from here on every sign-in, so this list stays the
// single place it is decided.
const MANAGERS = new Set(['johnacr']);

function resolveUsername(input) {
  const raw = (input || '').trim();
  if (USERNAME_TO_NAME[raw]) return raw;
  const lower = raw.toLowerCase();
  return Object.keys(USERNAME_TO_NAME).find(u => u.toLowerCase() === lower) || null;
}

// ─── Arizona time (UTC-7, no DST) ─────────────────────────────────────────────

function azBucket(iso) {
  const d = new Date(iso);
  const utcHour = d.getUTCHours();
  const azHour = (utcHour - 7 + 24) % 24;
  let azDate = d.toISOString().split('T')[0];
  if (utcHour < 7) {                    // before 07:00 UTC is still the previous AZ day
    const prev = new Date(d);
    prev.setUTCDate(prev.getUTCDate() - 1);
    azDate = prev.toISOString().split('T')[0];
  }
  return { azDate, azHour };
}

function azToday() {
  return new Date(Date.now() - 7 * 3600 * 1000).toISOString().split('T')[0];
}

// ─── Sessions ─────────────────────────────────────────────────────────────────
//
// A signed cookie, so the server derives who is calling instead of trusting the
// request body. Without this the audit log records claims rather than facts.

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.SESSION_SECRET) console.warn('No SESSION_SECRET set — sessions will not survive a restart');
const SESSION_DAYS = 30;
const COOKIE = 'tc_session';

function signSession(username) {
  const exp = Date.now() + SESSION_DAYS * 86400000;
  const body = `${Buffer.from(username).toString('base64url')}.${exp}`;
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function readSession(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const body = `${parts[0]}.${parts[1]}`;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  const a = Buffer.from(parts[2]);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Number(parts[1]) < Date.now()) return null;
  const username = Buffer.from(parts[0], 'base64url').toString();
  return USERNAME_TO_NAME[username] ? username : null;
}

function setSessionCookie(req, res, username) {
  res.cookie(COOKIE, signSession(username), {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure,
    maxAge: SESSION_DAYS * 86400000
  });
}

function requireAuth(req, res, next) {
  const username = readSession(req.cookies?.[COOKIE]);
  if (!username) return res.status(401).json({ error: 'Not signed in' });
  req.user = { username, name: USERNAME_TO_NAME[username] };
  next();
}

// ─── Auth routes ──────────────────────────────────────────────────────────────

app.get('/api/auth/users', async (req, res) => {
  try {
    const { rows } = pool
      ? await pool.query('SELECT username FROM time_users')
      : { rows: [] };
    const registered = new Set(rows.map(r => r.username));
    const users = Object.entries(USERNAME_TO_NAME)
      .map(([username, name]) => ({ username, name, registered: registered.has(username) }))
      .sort((a, b) => a.name.localeCompare(b.name));
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// First sign-in for a username sets its PIN; after that the PIN is required.
app.post('/api/auth/login', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'No database connection' });
  const username = resolveUsername(req.body?.username);
  const pin = String(req.body?.pin || '');
  if (!username) return res.status(400).json({ error: 'Unknown user' });
  if (!/^\d{4}$/.test(pin)) return res.status(400).json({ error: 'PIN must be 4 digits' });

  try {
    const name = USERNAME_TO_NAME[username];
    const { rows } = await pool.query('SELECT username, pin_hash FROM time_users WHERE username = $1', [username]);

    if (!rows.length) {
      const hash = await bcrypt.hash(pin, 10);
      await pool.query(
        `INSERT INTO time_users (username, person_name, pin_hash, last_login_at, is_manager)
         VALUES ($1, $2, $3, now(), $4)
         ON CONFLICT (username) DO NOTHING`,
        [username, name, hash, MANAGERS.has(username)]
      );
      await audit('user', null, 'pin_set', null, { username, person_name: name }, name);
    } else {
      const ok = await bcrypt.compare(pin, rows[0].pin_hash);
      if (!ok) return res.status(401).json({ error: 'Wrong PIN' });
      await pool.query(
        'UPDATE time_users SET last_login_at = now(), is_manager = $2 WHERE username = $1',
        [username, MANAGERS.has(username)]
      );
    }

    setSessionCookie(req, res, username);
    res.json({ username, name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(COOKIE);
  res.json({ ok: true });
});

app.get('/api/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT is_manager FROM time_users WHERE username = $1', [req.user.username]);
  res.json({ ...req.user, isManager: !!rows[0]?.is_manager });
});

// ─── The tracker's activity feed (read-only) ──────────────────────────────────

const MASTER_KEY = 'scoreboard-master';
const MASTER_TTL = 60 * 1000;
let masterCache = { blob: null, cachedAt: null, at: 0 };

// The tracker refreshes this blob every 10 minutes and owns it entirely — we only read.
async function getMaster() {
  if (masterCache.blob && Date.now() - masterCache.at < MASTER_TTL) return masterCache;
  const { rows } = await pool.query(
    'SELECT data, cached_at FROM scoreboard_cache WHERE cache_key = $1',
    [MASTER_KEY]
  );
  masterCache = {
    blob: rows[0]?.data || null,
    cachedAt: rows[0]?.cached_at || null,
    at: Date.now()
  };
  return masterCache;
}

const METRICS = ['callsIn', 'callsOut', 'jobsCreated', 'jobsDispatched', 'estSent', 'audits', 'invoices'];

// Everything a day needs that is the same for all 22 people, fetched once. Without
// this a manager week view would fire 300+ queries to answer one screen.
async function dayContext(date) {
  const [{ blob, cachedAt }, audits, invoices] = await Promise.all([
    getMaster(),
    // Audits and invoices are daily counts only in the blob, so their hourly detail
    // comes straight from the source tables.
    pool.query(
      `SELECT audited_by AS person, audited_at AS at, job_id
         FROM invoice_audit_tracker
        WHERE audited_by IS NOT NULL
          AND (audited_at AT TIME ZONE 'America/Phoenix')::date = $1::date`, [date]),
    pool.query(
      `SELECT invoiced_by AS person, invoiced_at AS at, job_id
         FROM invoice_tracker
        WHERE invoiced_by IS NOT NULL
          AND (invoiced_at AT TIME ZONE 'America/Phoenix')::date = $1::date`, [date])
  ]);
  return { date, blob, cachedAt, audits: audits.rows, invoices: invoices.rows };
}

function activityFor(personName, date, ctx) {
  const { blob, cachedAt } = ctx;
  const row = (blob?.data || []).find(r => r.name && r.name !== 'TOTAL' && namesMatch(r.name, personName));

  const events = [];
  const push = (kind, ts, label) => {
    if (!ts) return;
    const { azDate, azHour } = azBucket(ts);
    if (azDate !== date) return;
    events.push({ kind, hour: azHour, at: new Date(ts).toISOString(), label: label || null });
  };

  if (row) {
    (row.callDetails || []).forEach(c => {
      const outbound = (c.direction || '').toLowerCase() === 'outbound';
      push(outbound ? 'callsOut' : 'callsIn', c.createdOn,
           c.jobNumber ? `Job #${c.jobNumber}` : (outbound ? c.to : c.from) || null);
    });
    (row.createdJobs || []).forEach(j => push('jobsCreated', j.createdOn, j.jobNumber ? `Job #${j.jobNumber}` : null));
    // Dispatch timestamps live under bookedOn (appointment_dispatchers.dispatch_event_date)
    // or dispatchedOn (ST job history) — never createdOn.
    (row.dispatchedJobs || []).forEach(j => push('jobsDispatched', j.bookedOn || j.dispatchedOn,
                                                 j.jobNumber ? `Job #${j.jobNumber}` : null));
    (row.estSentDetails || []).forEach(e => push('estSent', e.sent_at, e.estimate_id ? `Estimate ${e.estimate_id}` : null));
  }

  ctx.audits.filter(r => namesMatch(r.person, personName))
    .forEach(r => push('audits', r.at, r.job_id ? `Job ${r.job_id}` : null));
  ctx.invoices.filter(r => namesMatch(r.person, personName))
    .forEach(r => push('invoices', r.at, r.job_id ? `Job ${r.job_id}` : null));

  const hours = Array.from({ length: 24 }, (_, h) => {
    const evs = events.filter(e => e.hour === h).sort((a, b) => new Date(a.at) - new Date(b.at));
    const metrics = {};
    METRICS.forEach(m => { metrics[m] = evs.filter(e => e.kind === m).length; });
    return { hour: h, total: evs.length, metrics, details: evs.map(({ kind, at, label }) => ({ kind, at, label })) };
  });

  const totals = {};
  METRICS.forEach(m => { totals[m] = events.filter(e => e.kind === m).length; });

  return {
    person: row?.name || personName,
    matchedScoreboard: !!row,
    date,
    cachedAt,
    hours,
    totals
  };
}

app.get('/api/time/activity', requireAuth, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'No database connection' });
  const date = req.query.date || azToday();
  // Phase 1 is self-service only; the person param exists for the manager view in Phase 3.
  if (req.query.person && !namesMatch(req.query.person, req.user.name)) {
    return res.status(403).json({ error: 'You can only view your own activity' });
  }
  try {
    res.json(activityFor(req.user.name, date, await dayContext(date)));
  } catch (e) {
    console.error('[ACTIVITY]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── ServiceTitan — clocked hours (read-only) ─────────────────────────────────
//
// The office team punches in ServiceTitan (Payroll → Timesheets). This app mirrors
// those punches into time_st_shifts and never creates, edits, or deletes ST time.

const stReady = () => !!(process.env.ST_CLIENT_ID && process.env.ST_CLIENT_SECRET && process.env.ST_TENANT_ID);
const tid = () => process.env.ST_TENANT_ID;

let stToken = { token: null, expiresAt: 0 };

async function getToken() {
  if (stToken.token && Date.now() < stToken.expiresAt) return stToken.token;
  const res = await axios.post(
    process.env.ST_AUTH_URL,
    `grant_type=client_credentials&client_id=${process.env.ST_CLIENT_ID}&client_secret=${process.env.ST_CLIENT_SECRET}`,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  stToken = { token: res.data.access_token, expiresAt: Date.now() + (res.data.expires_in - 60) * 1000 };
  return stToken.token;
}

// ST rate-limits hard: probing tripped 429 even at 1.5s spacing. It tells us how
// long to wait, so honour that rather than guessing.
async function stGet(endpoint, attempt = 0) {
  const token = await getToken();
  try {
    const res = await axios.get(`${process.env.ST_API_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}`, 'ST-App-Key': process.env.ST_APP_KEY }
    });
    return res.data;
  } catch (e) {
    if (e.response?.status === 429 && attempt < 5) {
      const secs = Number(/again in (\d+)/.exec(e.response.data?.title || '')?.[1] || attempt + 1);
      await new Promise(r => setTimeout(r, (secs + 1) * 1000));
      return stGet(endpoint, attempt + 1);
    }
    throw e;
  }
}

async function getAllPages(endpoint) {
  let page = 1, all = [], hasMore = true;
  while (hasMore) {
    const data = await stGet(`${endpoint}&page=${page}`);
    const items = data.data || [];
    all = all.concat(items);
    hasMore = data.hasMore && items.length > 0;
    page++;
    if (page > 50) break;
  }
  return all;
}

let employeeMapCache = { data: null, at: 0 };
const EMP_TTL = 3600 * 1000;

async function getEmployeeMap() {
  if (employeeMapCache.data && Date.now() - employeeMapCache.at < EMP_TTL) return employeeMapCache.data;
  const map = {};
  (await getAllPages(`/settings/v2/tenant/${tid()}/employees?pageSize=200&active=True`))
    .forEach(e => { if (e.id && e.name) map[e.id] = e.name; });
  employeeMapCache = { data: map, at: Date.now() };
  return map;
}

// Field names on a non-job timesheet are unconfirmed until the payroll scope is
// granted, so try the plausible spellings and shout if none of them land. The raw
// record is stored either way, so a wrong guess is re-parsable without re-syncing.
const START_KEYS = ['startedOn', 'startTime', 'start', 'clockIn', 'startsOn'];
const END_KEYS   = ['endedOn', 'endTime', 'end', 'clockOut', 'endsOn'];
let warnedShape = false;

function pick(row, keys) {
  for (const k of keys) if (row[k]) return row[k];
  return null;
}

function shiftTimes(row) {
  const started = pick(row, START_KEYS);
  const ended   = pick(row, END_KEYS);
  if (!started && !warnedShape) {
    warnedShape = true;
    console.error('[ST SYNC] no known start field on a timesheet — keys were:', Object.keys(row).join(', '));
  }
  return { started, ended };
}

const SYNC_KEY = 'st_non_job_timesheets';
const SYNC_MINUTES = 10;
const BACKFILL_DAYS = 60;

async function syncShifts() {
  if (!pool || !stReady()) return;
  const runStart = new Date();
  const { rows } = await pool.query('SELECT cursor FROM time_sync_state WHERE key = $1', [SYNC_KEY]);
  const since = rows[0]?.cursor || new Date(Date.now() - BACKFILL_DAYS * 86400000);

  try {
    const emp = await getEmployeeMap();
    // Only modified* filters exist here — there is no shift-date filter — so we sync
    // by change cursor and let the display layer filter on the punch's own start.
    const items = await getAllPages(
      `/payroll/v2/tenant/${tid()}/non-job-timesheets?pageSize=200&employeeType=Employee` +
      `&modifiedOnOrAfter=${since.toISOString()}`
    );

    for (const it of items) {
      const { started, ended } = shiftTimes(it);
      const minutes = started && ended ? Math.round((new Date(ended) - new Date(started)) / 60000) : null;
      await pool.query(
        `INSERT INTO time_st_shifts
           (st_id, st_employee_id, person_name, started_at, ended_at, minutes, timesheet_code, raw, synced_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
         ON CONFLICT (st_id) DO UPDATE SET
           st_employee_id = EXCLUDED.st_employee_id, person_name = EXCLUDED.person_name,
           started_at = EXCLUDED.started_at, ended_at = EXCLUDED.ended_at,
           minutes = EXCLUDED.minutes, timesheet_code = EXCLUDED.timesheet_code,
           raw = EXCLUDED.raw, synced_at = now()`,
        [it.id, it.employeeId, emp[it.employeeId] || null, started, ended, minutes,
         it.timesheetCode?.name || it.activityCode?.name || null, JSON.stringify(it)]
      );
    }

    // Overlap the cursor slightly so a punch edited mid-run is not skipped.
    await pool.query(
      `INSERT INTO time_sync_state (key, cursor, last_run_at, last_error)
       VALUES ($1, $2, now(), NULL)
       ON CONFLICT (key) DO UPDATE SET cursor = EXCLUDED.cursor, last_run_at = now(), last_error = NULL`,
      [SYNC_KEY, new Date(runStart.getTime() - 5 * 60000)]
    );
    await audit('sync', null, 'st_shifts', null, { count: items.length, since }, 'system');
    console.log(`[ST SYNC] ${items.length} timesheets since ${since.toISOString()}`);
  } catch (e) {
    const msg = e.response ? `${e.response.status} ${e.response.data?.title || ''}`.trim() : e.message;
    await pool.query(
      `INSERT INTO time_sync_state (key, cursor, last_run_at, last_error)
       VALUES ($1, NULL, now(), $2)
       ON CONFLICT (key) DO UPDATE SET last_run_at = now(), last_error = EXCLUDED.last_error`,
      [SYNC_KEY, msg]
    );
    console.error('[ST SYNC]', msg);
  }
}

// Every punch that starts on the given Arizona day, all people. Callers filter by
// name with namesMatch(), since ST names and login names differ.
async function shiftsOnDate(date) {
  const { rows } = await pool.query(
    `SELECT * FROM time_st_shifts
      WHERE (started_at AT TIME ZONE 'America/Phoenix')::date = $1::date
      ORDER BY started_at`,
    [date]
  );
  return rows;
}

const shiftsOf = (rows, personName) => rows.filter(r => namesMatch(r.person_name, personName));
const minutesOf = shifts => shifts.reduce((n, s) => n + (s.minutes || 0), 0);

app.get('/api/time/day', requireAuth, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'No database connection' });
  const date = req.query.date || azToday();
  if (req.query.person && !namesMatch(req.query.person, req.user.name)) {
    return res.status(403).json({ error: 'You can only view your own day' });
  }
  try {
    const [all, ctx] = await Promise.all([shiftsOnDate(date), dayContext(date)]);
    const shifts = shiftsOf(all, req.user.name);
    res.json({
      date, person: req.user.name, shifts,
      minutesTotal: minutesOf(shifts),
      activity: activityFor(req.user.name, date, ctx)
    });
  } catch (e) {
    console.error('[DAY]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── Manager views ────────────────────────────────────────────────────────────

async function requireManager(req, res, next) {
  const { rows } = await pool.query('SELECT is_manager FROM time_users WHERE username = $1', [req.user.username]);
  if (!rows[0]?.is_manager) return res.status(403).json({ error: 'Managers only' });
  next();
}

const ROSTER = Object.values(USERNAME_TO_NAME);

app.get('/api/manager/day', requireAuth, requireManager, async (req, res) => {
  const date = req.query.date || azToday();
  try {
    const [all, ctx] = await Promise.all([shiftsOnDate(date), dayContext(date)]);
    const people = ROSTER.map(name => {
      const shifts = shiftsOf(all, name);
      const activity = activityFor(name, date, ctx);
      return {
        person: name,
        shifts,
        minutes: minutesOf(shifts),
        openShift: shifts.some(s => !s.ended_at),
        activity: activity.totals,
        hours: activity.hours.map(h => ({ hour: h.hour, total: h.total }))
      };
    }).sort((a, b) => a.person.localeCompare(b.person));
    res.json({ date, cachedAt: ctx.cachedAt, people });
  } catch (e) {
    console.error('[MGR DAY]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Weeks start Sunday (John, 2026-08-12).
function weekDates(start) {
  const d = new Date(`${start}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setUTCDate(x.getUTCDate() + i);
    return x.toISOString().split('T')[0];
  });
}

app.get('/api/manager/week', requireAuth, requireManager, async (req, res) => {
  const dates = weekDates(req.query.start || azToday());
  try {
    const days = [];
    for (const date of dates) {
      const [all, ctx] = await Promise.all([shiftsOnDate(date), dayContext(date)]);
      days.push({ date, all, ctx });
    }
    const people = ROSTER.map(name => {
      const cells = days.map(({ date, all, ctx }) => {
        const shifts = shiftsOf(all, name);
        const totals = activityFor(name, date, ctx).totals;
        return {
          date,
          minutes: minutesOf(shifts),
          activity: Object.values(totals).reduce((a, b) => a + b, 0),
          openShift: shifts.some(s => !s.ended_at)
        };
      });
      return {
        person: name,
        cells,
        minutes: cells.reduce((n, c) => n + c.minutes, 0),
        activity: cells.reduce((n, c) => n + c.activity, 0)
      };
    }).sort((a, b) => a.person.localeCompare(b.person));
    res.json({ start: dates[0], end: dates[6], dates, people });
  } catch (e) {
    console.error('[MGR WEEK]', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/manager/sync-state', requireAuth, requireManager, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM time_sync_state WHERE key = $1', [SYNC_KEY]);
  res.json(rows[0] || { key: SYNC_KEY, cursor: null, last_run_at: null, last_error: 'never run' });
});

// A real 404 for unknown API routes, so status codes stay meaningful.
app.use('/api', (req, res) => res.status(404).json({ error: 'Unknown endpoint' }));

// Catch-all → SPA. GET only: a method-agnostic app.use() answers stray DELETE/POST
// with HTML and a 200, which makes status codes useless for probing routes.
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`AC Rangers Timeclock running on http://localhost:${PORT}`);
  await initDB();
  if (!stReady()) return console.warn('No ServiceTitan credentials — clocked hours will not sync');
  await syncShifts();
  setInterval(syncShifts, SYNC_MINUTES * 60000);
});
