# Timeclock App — Design & Data Reference

**Status:** Phase 1 built (clock in/out + My Day). Phases 2–5 not started.
**Date:** 2026-08-07, updated 2026-08-12
**Audience:** whoever builds this next (including future-Claude). Assumes no prior knowledge
of the tracker.

> **This is a SEPARATE application** from the HVAC Tracker — its own repo, its own Railway
> service — that **shares the tracker's Postgres database read-only**. See §3.0 before writing
> any code. Do not build this as a page inside the tracker.

---

## 1. What was asked for

Stuart's ask, verbatim in substance:

> An app people put on their phone or open at a URL. They **clock in and clock out**. Every
> time they do, they say **what they did**, and if they were on a job, the **job number**.
> Managers see a **summary of total hours by day/week**, and **approve** by day or week. Then
> **export** the weekly view and the summary view — but see the data and job/explanation of
> what they worked on.

**The refinement that shapes the whole design (John):** the tracker's Dashboard **already
records most of this automatically**. Nobody should retype what the system already knows.
The app should **pre-fill the known work per hour** and only ask people to fill the **gaps** —
the things done outside estimates / invoices / inbound / outbound / new work orders.

### Decisions already made
| Question | Decision |
|---|---|
| Who clocks in | **Office team only** (~22 tracker logins). Not field techs — see §6. |
| Payroll-grade? | **Not yet.** Build accountability-first, but with a **full audit trail from day one** so it can become payroll-grade without a rewrite. |
| How time is captured | **Sessions + hourly breakdown.** Clock in/out defines the hours; within the day, each hour shows auto-tracked activity and accepts manually added tasks. |

---

## 2. How the Dashboard tracks work today

This section exists so the builder knows **exactly where every number comes from** before
writing a line of code. All of it was verified against the current code.

### 2.1 The master data flow

```
ServiceTitan API ─┐
                  ├─► buildScoreboardData(from, to) ─► one JSON blob
our own DB tables ┘                                        │
                                                           ▼
                                        scoreboard_cache  (key: 'scoreboard-master')
                                                           │
                                    sliceScoreboard(master, from, to)  ← in-memory filter
                                                           │
                                              GET /api/scoreboard
                                                           │
                                              Dashboard + Scoreboard pages
```

- **`refreshMasterScoreboard()`** (`server.js`) pulls **`MASTER_FROM = '2026-05-01'` → today**
  and overwrites a **single row** in `scoreboard_cache`.
- **`sliceScoreboard(master, from, to)`** filters that blob **in memory** for any requested
  range. This is why changing the Dashboard's date range is instant — it is not re-querying
  ServiceTitan.
- The master refreshes when its `to_date` is older than today (Arizona), or when forced.

> **Implication for this app:** the per-person, per-timestamp data it needs is **already
> assembled and cached**. The timeclock does not need to call ServiceTitan at all.

### 2.2 What the blob holds per person

From `sliceScoreboard`'s `blank()` shape:

```js
{
  name, role,
  created,    createdJobs[],      // jobs created
  dispatched, dispatchedJobs[],   // jobs dispatched
  callsIn, callsOut, callDetails[],
  estSent,    estSentDetails[],
  audits,                          // count only today
  invoices                         // count only today
}
```

### 2.3 Where each metric actually comes from

| Metric | Origin | How it becomes a person | Timestamp field |
|---|---|---|---|
| **Inbound / outbound calls** | ServiceTitan `/telecom/v2/.../calls` | call's agent id → `employeeMap[empId]` | `createdOn` |
| **Jobs created** | ServiceTitan `/jpm/v2/.../jobs` | `createdById` → `employeeMap` | `createdOn` |
| **Jobs dispatched** | **our** `appointment_dispatchers` table | `dispatcher_id` → `employeeMap` / `STAFF_MAP` | `dispatch_event_date` |
| **Estimates sent** | **our** `tracker_notes` table (the "Mark Sent" action) | `sent_by` | `sent_at` |
| **Audits** | **our** `invoice_audit_tracker` table | `audited_by` | `audited_at` |
| **Invoices** | **our** `invoice_tracker` table | `invoiced_by` | `invoiced_at` |

Note the split: **calls and job-creation come from ServiceTitan**; **dispatches, estimates
sent, audits and invoices are actions your team takes inside this tracker.** The second group
exists nowhere else.

### 2.4 Hourly bucketing — already solved

`buildHourlyFromScoreboard(metric, from, to)` in `public/index.html` converts each event to an
**Arizona hour**:

```js
const utcHour = d.getUTCHours();
const azHour  = (utcHour - 7 + 24) % 24;     // Arizona = UTC-7, no DST
let azDate = d.toISOString().split('T')[0];
if (utcHour < 7) {                            // before 7:00 UTC = previous AZ day
  const prev = new Date(d); prev.setUTCDate(prev.getUTCDate() - 1);
  azDate = prev.toISOString().split('T')[0];
}
dateMap[azDate][azHour]++;
```

**Reuse this exact rule.** Getting it wrong produces the classic +7h bug that has bitten this
codebase before.

### 2.5 The finding that makes this app cheap

`timedEventsFor(metric)` — the function that feeds the hourly chart — currently returns only
**four** streams: `callsIn`, `callsOut`, `jobsCreated`, `jobsDispatched`.

But **estimates sent, audits and invoices already carry per-person timestamps** in their
source tables (`tracker_notes.sent_at`, `invoice_audit_tracker.audited_at`,
`invoice_tracker.invoiced_at`). They are simply collapsed to daily counts today.

> **Extending that one function to all six metrics gives a complete hourly, per-person
> activity feed with zero new data collection.** That feed is the backbone of this app.

**Verified while building Phase 1:** `estSentDetails[]` already carries `sent_at` inside the
cached blob, so estimates need no extra query. `audits` and `invoices` are stored as **daily
counts only** (`server.js` blob rows) — those two are the only metrics that must be read from
their source tables to get an hour.

### 2.6 Identity — connecting a login to a scoreboard person

| Thing | Where | Purpose |
|---|---|---|
| `USERNAME_TO_NAME` | `public/index.html` | tracker login → display name. **This is the join key.** |
| `VALID_USERNAMES` | `public/index.html` | who may log in (a new login needs **both** structures) |
| `STAFF_DETAILS` | `server.js` | ServiceTitan employee id → `{name, role}`; non-null role = "Internal Team" |
| `employeeMap` | `server.js` | ST employees/technicians, 10-minute cache |
| `namesMatch(a, b)` | `public/index.html` | **loose** first+last comparison |

**Names never match exactly across systems.** Always compare with `namesMatch`, never `===`.

### 2.7 Timezone

Arizona is **UTC-7, no DST**.
- Client: `azNow()`, `azTodayStr()`, `azDateStr(iso)`
- Server: `azDateStr(iso)`, `azToday()`
- SQL: a **single** `(col AT TIME ZONE 'America/Phoenix')::date`. The doubled
  `AT TIME ZONE 'UTC' AT TIME ZONE ...` form is a known +7h bug.

### 2.8 Related tables worth knowing

| Table | Contents |
|---|---|
| `daily_metrics` | company-wide daily rollups (jobs created/dispatched, appointments, estimates, audits, invoices) |
| `call_history`, `call_history_hourly` | call counts by day / by hour, company-wide |
| `login_log` | `username`, `logged_in_at` — a weak "who was here" signal, **not** a timeclock |

**There is no ServiceTitan payroll or timesheet integration in this codebase** — verified.
Field techs clock into ServiceTitan's own time clock, which this app does not read.

---

## 3. The app

### 3.0 Architecture — standalone service on a shared database

```
Railway project
├── hvac-tracker   (existing)  ─┐
├── timeclock      (NEW)       ─┼──►  same Postgres
└── Postgres                   ─┘
```

**Why share the database instead of calling the tracker's API:** everything this app needs
(§2) is already assembled in `scoreboard_cache` plus four tracker tables. Splitting the
databases would mean building and maintaining API endpoints and service-to-service auth for
no benefit at this scale.

#### THE ONE RULE

> **This app CREATES and WRITES only its own `time_*` tables.
> Every other table in that database is READ-ONLY. Never INSERT, UPDATE, DELETE, or ALTER
> anything belonging to the tracker.**

That single constraint is what makes sharing a database safe. The tracker's `initDB()` owns
its schema; this app must never migrate or modify it.

#### Connection string — the gotcha

| Where the service lives | `DATABASE_URL` host |
|---|---|
| **Same** Railway project as the tracker | `postgres.railway.internal:5432` (private, fast) |
| A **different** Railway project | the public proxy, e.g. `mainline.proxy.rlwy.net:15967` |

**Put the new service in the same Railway project** and use the internal host.

#### What to copy as the starting skeleton

Copy the shape of **`acr-tracker`** (`C:\Users\arago\acr-tracker`) — a lean standalone
Node + Express + Postgres app — **not** the 14,000-line hvac-tracker. From it you get:
`package.json` (express, pg, cors, dotenv, axios), the `pool` setup with the
`railway.internal` SSL branch, `initDB()`, static `public/`, and the SPA catch-all.

> ⚠️ In the tracker, the catch-all is `app.use((req,res) => res.sendFile(index.html))`, which
> is **method-agnostic** — it answers unmatched `DELETE`/`POST` with HTML and a 200. That makes
> HTTP status codes useless for probing whether a route exists. Scope the catch-all to `GET`,
> and return a real 404 for unknown `/api/*` routes.

#### Reading the tracker's data

One query gets the entire per-person activity blob:

```sql
SELECT data FROM scoreboard_cache WHERE cache_key = 'scoreboard-master';
```

That returns `{ data: [ { name, callDetails[], createdJobs[], dispatchedJobs[],
estSentDetails[], ... } ] }` covering 2026-05-01 → today. Filter in memory by person and date
— exactly as the tracker's `sliceScoreboard()` does.

**Timestamp field per stream** (getting `dispatchedJobs` wrong makes every dispatch vanish
silently — the tracker itself filters on `j.bookedOn || j.dispatchedOn`):

| Stream | Timestamp field in the blob |
|---|---|
| `callDetails[]` | `createdOn` (+ `direction` for in/out) |
| `createdJobs[]` | `createdOn` |
| `dispatchedJobs[]` | **`bookedOn`** (from `appointment_dispatchers.dispatch_event_date`) or **`dispatchedOn`** (ST job history) — *never* `createdOn` |
| `estSentDetails[]` | `sent_at` |

**Freshness:** the tracker refreshes this row every 10 minutes and owns it — this app never
writes it, so the current hour can lag that much. Show the age rather than hiding it.

**Name sources differ.** `sent_by` / `audited_by` / `invoiced_by` hold the *tracker's* display
name (written from `getCurrentUserDisplayName()`), while calls, jobs created and dispatches
carry *ServiceTitan* employee names. Both go through `namesMatch()` — that split is exactly
why it exists.

For the three metrics not carried in the blob's detail arrays, query the source tables
directly (all read-only):

```sql
SELECT sent_by     AS person, sent_at     AS at FROM tracker_notes          WHERE sent_at     BETWEEN $1 AND $2 AND sent_by     IS NOT NULL;
SELECT audited_by  AS person, audited_at  AS at FROM invoice_audit_tracker  WHERE audited_at  BETWEEN $1 AND $2 AND audited_by  IS NOT NULL;
SELECT invoiced_by AS person, invoiced_at AS at FROM invoice_tracker        WHERE invoiced_at BETWEEN $1 AND $2 AND invoiced_by IS NOT NULL;
```

#### The Arizona hour rule — self-contained

The tracker's `buildHourlyFromScoreboard` is not importable, so port it. This is the whole
rule; getting it wrong produces the +7h bug this codebase has hit before:

```js
// Arizona = UTC-7, no DST.
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
  return { azDate, azHour };            // azHour 0-23
}
```

#### Identity and login

The join key from a login to a scoreboard person is the **display name**. Copy
`USERNAME_TO_NAME` from the tracker's `public/index.html` so both apps agree on names, and
copy `namesMatch()` — names never match exactly across systems, so never compare with `===`.

**Decided 2026-08-12 (John): Phase 1 ships with per-person PINs, not username-only.** Each
person picks a 4-digit PIN on first sign-in; it is bcrypt-hashed into `time_users`, and a
signed httpOnly cookie carries the session so the **server** derives who is calling. No
endpoint trusts a person name in a request body.

The reasoning, since it overrides this document's original default: with username-only auth the
server cannot tell who is actually calling, so `time_audit_log` records *claims* rather than
facts. Adding real auth later would not just add a login screen — every week of history
collected beforehand would have to be discarded the moment these hours went near payroll. The
cost of doing it up front was about an hour.

### 3.1 Core idea

```
Clock in ──► defines the hours
                 │
                 ▼
   For each hour of the day:
     ┌──────────────────────────────────────────────┐
     │ AUTO  (from the Dashboard, read-only)        │
     │   6 inbound · 2 jobs created · 1 estimate    │
     ├──────────────────────────────────────────────┤
     │ MANUAL (what the system can't see)           │
     │   + "Warranty paperwork for AMH"   [add]     │
     └──────────────────────────────────────────────┘
                 │
                 ▼
Clock out ──► note + optional job number
```

The auto half is free — it already exists. The manual half is the only thing we ask people
for, and only for work the tracker genuinely cannot see.

### 3.2 Tables

```sql
time_users      username (PK), person_name, pin_hash, created_at, last_login_at

time_entries    id, username, person_name, clock_in, clock_out, source ('web'|'mobile'),
                note, job_number, job_id, created_at, edited_by, edited_at

time_tasks      id, username, person_name, work_date, hour (0-23),
                description, job_number, job_id, minutes, created_at

time_approvals  id, person_name, period_type ('day'|'week'), period_start, period_end,
                approved_by, approved_at, status, note

time_audit_log  id, entity ('entry'|'task'|'approval'), entity_id, action,
                before JSONB, after JSONB, by_person, at
```

`time_audit_log` is not optional. It is the single thing that lets this become payroll-grade
later without a rewrite — and it costs almost nothing to write from day one.

Per house style: add DDL **at the end of `initDB()`**, using `CREATE TABLE IF NOT EXISTS` /
`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

### 3.3 Endpoints

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/auth/users` | roster + who has set a PIN |
| POST | `/api/auth/login` | first call sets the PIN, later calls check it; issues the cookie |
| POST | `/api/auth/logout` | clear the cookie |
| GET | `/api/me` | current session's person |
| POST | `/api/time/clock-in` | start a session |
| POST | `/api/time/clock-out` | end it; `{note, jobNumber, jobId}` |
| GET | `/api/time/status` | am I clocked in? current session + today's total |
| GET | `/api/time/day?person=&date=` | sessions + hourly auto activity + manual tasks |
| POST/PATCH/DELETE | `/api/time/tasks` | manual per-hour entries |
| GET | `/api/time/summary?from=&to=&person=` | totals by day/week for the manager grid |
| POST | `/api/time/approve` | approve a day or a week |
| GET | `/api/time/export?from=&to=&format=csv` | weekly detail + summary |

**The one that matters most:**

```
GET /api/time/activity?person=&date=
```

A **server-side port of `buildHourlyFromScoreboard`, extended to all six metrics** (§2.5),
returning per-AZ-hour counts and details for one person, read straight from the cached master
scoreboard slice. Build this first — everything else hangs off it.

### 3.4 Screens

**1. Clock** — mobile-first, works in a phone browser.
Big **Clock In** / **Clock Out**, a running timer, today's total. On clock-out, ask *"What did
you work on?"* plus an optional job number. Reuse the `/api/jobs/search` type-ahead — it
already searches every job by number, customer or address, ignoring the date filter.

**2. My Day** — sessions along the top; below, one row per hour showing **auto activity
(read-only)** and a **+ add task** control for anything the system missed.

**3. Manager view** — people × days grid with totals, drill-down into any day, and **approve
by day or week**. Useful flags: missing clock-out; an hour clocked in with no activity *and*
no task; a session far longer than usual.

**4. Export** — weekly detail CSV and summary CSV, both including the job numbers and
explanations, per Stuart's ask.

### 3.5 Build phases

| Phase | Scope |
|---|---|
| 1 | Clock in/out + My Day showing auto activity — the core loop, useful on its own |
| 2 | Manual per-hour tasks |
| 3 | Manager summary + approvals |
| 4 | Exports |
| 5 | Mobile polish / add-to-home-screen |

### 3.6 What to copy from the tracker (this is a separate app — nothing is importable)

| Copy | From | Note |
|---|---|---|
| App skeleton | `acr-tracker/server.js` | pool + SSL branch, `initDB()`, static dir, catch-all (scope it to GET) |
| `USERNAME_TO_NAME` | tracker `public/index.html` | login → display name; the join key to scoreboard data |
| `namesMatch()` | tracker `public/index.html` | loose first+last compare |
| AZ helpers | tracker (`azNow`/`azTodayStr`/`azDateStr`) | or just use `azBucket()` in §3.0 |
| Job-number type-ahead | tracker's `GET /api/jobs/search` | **not callable cross-app.** Either re-implement against `jobs_snapshot` (read-only) or have the user type the job number free-form in Phase 1 |

Re-implementing the job search is a few lines — `jobs_snapshot` is in the same database:

```sql
SELECT payload->>'id' AS id, payload->>'jobNumber' AS job_number,
       payload->>'billToName' AS customer, payload->>'locationStreet' AS street
FROM jobs_snapshot
WHERE payload->>'jobNumber' ILIKE $1 OR payload->>'billToName' ILIKE $1
LIMIT 25;
```

---

## 4. Two cautions to design around

**Tracked activity is not a measure of effort.** An hour with no logged actions is not an idle
hour. It could be a meeting, training, one long difficult customer call, or work done in
ServiceTitan that this tracker never sees. The UI must present gaps as **"add what you did"**,
never as "you did nothing", and the manager view should avoid implying that a low-activity
hour is a low-value hour. This matters because managers will approve straight off that screen,
and the number one way a tool like this fails is by quietly becoming a surveillance scoreboard
that people learn to game.

**Auth — resolved as of Phase 1.** The original concern was that the tracker's username-in-
`localStorage` approach has no per-user password and no server-side session, so nothing stops
one person clocking in as another and the audit log records claims rather than facts. Phase 1
therefore ships per-person PINs and a server-side session (see §3.0). Two limits remain worth
knowing:

- **First sign-in claims the PIN.** Whoever signs in as a username first sets its PIN. Everyone
  should sign in once, promptly, and any un-claimed username should be watched.
- **A 4-digit PIN is deterrence, not proof.** It is enough for accountability and for an audit
  trail that survives a payroll conversation. If these hours become the actual payroll input,
  revisit PIN length, lockout after repeated failures, and manager-initiated PIN resets.

---

## 5. Open questions for Stuart

1. **Rounding** — real minutes, or rounded to the nearest 5/15?
2. **Missed clock-outs** — auto-close at a set time, or leave open for a manager to fix?
3. **Overtime / breaks** — does the summary need to separate paid vs unpaid break time?
4. **Approval lock** — once a week is approved, should the employee be blocked from editing?
5. **Retroactive edits** — can someone fix yesterday, or only a manager?
6. **Week start** — Sunday or Monday, for the weekly view and export?

---

## 6. Explicitly out of scope (for now)

- **Field techs.** They clock into ServiceTitan already, and the Dashboard does not track them
  the way it tracks office staff — their work is appointments, not calls and estimates.
  Including them would mean a second, different data source and effectively a second app.
- **Reading or writing ServiceTitan payroll/timesheets.** No integration exists today.
- **GPS / location capture.** Not asked for; adds meaningful privacy and legal weight.
