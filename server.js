require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const crypto       = require('crypto');
const bcrypt       = require('bcryptjs');
const cookieParser = require('cookie-parser');
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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS time_entries (
        id          SERIAL PRIMARY KEY,
        username    TEXT NOT NULL,
        person_name TEXT NOT NULL,
        clock_in    TIMESTAMPTZ NOT NULL,
        clock_out   TIMESTAMPTZ,
        source      TEXT,
        note        TEXT,
        job_number  TEXT,
        job_id      TEXT,
        created_at  TIMESTAMPTZ DEFAULT now(),
        edited_by   TEXT,
        edited_at   TIMESTAMPTZ
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_time_entries_user_in ON time_entries(username, clock_in)`);
    // Only one session may be open per person at a time.
    await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_time_entries_one_open ON time_entries(username) WHERE clock_out IS NULL`);
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
    console.log('DB: time_users, time_entries, time_audit_log ready');
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
        `INSERT INTO time_users (username, person_name, pin_hash, last_login_at)
         VALUES ($1, $2, $3, now())
         ON CONFLICT (username) DO NOTHING`,
        [username, name, hash]
      );
      await audit('user', null, 'pin_set', null, { username, person_name: name }, name);
    } else {
      const ok = await bcrypt.compare(pin, rows[0].pin_hash);
      if (!ok) return res.status(401).json({ error: 'Wrong PIN' });
      await pool.query('UPDATE time_users SET last_login_at = now() WHERE username = $1', [username]);
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

app.get('/api/me', requireAuth, (req, res) => res.json(req.user));

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

async function activityFor(personName, date) {
  const { blob, cachedAt } = await getMaster();
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

  // Audits and invoices are daily counts only in the blob, so their hourly detail
  // comes straight from the source tables.
  const [audits, invoices] = await Promise.all([
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
  audits.rows.filter(r => namesMatch(r.person, personName))
    .forEach(r => push('audits', r.at, r.job_id ? `Job ${r.job_id}` : null));
  invoices.rows.filter(r => namesMatch(r.person, personName))
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
    res.json(await activityFor(req.user.name, date));
  } catch (e) {
    console.error('[ACTIVITY]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── Clock ────────────────────────────────────────────────────────────────────

const isMobile = req => /Mobile|Android|iPhone|iPad/i.test(req.headers['user-agent'] || '');

async function openEntry(username) {
  const { rows } = await pool.query(
    'SELECT * FROM time_entries WHERE username = $1 AND clock_out IS NULL ORDER BY clock_in DESC LIMIT 1',
    [username]
  );
  return rows[0] || null;
}

async function minutesOn(username, date) {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(clock_out, now()) - clock_in))), 0) / 60 AS mins
       FROM time_entries
      WHERE username = $1 AND (clock_in AT TIME ZONE 'America/Phoenix')::date = $2::date`,
    [username, date]
  );
  return Math.round(Number(rows[0]?.mins || 0));
}

app.post('/api/time/clock-in', requireAuth, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'No database connection' });
  try {
    if (await openEntry(req.user.username)) {
      return res.status(409).json({ error: 'You are already clocked in' });
    }
    const { rows } = await pool.query(
      `INSERT INTO time_entries (username, person_name, clock_in, source)
       VALUES ($1, $2, now(), $3) RETURNING *`,
      [req.user.username, req.user.name, isMobile(req) ? 'mobile' : 'web']
    );
    await audit('entry', rows[0].id, 'clock_in', null, rows[0], req.user.name);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/time/clock-out', requireAuth, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'No database connection' });
  try {
    const before = await openEntry(req.user.username);
    if (!before) return res.status(409).json({ error: 'You are not clocked in' });

    const note = (req.body?.note || '').trim() || null;
    const jobNumber = (req.body?.jobNumber || '').trim() || null;
    const { rows } = await pool.query(
      `UPDATE time_entries SET clock_out = now(), note = $2, job_number = $3
        WHERE id = $1 RETURNING *`,
      [before.id, note, jobNumber]
    );
    await audit('entry', before.id, 'clock_out', before, rows[0], req.user.name);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/time/status', requireAuth, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'No database connection' });
  try {
    const date = azToday();
    const [open, mins] = await Promise.all([openEntry(req.user.username), minutesOn(req.user.username, date)]);
    res.json({ date, open, minutesToday: mins });
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
    const [sessions, activity, mins] = await Promise.all([
      pool.query(
        `SELECT * FROM time_entries
          WHERE username = $1 AND (clock_in AT TIME ZONE 'America/Phoenix')::date = $2::date
          ORDER BY clock_in`,
        [req.user.username, date]
      ),
      activityFor(req.user.name, date),
      minutesOn(req.user.username, date)
    ]);
    res.json({ date, person: req.user.name, sessions: sessions.rows, minutesTotal: mins, activity });
  } catch (e) {
    console.error('[DAY]', e.message);
    res.status(500).json({ error: e.message });
  }
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
});
