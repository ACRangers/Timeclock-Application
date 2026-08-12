# AC Rangers Timeclock — Claude Development Guide

## What this is

A **clock-in / clock-out app** for the AC Rangers **office team** (~22 people — CSRs,
dispatch, estimating). People clock in from a phone browser or desktop, and for each hour the
app **shows what they already did** (pulled automatically from the HVAC Tracker's Dashboard
data) and lets them **add anything the system couldn't see**. Managers see totals by day/week,
approve them, and export.

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
- **The activity feed is only as fresh as the tracker.** The tracker refreshes
  `scoreboard_cache` every 10 minutes and owns that row — we never write it, so the current
  hour can lag by that much. The UI says when it was last updated.

---

## Design principles specific to this app

**Tracked activity is not a measure of effort.** An hour with no logged actions is not an idle
hour — it could be a meeting, training, one long difficult call, or work done directly in
ServiceTitan. Always frame a gap as **"add what you did"**, never "you did nothing", and never
rank or score people by activity count. A timesheet people feel surveilled by is one they
learn to game, and then the data is worthless.

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
