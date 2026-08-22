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
    // One note per person per hour — what the tracker could not see. Written by the
    // person whose hour it is; managers read them.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS time_notes (
        id          SERIAL PRIMARY KEY,
        username    TEXT NOT NULL,
        person_name TEXT NOT NULL,
        work_date   DATE NOT NULL,
        hour        INTEGER NOT NULL,
        note        TEXT NOT NULL,
        created_at  TIMESTAMPTZ DEFAULT now(),
        updated_at  TIMESTAMPTZ DEFAULT now(),
        UNIQUE (username, work_date, hour)
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_time_notes_date ON time_notes(work_date)`);
    await pool.query(`ALTER TABLE time_notes ADD COLUMN IF NOT EXISTS start_min INTEGER`);
    await pool.query(`ALTER TABLE time_notes ADD COLUMN IF NOT EXISTS end_min INTEGER`);
    await pool.query(`ALTER TABLE time_notes ADD COLUMN IF NOT EXISTS category TEXT`);
    await pool.query(`ALTER TABLE time_notes ADD COLUMN IF NOT EXISTS job_number TEXT`);
    await pool.query(`UPDATE time_notes SET category = 'other' WHERE category IS NULL`);
    // A note used to belong to an hour; now it spans one. The old rows become the
    // hour they were written on, and several notes may now share a day.
    const { rows: hasHour } = await pool.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name = 'time_notes' AND column_name = 'hour'");
    if (hasHour.length) {
      await pool.query('UPDATE time_notes SET start_min = hour * 60, end_min = hour * 60 + 60 WHERE start_min IS NULL');
      await pool.query('ALTER TABLE time_notes DROP CONSTRAINT IF EXISTS time_notes_username_work_date_hour_key');
      await pool.query('ALTER TABLE time_notes DROP COLUMN hour');
    }
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
    // The shared manager account ships with its PIN already set, so nobody claims
    // it by being first. DO NOTHING, so changing it later is not undone on restart.
    for (const u of MANAGER_ONLY) {
      await pool.query(
        `INSERT INTO time_users (username, person_name, pin_hash, is_manager)
         VALUES ($1, $2, $3, TRUE) ON CONFLICT (username) DO NOTHING`,
        [u, USERNAME_TO_NAME[u], await bcrypt.hash('2026', 10)]
      );
    }
    console.log('DB: time_users, time_st_shifts, time_notes, time_sync_state, time_audit_log ready');
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
  'acranne':            'Anne Frac',
  // Punching in ServiceTitan but absent from the tracker roster (added 2026-08-13).
  // These usernames are ours, not the tracker's — no scoreboard row matches them yet,
  // so they show hours with no activity until the tracker knows them too.
  'acsarah':            'Sarah Lewis',
  'acabrielle':         'Abrielle Uyehara',
  'acluis':             'Luis Angel Orozco',
  'aceric':             'Eric Robinson',
  // Sign-ins that only ever see the team views. They match nobody in ServiceTitan
  // or the tracker, so they have no hours of their own and no My Calendar.
  'ACRManager':         'Manager',
  'ACRStuart':          'Stuart',
  'ACRBradley':         'Bradley'
};

const MANAGER_ONLY = new Set(['ACRManager', 'ACRStuart', 'ACRBradley']);

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
const MANAGERS = new Set(['johnacr', ...MANAGER_ONLY]);

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

// First sign-in for a username sets its PIN; after that the PIN is required.
app.post('/api/auth/login', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'No database connection' });
  const username = resolveUsername(req.body?.username);
  const pin = String(req.body?.pin || '');
  if (!/^\d{4}$/.test(pin)) return res.status(400).json({ error: 'PIN must be 4 digits' });
  if (!username) return res.status(401).json({ error: 'Wrong username or PIN' });

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
      if (!ok) return res.status(401).json({ error: 'Wrong username or PIN' });
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
  res.json({
    ...req.user,
    isManager: !!rows[0]?.is_manager,
    managerOnly: MANAGER_ONLY.has(req.user.username)
  });
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

const METRICS = ['callsIn', 'callsOut', 'jobsCreated', 'jobsDispatched', 'estSent', 'audits', 'invoices', 'warranty'];

// Weights set by John, revised 2026-08-13. Scored here and only here, so a total on
// the team list can never disagree with the hour it came from.
const POINTS = {
  callsIn:        2,
  callsOut:       0.5,
  jobsCreated:    2,
  jobsDispatched: 3,
  estSent:        6,
  audits:         2,
  invoices:       2,
  warranty:       1.75
};

const pointsOf = counts => METRICS.reduce((n, m) => n + (counts[m] || 0) * POINTS[m], 0);

// Everything a day needs that is the same for all 22 people, fetched once. Without
// this a manager week view would fire 300+ queries to answer one screen.
async function dayContext(date) {
  const [{ blob, cachedAt }, audits, invoices, warranty] = await Promise.all([
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
          AND (invoiced_at AT TIME ZONE 'America/Phoenix')::date = $1::date`, [date]),
    // Warranty is counted on the day the call happened — call_date — not the day it
    // was tagged, so someone catching up on yesterday still lands in yesterday.
    pool.query(
      `SELECT added_by AS person, call_id, job_number, call_date
         FROM call_warranty_jobs
        WHERE added_by IS NOT NULL AND call_date = $1::date`, [date])
  ]);
  return { date, blob, cachedAt, audits: audits.rows, invoices: invoices.rows, warranty: warranty.rows };
}

function activityFor(personName, date, ctx) {
  const { blob, cachedAt } = ctx;
  const row = (blob?.data || []).find(r => r.name && r.name !== 'TOTAL' && namesMatch(r.name, personName));

  const events = [];
  const push = (kind, ts, label, extra) => {
    if (!ts) return;
    const { azDate, azHour } = azBucket(ts);
    if (azDate !== date) return;
    events.push({ kind, hour: azHour, at: new Date(ts).toISOString(), label: label || null, ...extra });
  };

  if (row) {
    (row.callDetails || []).forEach(c => {
      const outbound = (c.direction || '').toLowerCase() === 'outbound';
      push(outbound ? 'callsOut' : 'callsIn', c.createdOn,
           c.jobNumber ? `Job #${c.jobNumber}` : (outbound ? c.to : c.from) || null,
           c.duration ? { dur: c.duration } : null);
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

  // The tag carries only a date, so the hour comes from the call it was attached to.
  // Noon is the fallback for a call too old to be in the blob — a warranty placed
  // roughly is better than one silently dropped from the day's count.
  const callTimes = new Map((row?.callDetails || []).map(c => [String(c.id), c.createdOn]));
  ctx.warranty.filter(r => namesMatch(r.person, personName)).forEach(r => {
    const at = callTimes.get(String(r.call_id)) || `${date}T19:00:00.000Z`;
    push('warranty', at, r.job_number ? `Job #${r.job_number}` : null);
  });

  const hours = Array.from({ length: 24 }, (_, h) => {
    const evs = events.filter(e => e.hour === h).sort((a, b) => new Date(a.at) - new Date(b.at));
    const metrics = {};
    METRICS.forEach(m => { metrics[m] = evs.filter(e => e.kind === m).length; });
    return {
      hour: h,
      total: evs.length,
      points: pointsOf(metrics),
      metrics,
      details: evs.map(({ kind, at, label, dur }) => ({ kind, at, label, dur }))
    };
  });

  const totals = {};
  METRICS.forEach(m => { totals[m] = events.filter(e => e.kind === m).length; });

  return {
    person: row?.name || personName,
    matchedScoreboard: !!row,
    date,
    cachedAt,
    hours,
    totals,
    points: pointsOf(totals)
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

// No timeout means a dead socket waits forever, which is exactly how the sync
// wedged: the run never ended, so the guard below never released.
const ST_TIMEOUT = 25000;

const stReady = () => !!(process.env.ST_CLIENT_ID && process.env.ST_CLIENT_SECRET && process.env.ST_TENANT_ID);
const tid = () => process.env.ST_TENANT_ID;

let stToken = { token: null, expiresAt: 0 };

async function getToken() {
  if (stToken.token && Date.now() < stToken.expiresAt) return stToken.token;
  const res = await axios.post(
    process.env.ST_AUTH_URL,
    `grant_type=client_credentials&client_id=${process.env.ST_CLIENT_ID}&client_secret=${process.env.ST_CLIENT_SECRET}`,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: ST_TIMEOUT }
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
      headers: { Authorization: `Bearer ${token}`, 'ST-App-Key': process.env.ST_APP_KEY },
      timeout: ST_TIMEOUT
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

const MAX_PAGES = 50;

// `capped` says we stopped early rather than ran out — the caller has to resume from
// where it got to, or it silently loses everything past the cap.
async function getAllPages(endpoint, maxPages = MAX_PAGES) {
  let page = 1, items = [], hasMore = true;
  while (hasMore) {
    const data = await stGet(`${endpoint}&page=${page}`);
    const batch = data.data || [];
    items = items.concat(batch);
    hasMore = data.hasMore && batch.length > 0;
    page++;
    if (page > maxPages) return { items, capped: hasMore };
  }
  return { items, capped: false };
}

const LOOKUP_TTL = 3600 * 1000;
let employeeMapCache = { data: null, at: 0 };
let activityTypeCache = { data: null, at: 0 };

async function getEmployeeMap() {
  if (employeeMapCache.data && Date.now() - employeeMapCache.at < LOOKUP_TTL) return employeeMapCache.data;
  const map = {};
  (await getAllPages(`/settings/v2/tenant/${tid()}/employees?pageSize=200&active=True`)).items
    .forEach(e => { if (e.id && e.name) map[e.id] = e.name; });
  employeeMapCache = { data: map, at: Date.now() };
  return map;
}

// Activity types are the punch labels: Working, Meal, Training, Sick, Driving…
async function getActivityTypes() {
  if (activityTypeCache.data && Date.now() - activityTypeCache.at < LOOKUP_TTL) return activityTypeCache.data;
  const map = {};
  (await getAllPages(`/timesheets/v2/tenant/${tid()}/activity-types?pageSize=200`)).items
    .forEach(t => { if (t.id) map[t.id] = t.code || null; });
  activityTypeCache = { data: map, at: Date.now() };
  return map;
}

// A meal break is clocked like any other activity but is not worked time, so it is
// stored honestly and excluded when hours are totalled.
const UNPAID_CODES = new Set(['Meal']);

// ServiceTitan spells a few people differently from the tracker roster, and
// namesMatch() only bridges first+last. These are the ones it cannot reach.
const ST_NAME_ALIASES = {
  'Anne Frac-Roque': 'Anne Frac',
  'Edgar Pereyra':   'Edgar Peraya'
};

const SYNC_KEY = 'st_timesheet_activities';
const SYNC_MINUTES = 5;
const BACKFILL_DAYS = 60;

// One sync at a time — but a lock with no expiry is just a deadlock waiting to
// happen. A run still holding it after this long is treated as dead and replaced;
// that is strictly better than never syncing again.
//
// Well clear of the 5-minute tick on purpose: a backfill pass can legitimately run
// for minutes, and declaring it stuck would start a second one alongside it.
const SYNC_LOCK_MS = 15 * 60 * 1000;
let syncStartedAt = 0;
const syncStuck = () => syncStartedAt > 0 && Date.now() - syncStartedAt > SYNC_LOCK_MS;
const syncRunning = () => syncStartedAt > 0 && !syncStuck();

// `from` forces a pull by creation date over an explicit window, ignoring the cursor
// — that is what makes a manual refresh able to recover a stalled or wrong cursor.
async function syncShifts({ from = null } = {}) {
  if (!pool) return { skipped: 'no-database' };
  if (!stReady()) return { skipped: 'no-credentials' };
  if (syncRunning()) return { skipped: 'running' };
  if (syncStuck()) console.error(`[ST SYNC] previous run stuck for ${Math.round((Date.now() - syncStartedAt) / 60000)} min — starting a new one`);
  syncStartedAt = Date.now();
  const runStart = new Date();
  let since = null;

  try {
    // Inside the try: a failure reading the cursor used to reject out of the boot
    // callback before setInterval ran, which killed the sync until a restart.
    const { rows } = await pool.query('SELECT cursor FROM time_sync_state WHERE key = $1', [SYNC_KEY]);
    since = from ? null : rows[0]?.cursor;
    const [emp, types] = await Promise.all([getEmployeeMap(), getActivityTypes()]);
    // There is no shift-date filter on this endpoint, only created*/modified*, so the
    // two jobs need two different queries.
    //
    // First load asks by CREATION date: a punch is created when someone clocks in, so
    // that tracks the shifts we actually want. Asking by modification date instead
    // drags in every ancient record caught by a bulk edit — this tenant has one on
    // 2026-07-30 dense enough that a modified-walk advanced 32 seconds per 10k rows.
    //
    // After that, modification date is the right axis: it is the only one that catches
    // a punch edited after the fact.
    //
    // Either way sort matches the filter. The default id order walks from the oldest
    // record forward, so a cap lands thousands of rows short of today.
    const createdFrom = from || new Date(Date.now() - BACKFILL_DAYS * 86400000).toISOString();
    const window = since
      ? `sort=ModifiedOn&modifiedOnOrAfter=${since.toISOString()}`
      : `sort=CreatedOn&createdOnOrAfter=${createdFrom}`;

    const { items: all, capped } = await getAllPages(
      `/timesheets/v2/tenant/${tid()}/activities?pageSize=200&${window}`
    );
    // The endpoint takes no employeeType parameter, and most of what it returns is
    // technician job time. The office team is the Employee half.
    const items = all.filter(a => a.employeeType === 'Employee');

    for (const it of items) {
      const minutes = it.startTime && it.endTime
        ? Math.round((new Date(it.endTime) - new Date(it.startTime)) / 60000)
        : null;
      const stName = emp[it.employeeId] || null;
      // GPS is explicitly out of scope for this app, so the coordinates ST returns
      // are dropped here rather than stored and forgotten about.
      const { startCoordinate, endCoordinate, ...rest } = it;
      await pool.query(
        `INSERT INTO time_st_shifts
           (st_id, st_employee_id, person_name, started_at, ended_at, minutes, timesheet_code, raw, synced_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
         ON CONFLICT (st_id) DO UPDATE SET
           st_employee_id = EXCLUDED.st_employee_id, person_name = EXCLUDED.person_name,
           started_at = EXCLUDED.started_at, ended_at = EXCLUDED.ended_at,
           minutes = EXCLUDED.minutes, timesheet_code = EXCLUDED.timesheet_code,
           raw = EXCLUDED.raw, synced_at = now()`,
        [it.id, it.employeeId, ST_NAME_ALIASES[stName] || stName, it.startTime, it.endTime || null,
         minutes, types[it.activityTypeId] || null, JSON.stringify(rest)]
      );
    }

    // Caught up: overlap the cursor slightly so a punch edited mid-run is not skipped.
    // Still catching up: resume from the last record actually seen, never past it — but
    // always at least a second on, or a block of records sharing one modifiedOn would
    // re-fetch itself forever.
    const lastSeen = all.reduce((m, a) => (a.modifiedOn > m ? a.modifiedOn : m), '');
    const cursor = capped && lastSeen
      ? new Date(Math.max(new Date(lastSeen).getTime(), (since?.getTime() || 0) + 1000))
      : new Date(runStart.getTime() - 5 * 60000);

    await pool.query(
      `INSERT INTO time_sync_state (key, cursor, last_run_at, last_error)
       VALUES ($1, $2, now(), NULL)
       ON CONFLICT (key) DO UPDATE SET cursor = EXCLUDED.cursor, last_run_at = now(), last_error = NULL`,
      [SYNC_KEY, cursor]
    );
    await audit('sync', null, 'st_shifts', null, { count: items.length, scanned: all.length, since, capped }, 'system');
    console.log(`[ST SYNC] ${items.length} office punches (of ${all.length} activities) ` +
                (since ? `modified since ${since.toISOString()}` : `created in the last ${BACKFILL_DAYS} days`) +
                (capped ? ` — backlog, resuming at ${cursor.toISOString()}` : ''));

    // A backlog would otherwise take one 10-minute tick per 10k records to clear.
    if (capped) setTimeout(() => syncShifts(), 5000);
    return { saved: items.length, scanned: all.length, capped };
  } catch (e) {
    const msg = e.response ? `${e.response.status} ${e.response.data?.title || ''}`.trim() : e.message;
    try {
      await pool.query(
        `INSERT INTO time_sync_state (key, cursor, last_run_at, last_error)
         VALUES ($1, NULL, now(), $2)
         ON CONFLICT (key) DO UPDATE SET last_run_at = now(), last_error = EXCLUDED.last_error`,
        [SYNC_KEY, msg]
      );
    } catch { /* the database is the thing that failed; the log is all that is left */ }
    console.error('[ST SYNC]', msg);
    return { error: msg };
  } finally {
    syncStartedAt = 0;
  }
}

// The timer stopped firing once already and nothing noticed for four days, so the
// screens that read this data also nudge it: if the last run is stale, kick one off
// in the background. Requests are the one heartbeat we can rely on.
const STALE_MINUTES = 7;
let lastKick = 0;

async function nudgeSync() {
  if (Date.now() - lastKick < 60000) return;
  lastKick = Date.now();
  try {
    const { rows } = await pool.query('SELECT last_run_at FROM time_sync_state WHERE key = $1', [SYNC_KEY]);
    const last = rows[0]?.last_run_at;
    if (!last || Date.now() - new Date(last).getTime() > STALE_MINUTES * 60000) {
      syncShifts().catch(e => console.error('[ST SYNC] nudge failed:', e.message));
    }
  } catch { /* never let a stale check break the page that triggered it */ }
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

// An unclosed punch on a past day is a missed clock-out. On today it is just
// someone still at work, which is not something to flag a manager about.
const missedClockOut = (shifts, date) => date < azToday() && shifts.some(s => !s.ended_at);
// ServiceTitan gives an open punch no end, so it has no duration. On today that just
// means still working and the time so far counts; on a past day it is a missed
// clock-out, where running the clock to now would invent days of work out of nothing.
function shiftMinutes(s) {
  if (UNPAID_CODES.has(s.timesheet_code)) return 0;
  if (s.minutes != null) return s.minutes;
  if (!s.started_at || azBucket(s.started_at).azDate !== azToday()) return 0;
  return Math.max(0, Math.round((Date.now() - new Date(s.started_at)) / 60000));
}

const minutesOf = shifts => shifts.reduce((n, s) => n + shiftMinutes(s), 0);

// ─── Hourly notes ─────────────────────────────────────────────────────────────
//
// What the tracker could not see. A blank hour is not an idle hour, so this exists
// to let people say what they were doing — never to make them justify themselves.

async function notesOnDate(date) {
  const { rows } = await pool.query(
    `SELECT id, person_name, start_min, end_min, note, category, job_number
       FROM time_notes WHERE work_date = $1::date ORDER BY start_min`, [date]
  );
  return rows;
}

const notesOf = (rows, personName) =>
  rows.filter(r => namesMatch(r.person_name, personName))
      .map(({ id, start_min, end_min, note, category, job_number }) =>
        ({ id, start_min, end_min, note, category, job_number }));

// Everything one Arizona day needs, fetched once and then sliced per person — the
// same reason dayContext() exists. A week is 7 of these, not 7 x 25 queries.
async function dayBundle(date) {
  const [shifts, ctx, notes] = await Promise.all([shiftsOnDate(date), dayContext(date), notesOnDate(date)]);
  return { date, shifts, ctx, notes };
}

function personOn(bundle, personName) {
  const shifts = shiftsOf(bundle.shifts, personName);
  return {
    date: bundle.date,
    shifts,
    minutes: minutesOf(shifts),
    openShift: missedClockOut(shifts, bundle.date),
    notes: notesOf(bundle.notes, personName),
    activity: activityFor(personName, bundle.date, bundle.ctx)
  };
}

async function personWeek(personName, start) {
  const dates = weekDates(start);
  // The seven days do not depend on each other, so fetching them one after another
  // just multiplied the wait by seven.
  const bundles = await Promise.all(dates.map(dayBundle));
  const days = bundles.map(b => personOn(b, personName));
  return {
    person: personName,
    start: dates[0],
    end: dates[6],
    dates,
    days,
    minutes: days.reduce((n, d) => n + d.minutes, 0)
  };
}

// Times come in as minutes from midnight, Arizona, on the quarter hour.
const QUARTER = 15;
const CATEGORIES = new Set(['admin', 'meeting', 'other']);

function validSpan(start, end) {
  if (!Number.isInteger(start) || !Number.isInteger(end)) return 'Pick a start and end time';
  if (start % QUARTER || end % QUARTER) return 'Times must land on a quarter hour';
  if (start < 0 || end > 24 * 60) return 'Times must be within the day';
  if (end <= start) return 'The end has to come after the start';
  return null;
}

// The person comes from the session, so a note can only ever be written onto the
// author's own timesheet, whatever the body claims.
app.put('/api/time/notes', requireAuth, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'No database connection' });
  const id = req.body?.id ? Number(req.body.id) : null;
  const date = String(req.body?.date || '');
  const start = Number(req.body?.start);
  const end = Number(req.body?.end);
  const note = String(req.body?.note || '').trim();
  const category = String(req.body?.category || 'other').toLowerCase();
  const jobNumber = String(req.body?.jobNumber || '').trim() || null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'Bad date' });
  const bad = validSpan(start, end);
  if (bad) return res.status(400).json({ error: bad });
  if (!CATEGORIES.has(category)) return res.status(400).json({ error: 'Pick a category' });
  if (!note) return res.status(400).json({ error: 'Give it a title' });

  try {
    if (id) {
      const { rows: before } = await pool.query(
        'SELECT * FROM time_notes WHERE id = $1 AND username = $2', [id, req.user.username]
      );
      if (!before.length) return res.status(404).json({ error: 'That note is not yours' });
      const { rows } = await pool.query(
        `UPDATE time_notes SET start_min = $2, end_min = $3, note = $4,
                category = $5, job_number = $6, updated_at = now()
          WHERE id = $1 RETURNING *`,
        [id, start, end, note, category, jobNumber]
      );
      await audit('note', id, 'edit', before[0], rows[0], req.user.name);
      return res.json(rows[0]);
    }

    const { rows } = await pool.query(
      `INSERT INTO time_notes
         (username, person_name, work_date, start_min, end_min, note, category, job_number)
       VALUES ($1, $2, $3::date, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.username, req.user.name, date, start, end, note, category, jobNumber]
    );
    await audit('note', rows[0].id, 'add', null, rows[0], req.user.name);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/time/notes', requireAuth, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'No database connection' });
  try {
    const { rows } = await pool.query(
      'DELETE FROM time_notes WHERE id = $1 AND username = $2 RETURNING *',
      [Number(req.body?.id), req.user.username]
    );
    if (!rows.length) return res.status(404).json({ error: 'That note is not yours' });
    await audit('note', rows[0].id, 'delete', rows[0], null, req.user.name);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/time/day', requireAuth, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'No database connection' });
  const date = req.query.date || azToday();
  if (req.query.person && !namesMatch(req.query.person, req.user.name)) {
    return res.status(403).json({ error: 'You can only view your own day' });
  }
  try {
    res.json({ person: req.user.name, ...personOn(await dayBundle(date), req.user.name) });
  } catch (e) {
    console.error('[DAY]', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/time/week', requireAuth, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'No database connection' });
  try {
    res.json(await personWeek(req.user.name, req.query.start || azToday()));
  } catch (e) {
    console.error('[WEEK]', e.message);
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

// A manager's own hours are their business, not part of the team grid they are
// reviewing. They still see them in My Day.
const teamFor = viewer => ROSTER.filter(name => !namesMatch(name, viewer));

// The tracker tags its office staff with a role — Ranger, Rangerette, Red Ranger.
// That tag is the same list John reviews on the Dashboard, so it decides who the
// manager views show by default; a second hand-kept list would only drift from it.
const EXTRA_TEAM = ['Sarah Lewis'];      // punches in ST, has no tracker row, so no role
const EXCLUDE_TEAM = ['Angel Pacaldo'];  // role-tagged in the tracker, not reviewed here

function teamRoles(blob) {
  const roles = new Map();
  (blob?.data || []).forEach(r => {
    if (r.name && r.name !== 'TOTAL' && r.role) roles.set(r.name.trim(), r.role);
  });
  EXTRA_TEAM.forEach(n => { if (!roles.has(n)) roles.set(n, null); });
  EXCLUDE_TEAM.forEach(x => {
    for (const known of roles.keys()) if (namesMatch(known, x)) roles.delete(known);
  });
  return roles;
}

function teamStatus(roles, name) {
  for (const [known, role] of roles) if (namesMatch(known, name)) return { onTeam: true, role };
  return { onTeam: false, role: null };
}

app.get('/api/manager/day', requireAuth, requireManager, async (req, res) => {
  const date = req.query.date || azToday();
  nudgeSync();
  try {
    const bundle = await dayBundle(date);
    // No scoreboard row means no role tags, and filtering on them would empty the
    // list. Hours are unaffected, so show everyone and say the activity is missing.
    const haveActivity = !!bundle.ctx.blob;
    const roles = teamRoles(bundle.ctx.blob);
    const people = teamFor(req.user.name).map(name => {
      const { onTeam, role } = teamStatus(roles, name);
      if (haveActivity && !onTeam) return null;
      const d = personOn(bundle, name);
      return {
        person: name,
        role,
        onTeam,
        shifts: d.shifts,
        minutes: d.minutes,
        openShift: d.openShift,
        notes: d.notes,
        activity: d.activity.totals,
        points: d.activity.points,
        hours: d.activity.hours.map(h => ({ hour: h.hour, total: h.total, points: h.points }))
      };
    }).filter(Boolean).sort((a, b) => a.person.localeCompare(b.person));
    res.json({ date, cachedAt: bundle.ctx.cachedAt, activityAvailable: haveActivity, people });
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

// Clearing the row is the reset: the sign-in flow already treats an unknown person
// as a first sign-in and asks them to choose a PIN. Nobody ever learns the old one,
// including the manager doing the reset.
app.post('/api/manager/reset-pin', requireAuth, requireManager, async (req, res) => {
  const person = String(req.body?.person || '');
  const username = Object.keys(USERNAME_TO_NAME).find(u => namesMatch(USERNAME_TO_NAME[u], person));
  if (!username) return res.status(404).json({ error: 'Unknown person' });

  // The shared manager account would be claimable by anyone until the next restart.
  if (MANAGER_ONLY.has(username)) {
    return res.status(403).json({ error: 'A shared manager PIN cannot be reset here' });
  }

  try {
    const { rows } = await pool.query(
      'DELETE FROM time_users WHERE username = $1 RETURNING username, person_name, created_at, last_login_at',
      [username]
    );
    if (!rows.length) return res.json({ person: USERNAME_TO_NAME[username], alreadyUnset: true });
    await audit('user', null, 'pin_reset', rows[0], null, req.user.name);
    res.json({ person: rows[0].person_name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// One person's day, with the full per-hour metric detail the team list omits.
app.get('/api/manager/person-day', requireAuth, requireManager, async (req, res) => {
  const date = req.query.date || azToday();
  const person = teamFor(req.user.name).find(n => namesMatch(n, req.query.person || ''));
  if (!person) return res.status(404).json({ error: 'Unknown person' });
  try {
    const bundle = await dayBundle(date);
    res.json({ person, ...personOn(bundle, person) });
  } catch (e) {
    console.error('[MGR PERSON DAY]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// One person's week, drawn as a calendar. The roster comes with it so the picker
// does not need a second round trip.
app.get('/api/manager/person-week', requireAuth, requireManager, async (req, res) => {
  try {
    const { blob } = await getMaster();
    const roles = teamRoles(blob);
    const team = teamFor(req.user.name)
      .filter(n => !blob || teamStatus(roles, n).onTeam)
      .sort((a, b) => a.localeCompare(b));
    const person = team.find(n => namesMatch(n, req.query.person || '')) || team[0];
    if (!person) return res.status(404).json({ error: 'Unknown person' });
    res.json({
      ...await personWeek(person, req.query.start || azToday()),
      role: teamStatus(roles, person).role, team
    });
  } catch (e) {
    console.error('[MGR PERSON WEEK]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Pull a window again by creation date, cursor be damned. This is the way back from
// a stalled or wrong cursor without a redeploy.
app.post('/api/manager/resync', requireAuth, requireManager, async (req, res) => {
  const start = weekDates(req.body?.start || azToday())[0];
  try {
    // Arizona midnight on the Sunday, so a week means that week.
    const result = await syncShifts({ from: `${start}T07:00:00.000Z` });
    if (result.skipped === 'no-credentials') {
      return res.status(503).json({ error: 'ServiceTitan is not connected on this server' });
    }
    if (result.skipped === 'no-database') {
      return res.status(503).json({ error: 'No database connection' });
    }
    if (result.skipped) return res.status(409).json({ error: 'A sync is already running' });
    if (result.error) return res.status(502).json({ error: result.error });
    await audit('sync', null, 'manual_resync', null, { start, ...result }, req.user.name);
    res.json({ start, ...result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/manager/sync-state', requireAuth, requireManager, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM time_sync_state WHERE key = $1', [SYNC_KEY]);
  res.json({
    ...(rows[0] || { key: SYNC_KEY, cursor: null, last_run_at: null, last_error: null }),
    configured: stReady()
  });
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
  // Arm the timer BEFORE the first run. The other way round, a throw on boot took
  // the recurring sync with it and hours quietly stopped updating for four days.
  setInterval(() => syncShifts().catch(e => console.error('[ST SYNC] tick failed:', e.message)), SYNC_MINUTES * 60000);
  syncShifts().catch(e => console.error('[ST SYNC] first run failed:', e.message));
});
