# AC Rangers Timeclock — Claude Development Guide

## What this is

A **timesheet viewer** for the AC Rangers **office team** (~22 people — CSRs, dispatch,
estimating). **Nobody clocks in here** — the team already punches in ServiceTitan, and this
app reads those hours. Against each hour it **shows what they already did** (pulled
automatically from the HVAC Tracker's Dashboard data). Managers see a day and week grid per
person, laying hours and activity side by side.

Two sources, neither of them us:

```
ServiceTitan  Payroll → Timesheets ──►  hours    (time_st_shifts, synced every 10 min)
HVAC Tracker  scoreboard_cache     ──►  activity (read live, never written)
```

**Read `TIMECLOCK-APP-PLAN.md` first — it is the spec.** It documents where every number comes
from and what to build in what order.

---

## THE ONE RULE

This app shares the **HVAC Tracker's Postgres database**.

> **CREATE and WRITE only `time_*` tables. Every other table is READ-ONLY.
> Never INSERT, UPDATE, DELETE, or ALTER a tracker table.**

The tracker owns its schema through its own `initDB()`. Breaking this rule can corrupt live
dispatch and billing data. Tables this app **reads**: `scoreboard_cache`, `tracker_notes`,
`invoice_tracker`, `invoice_audit_tracker`, `appointment_dispatchers`, `jobs_snapshot`.

---

## Tech stack

- **Backend:** Node + Express (CommonJS), `pg`, one `server.js`
- **Frontend:** vanilla JS + HTML/CSS, no framework, no build step
- **DB:** the tracker's PostgreSQL on Railway (shared, read-only except `time_*`)
- **Host:** Railway, **same project as hvac-tracker** so `DATABASE_URL` can use
  `postgres.railway.internal:5432`. A different project forces the slower public proxy URL.
- Skeleton copied from `acr-tracker` (lean standalone app), **not** the 14k-line hvac-tracker.

---

## Traps that will bite you

- **Arizona time is UTC-7, no DST.** Use `azBucket()` in `server.js` verbatim.
  In SQL use a **single** `(col AT TIME ZONE 'America/Phoenix')::date` — the doubled
  `AT TIME ZONE 'UTC' AT TIME ZONE ...` form is a known +7h bug.
- **Names never match exactly across systems.** Always compare with `namesMatch()`
  (loose first+last), never `===`.
- **Dispatch timestamps are `bookedOn` or `dispatchedOn`, never `createdOn`.** In the
  scoreboard blob, `dispatchedJobs[]` carries `bookedOn` (from
  `appointment_dispatchers.dispatch_event_date`) or `dispatchedOn` (from ST job history).
  Reading `createdOn` there makes every dispatch silently vanish.
- **`audits` and `invoices` are daily counts only in the blob** — their hourly detail must come
  from `invoice_audit_tracker` / `invoice_tracker` directly.
- **Scope the SPA catch-all to GET.** The tracker uses `app.use(...)`, which answers *any*
  unmatched method — including DELETE — with HTML and a **200**. That makes HTTP status codes
  useless for checking whether a route exists. Return a real 404 for unknown `/api/*`.
- **`fetch()` does not throw on 400/500.** Always check `res.ok`, or failures show as success.
  This exact bug hid a broken feature in the tracker for a full day.
- **New DDL goes at the END of `initDB()`**, using `CREATE TABLE IF NOT EXISTS` /
  `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
- **Office hours are `timesheets/v2/activities`, NOT `payroll/v2/non-job-timesheets`.** The
  payroll one is the obvious-looking endpoint and holds only technician punches — the office
  team's last entry there was 2025-01-15. Filter `employeeType === 'Employee'` client-side.
- **ServiceTitan has no shift-date filter.** Its only date params are `created*` / `modified*`,
  so the first load asks `createdOnOrAfter` (a punch is created at clock-in) and every sync
  after asks `modifiedOnOrAfter` (the only axis that catches a later edit). Always set `sort`
  to match the filter — the default id order walks from the oldest record forward and caps out
  thousands of rows short of today.
- **ST rate-limits hard** — 429 even at ~1.5s spacing. `stGet()` honours the "try again in N
  seconds" hint. Never call ST from a request handler; the timer owns it.
- **Zero hours is ambiguous.** A missing scope gives `403 Scope validation failed`, which
  looks exactly like nobody worked. The error lands in `time_sync_state.last_error` and the
  Team screen banners it — keep that link intact if you touch the sync.
- **A sync that stops running reports nothing at all.** This happened: the timer died on
  2026-08-13 and hours silently froze for four days with `last_error` null the whole time.
  Three defences now, keep all three — `setInterval` is armed **before** the first run so a
  boot failure cannot take it with it; `nudgeSync()` kicks a background sync when a manager
  loads a stale day, since requests are the only heartbeat a sleeping container has; and the
  Team banner calls out staleness, not just errors. `POST /api/manager/resync` is the manual
  way back, pulling a week by **creation** date so a wrong cursor cannot hide it.
- **The activity feed is only as fresh as the tracker.** The tracker refreshes
  `scoreboard_cache` every 10 minutes and owns that row — we never write it, so the current
  hour can lag by that much. The UI says when it was last updated.

---

## Design principles specific to this app

**Tracked activity is not a measure of effort.** An hour with no logged actions is not an idle
hour — it could be a meeting, training, one long difficult call, or work done directly in
ServiceTitan. Always frame a gap as **"add what you did"**, never "you did nothing".

**Points exist anyway — John asked for them on 2026-08-13.** `POINTS` in `server.js` weights
each metric (inbound 2, outbound 0.5, job created 2, dispatched 3, estimate 6, invoice 2,
audit 2) and `pointsOf()` is the only place scoring happens, so a team-list total can never
disagree with the hour it came from. A weight is an instruction about what to do more of — an
estimate at 6 is worth twelve outbound calls, and people will notice — so treat a change to
these numbers as a change to what the office is being asked to do. Points are a total, never a
ranking: do not sort the team by them or colour anyone red for a low score.

**One calendar renderer, not three.** `renderCalendar()` draws a 24-hour axis with a set of
columns; a column is a date (day/week) or a person (the team coverage board). Adding a fourth
view means supplying different columns, not writing another renderer. The axis is always the
full 24 hours — punches here genuinely run 00:00 to 23:00.

**Write the audit trail from day one.** Every create/edit/approve goes into `time_audit_log`
with before/after. It is cheap now and is the only thing that lets this become payroll-grade
later without a rewrite.

**Identity is server-side.** Each person has a bcrypt-hashed 4-digit PIN in `time_users` and a
signed httpOnly session cookie; the server derives who is calling from the session and never
trusts a person name in a request body. This was a deliberate change from the plan's original
username-only Phase 1: an unauthenticated audit log records *claims*, not facts, so any history
gathered that way would have to be thrown out the moment these hours went near payroll.

---

## Workflow

1. `npm start` → `http://localhost:3000`, refresh the browser (no build step)
2. Test on a **phone-width viewport** — the clock screen is mobile-first
3. Commit with a prefix: `ADD:` / `FIX:` / `UPDATE:` / `DOCS:`
4. Push to a **beta/testing** service first; production only when John explicitly says so
5. Keep `TIMECLOCK-APP-PLAN.md` updated when a table, endpoint, or decision changes

## Code style

- Comments explain **why**, never what
- Match the surrounding idiom: template-string HTML, inline styles using CSS variables
  (`var(--surface)`, `var(--text1)`) so dark mode keeps working
- No dead code — delete it
- Don't add features, abstractions, or error handling for cases nobody asked for
