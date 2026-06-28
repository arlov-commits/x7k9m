# Offline-First Sync Architecture — Gold-Standard Reference

**Audience:** This document is written primarily for an AI implementer (Claude / Claude Code) and secondarily for a human. It is the distilled result of building the sync/persistence backend for *Little Sprout* (a phone-first PWA) the hard way, through many bugs and dead ends. The goal is that a future AI can **rebuild this architecture from scratch, correctly, from this document alone**, without re-deriving the lessons.

**How to read it:**
- **Stage 1 — Gold-Standard Setup.** The correct, final architecture. Copy this.
- **Stage 2 — Hard-Won Lessons.** Every mistake made and how it was fixed. Read before implementing; each lesson maps to a bug that cost real time.
- **Stage 3 — Future Phases.** The deferred roadmap and how to approach it.

Terminology is consistent throughout: **"event"** = a user-logged data record; **"profile"** = the per-account settings/identity row; **"tombstone"** = a soft-delete marker (`deleted_at` timestamp); **"the stamp"** = the account-owner marker on local storage; **"merge"** = per-id reconciliation of remote rows into local state.

---

# STAGE 1 — GOLD-STANDARD SETUP

## 1.1 The core principle (read this first; everything follows from it)

**localStorage is the source of truth for the live UI. The server (Supabase) is a synchronized mirror, never the primary read path for rendering.**

This single decision drives the entire design and is the difference between an app that works and one that loses data. The consequences:

- Every user action writes to localStorage **first**, synchronously, then fires an async push to the server. **The network is never in the critical path of a user action.** A tap must never wait on, or be blocked by, a network call.
- The app remains fully usable offline. The server is for durability and cross-device sync, not for "is the app working right now."
- The server's job is: (a) survive a cleared cache, (b) propagate changes across devices, (c) be the authority **only** during reconciliation (merge), where conflicts are resolved.

The opposite design — server as source of truth, localStorage as a cache you push to opportunistically — produces the canonical failure mode (see Stage 2, Lesson 1: whole-state last-write-wins). Do not build that.

## 1.2 The three-layer stack

```
┌─────────────────────────────────────────────────────────┐
│ CLIENT (PWA, vanilla JS, no build step)                  │
│   - localStorage: source of truth for rendering          │
│   - in-memory state object mirrors localStorage          │
│   - service worker: offline asset cache + auto-update    │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS (supabase-js)
┌───────────────────────────▼─────────────────────────────┐
│ SUPABASE                                                 │
│   - Postgres tables (events, profile)                    │
│   - Row Level Security (RLS) scoped by auth.uid()        │
│   - Auth (email/password; username mapped to fake email) │
│   - Realtime (additive push; correctness NOT dependent)  │
└──────────────────────────────────────────────────────────┘

Deployment: static files from a Git repo (GitHub) → Cloudflare Pages
  - main branch → production URL
  - any other branch → automatic preview URL (test before merge)
```

## 1.3 Data model

### Event (the user-logged record)

Stored in localStorage inside the app's state object, and mirrored one-row-per-event in Supabase.

Canonical shape:
```js
{
  id,            // app-generated stable unique id (string). NEVER reassigned.
  type,          // 'feed' | 'sleep' | 'diaper' | 'pump' | 'weight' | ... (domain-specific)
  ts,            // epoch milliseconds. The event's logical time.
  updatedAt,     // epoch ms, set on every add/edit. Local merge tiebreaker.
  ...typeSpecificFields  // e.g. feed: {method, durationMin, amountMl}; sleep: {start, end}
}
```

Rules:
- **`id` is generated client-side and is immutable.** This is what makes per-event sync possible — both devices agree on the identity of a record. Generate with something collision-resistant (`Date.now().toString(36) + Math.random().toString(36).slice(2,8)` is sufficient for single-baby scale; use UUIDs at larger scale).
- **`ts` is the logical event time** (when the feed happened), distinct from `updatedAt` (when the record was last written). Keep them separate. For events with a range (sleep), `ts === start`.
- **`updatedAt` is sync metadata**, not a user-facing field. It is the tiebreaker when the same event is edited on two devices.
- An in-progress open-ended event (e.g. a sleep with no end yet) stores the open field as `null`. This is a first-class state, not an error.

### Profile (per-account identity + synced settings)

One row per account. Holds the data that must be identical across all of an account's devices.

```js
{
  user_id,    // = auth.uid(), the account. Primary key. One row per account.
  profile,    // jsonb: the identity object, e.g. {name, dob, sex, ...}
  settings,   // jsonb: ONLY data-meaningful settings that should sync (see split below)
  updated_at, // server-stamped
  deleted_at  // tombstone (null = alive)
}
```

### The settings split (important, easily gotten wrong)

Not all settings should sync. Divide them explicitly:

- **Synced settings** (live in `profile.settings`, shared across devices): the data-*meaningful* ones. Example: units (kg vs lb), rounding rules — anything that changes how data is interpreted or displayed consistently for the account.
- **Per-device settings** (stay in localStorage only, NEVER synced): cosmetic / UI preferences. Example: theme, which input-method a card defaults to, per-field UI modes.

Rationale: two parents may want the same units (sync) but one prefers dark theme on her phone (per-device). Syncing theme would fight between devices. Define a `SYNCED_SETTING_KEYS` allowlist in code and route reads/writes accordingly. When loading a profile from the server, only copy the allowlisted keys into local settings — never let the server payload clobber local cosmetic prefs.

## 1.4 Supabase schema

### Events table

```sql
create table if not exists public.events (
  id         text primary key,                  -- the app's own event id
  user_id    uuid not null default auth.uid()   -- auto-set to caller
               references auth.users (id) on delete cascade,
  type       text not null,
  ts         bigint not null,                   -- epoch ms
  data       jsonb not null default '{}'::jsonb,-- type-specific fields (lossless)
  updated_at timestamptz not null default now(),-- server-owned; drives merge + incremental pull
  deleted_at timestamptz                        -- soft-delete tombstone (null = alive)
);

create index if not exists events_user_updated_idx
  on public.events (user_id, updated_at);

-- updated_at is OWNED BY THE DB: stamped on every insert AND update via trigger,
-- so any write advances it and incremental pulls can find it.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before insert or update on public.events
  for each row execute function public.set_updated_at();

-- RLS: a row is visible/insertable/updatable ONLY when it belongs to the caller.
-- A shared family account shares one auth.uid(), so all its devices see the same rows.
alter table public.events enable row level security;

create policy "events_select_own" on public.events
  for select using (user_id = auth.uid());
create policy "events_insert_own" on public.events
  for insert with check (user_id = auth.uid());
create policy "events_update_own" on public.events
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- NO delete policy. Hard DELETE is disallowed for everyone. Deletions are SOFT
-- (set deleted_at), which keeps tombstones so deletes converge across devices.

-- CRITICAL: a SQL-created table has NO role privileges by default; RLS alone
-- returns 403. Grant table-level access to the authenticated role. No DELETE grant.
grant select, insert, update on public.events to authenticated;

-- Realtime (additive only — correctness comes from merge-on-reconnect, not this).
do $$ begin
  alter publication supabase_realtime add table public.events;
exception when duplicate_object then null; end $$;
```

### Profile table

```sql
create table if not exists public.profile (
  user_id    uuid primary key default auth.uid()
               references auth.users (id) on delete cascade,
  profile    jsonb not null,
  settings   jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- If the table predates the tombstone column, add it:
alter table public.profile add column if not exists deleted_at timestamptz;

-- Reuse the same set_updated_at() trigger function.
drop trigger if exists profile_set_updated_at on public.profile;
create trigger profile_set_updated_at
  before insert or update on public.profile
  for each row execute function public.set_updated_at();

alter table public.profile enable row level security;
create policy "profile_select_own" on public.profile
  for select using (user_id = auth.uid());
create policy "profile_insert_own" on public.profile
  for insert with check (user_id = auth.uid());
create policy "profile_update_own" on public.profile
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update on public.profile to authenticated;

do $$ begin
  alter publication supabase_realtime add table public.profile;
exception when duplicate_object then null; end $$;
```

## 1.5 Auth model

- Use Supabase **email/password** auth.
- For a friendly "username + password" UX without real emails, **map the username to a stand-in email**: `username` → `<username>@<app>.local`. The user types a username; the code appends the domain. No real inbox needed.
- **In the Supabase dashboard, turn OFF "Confirm email"** — otherwise sign-in to a `.local` address blocks forever waiting on a confirmation that can't arrive.
- When creating accounts manually (admin-provisioned), use **Add user → Create new user** with **"Auto Confirm User"** checked. Verify the user shows a "Confirmed at" timestamp; a created-but-unconfirmed user cannot sign in.
- Only the **public** Supabase URL + **anon/publishable** key go in client code. They are public by design; protection comes from RLS, not from hiding the key. **NEVER** put the service_role/secret key in client code or a repo — it bypasses RLS entirely.
- The app is **auth-gated**: the main UI mounts only when a valid session exists; otherwise render a login screen. Sessions persist in localStorage (supabase-js does this), so a device logs in once.

## 1.6 The sync layer (the heart of the system)

### Push (local → server), fire-and-forget

Every mutation, AFTER persisting to localStorage:
- `pushEvent(event)` — upsert one row by `id`. Payload omits `updated_at`/`deleted_at` so the DB trigger owns `updated_at` and any existing tombstone is preserved.
- `pushDelete(id)` — `update` the row's `deleted_at = now()`. (Soft delete — see Lesson 4: deletes are tombstones, not row removals.)

Wrap every push so a failure can NEVER throw into or delay the logging path:
```js
function syncPush(ev) {
  try { Promise.resolve(Sync.pushEvent(ev)).catch(() => {}); } catch (e) {}
}
```

### Offline queue

Pushes go through a localStorage-backed queue so offline writes aren't lost:
- Enqueue each op; **collapse to one pending op per id** (a delete supersedes a pending upsert for the same id).
- On reconnect / app start / realtime event: flush the queue, then pull, then merge.
- A failed flush leaves the queue intact for the next retry. Status is tracked (`idle`/`ok`/`error`/`offline`) but never blocks the UI.

### Pull (server → local), incremental

- Track a **per-device** last-sync watermark (`lastSyncAt`) in localStorage.
- `pullSince(watermark)` — fetch rows where `updated_at > watermark`.
- `fullPull()` — fetch all live (`deleted_at is null`) rows; used on a fresh device (empty watermark).
- After merging pulled rows, advance the watermark to the max `updated_at` seen.

### Merge — the crux (per-id reconciliation, NEVER wholesale replace)

This is the single most important function. It reconciles pulled rows into local state **by id**. It must NEVER assign the local events array wholesale from the server payload (that is the data-loss bug).

```js
// Pure function: (localEvents, localTombstones, remoteRows) -> {events, tombstones, changed}
function mergeEvents(localEvents, localTombstones, rows) {
  const byId = new Map(localEvents.map(e => [e.id, e]));
  const tombstones = Object.assign({}, localTombstones);
  let changed = false;

  for (const r of rows) {
    const remoteUpdated = Date.parse(r.updated_at) || 0;

    if (r.deleted_at) {
      // Tombstone wins: remove locally, remember the deletion.
      if (byId.has(r.id)) { byId.delete(r.id); changed = true; }
      const dms = Date.parse(r.deleted_at) || 0;
      if (!(r.id in tombstones) || tombstones[r.id] < dms) { tombstones[r.id] = dms; changed = true; }
      continue;
    }
    // A live remote row we deleted locally but haven't pushed yet:
    // keep it deleted until our tombstone propagates.
    if (tombstones[r.id] && tombstones[r.id] >= remoteUpdated) continue;

    const local = byId.get(r.id);
    if (!local) { byId.set(r.id, rowToEvent(r)); changed = true; }          // new → add
    else if (remoteUpdated > (local.updatedAt || 0)) { byId.set(r.id, rowToEvent(r)); changed = true; } // remote newer → take
    // else local newer/equal → keep local
  }
  return { events: Array.from(byId.values()), tombstones, changed };
}
```

Properties this guarantees:
- Two devices adding **different** events never collide (different ids; both survive).
- The only real conflict is two devices editing the **same** event; `updated_at` wins, and the blast radius is one event, not the whole history.
- A deleted event cannot be resurrected by a stale device (tombstone stays, enforced both locally and by the DB keeping `deleted_at` set across re-pushes).

### Realtime is additive, not load-bearing

Subscribe to Postgres changes so writes on one device merge into others within ~1–2s when online. **But correctness must come entirely from merge-on-reconnect, not the websocket.** If realtime drops or the device is offline, the next pull-and-merge converges. Never make data integrity depend on a realtime message arriving. A realtime handler just feeds the same `mergeEvents` path one row.

## 1.7 Profile sync + onboarding decision

The profile syncs like events but **last-write-wins, no merge** (one row, rare edits — merge complexity is unwarranted).

- `pullProfile()` returns three distinct outcomes so onboarding can be decided from the SERVER, not local state:
  - `{ ok:true, row:{...} }` — a profile exists → load it, go to dashboard.
  - `{ ok:true, row:null, tombstoned:false }` — reachable, no profile → genuine first run → onboarding.
  - `{ ok:true, row:null, tombstoned:true }` — account was erased → wipe stale local, go to onboarding.
  - `{ ok:false }` — unreachable/offline → fall back to local.
- **Onboarding must be decided from the server profile when reachable**, so a cleared-cache or second device re-pulls the existing identity instead of re-onboarding (Lesson 5).

## 1.8 Account lifecycle (two distinct destructive operations)

These are different operations and must be separate, differently-confirmed UI:

**Log out (local only):** ends the session on this device. Cloud data and other devices untouched. No confirmation needed.

**Delete account / erase everywhere (global, propagating):** must run **server-first, abort-on-failure**, in this exact order:
1. `await` tombstone all of the account's event rows (bulk `deleted_at = now()`).
2. `await` tombstone the profile row.
3. **Only if both server steps succeeded:** clear local app state AND sync-local keys (watermark, queue, pending-profile, the state key, the owner stamp).
4. Sign out.

If step 1 or 2 fails (offline/error), **abort before any local clearing or signout**, and surface an error. Never clear local while the server still has live rows — that strands data. This ordering guarantees: every other device converges to empty + onboarding on next sync, and this device cannot resurrect anything because its local state is cleared only after the server tombstones are confirmed written. Require a hard confirmation for the global delete (e.g. type the name to confirm).

## 1.9 Cross-account local-state scoping (the stamp)

**localStorage must be stamped with the account it belongs to.** Store the owning `user_id` alongside the cached state (e.g. an `owner` key). On auth/mount, BEFORE any pull or render:
- If the signed-in user's id **matches** the stamp → keep local cache (offline-first preserved).
- If it **differs** (or no stamp exists and there is local data of unknown origin) → the cache is foreign → **clear local app state + sync keys, re-stamp to the new account, then pull fresh from the server.**

This wipe must happen **before** the onboarding/render decision so a new account never renders the previous account's data, even briefly (Lesson 6). Only a mismatch wipes; a match never does (offline-first intact).

Per-device cosmetic prefs (theme, etc.) can be preserved across this wipe if feasible, but correctness takes priority — a clean wipe is acceptable.

## 1.10 Export / import (local backup, independent of sync)

Provide in-app JSON export/import as a user-controlled backup, separate from cloud sync:
- **Export:** serialize the full state object (`{app, version, exportedAt, data: state}`) to a downloadable JSON file.
- **Import:** parse, validate it looks like a real backup (check for the expected shape, e.g. an events array), then replace local state and persist. Guard import behind confirmation. Validate before applying — never trust the file blindly.
- Export/import is portable across devices and is the user's safety net if they distrust the cloud or want an offline archive. It is NOT the sync mechanism; it's a manual escape hatch.

## 1.11 Service worker + deploy pipeline

### Service worker (offline + auto-update)

- Precache the app shell assets. **Bump the cache version on every meaningful change** or installed devices serve stale code.
- On `install`: cache assets, `skipWaiting()`.
- On `activate`: delete all non-current caches, `clients.claim()`.
- **CRITICAL registration-side step (the SW alone is not enough):** add a loop-guarded `controllerchange` listener that reloads the page **once** when the new SW takes control, so a refresh actually lands on new code without manual cache-clearing. Guard with a `reloading` flag and skip the very first install (`hadController` check) to avoid reload loops. Also call `registration.update()` on load and on focus/visibility. (Lesson 8.)

### Deploy pipeline (the professional flow)

- Repo on GitHub. Hosting on **Cloudflare Pages** (not GitHub Pages) because Cloudflare auto-builds a **preview URL for every branch**, separate from production — a real, mobile-reachable test environment.
- Build config for a no-build static app: framework preset **None**, build command **empty**, output directory **`/`**.
- **Branch control → Preview: "All non-production branches"** so every branch gets a preview. Production branch = `main`.
- Workflow for every change:
  1. Work on a **branch**, never commit directly to `main` (a live user is on `main`).
  2. Push branch → Cloudflare auto-builds a preview URL.
  3. **Test the preview URL on real devices** (PC + phone). For destructive/account testing, use a throwaway/sample account, never live user data. Note: previews hit the **same** Supabase, so you're touching real data — be careful.
  4. If good, **merge the PR** → production updates automatically.
- This is non-negotiable once a real user exists: never test by committing to production. The preview URL is the test environment; production is production.

---

# STAGE 2 — HARD-WON LESSONS (what NOT to do)

Each lesson is a bug that cost real time. They are ordered roughly by severity/foundational-ness.

## Lesson 1 — NEVER use whole-state last-write-wins (the cardinal sin)

**The bug:** Storing the entire app state as one blob and having each device overwrite the server with its full copy. Device A edits, pushes its whole state. Device B (offline, holding an OLD whole state) edits, comes online, pushes ITS whole state — which is old-state + B's edits, **missing all of A's changes**. The server takes it. A's work is **silently destroyed** — not unsynced, overwritten.

**Why it's seductive:** it's the simplest thing to build, and it appears to work in single-device testing.

**The symptom in the wild:** "I made changes on my laptop, hit refresh many times, then opened my phone (offline), made more changes; next day my laptop changes were all gone." The workaround users invent ("always refresh the phone before leaving wifi") is them manually forcing a pull — proof the model is broken.

**The fix:** per-event rows + merge-by-id + tombstones (Stage 1.6). Nothing is ever stored or overwritten wholesale, so wholesale loss is structurally impossible. **This is the entire reason the architecture exists.** If you find yourself writing `state.events = remotePayload`, stop.

## Lesson 2 — The anon key is public; RLS is the actual boundary

**The confusion:** worrying that the Supabase anon key being visible in client JS is a security hole, and reaching for ways to hide it.

**The truth:** the anon/publishable key is **designed** to be public and ship in the browser. It grants nothing on its own. **All protection comes from RLS policies** scoped to `auth.uid()`. The real security question is never "is the key hidden" but "are the RLS policies correct."

**The corollary mistake to avoid:** an early design used a shared anon key with an unguessable "household key" as the boundary and RLS gymnastics around it. This was confusing and error-prone. Once real auth exists, RLS keys cleanly off `auth.uid()` — the standard, well-trodden path. Prefer real auth + `auth.uid()` RLS over any shared-secret scheme.

## Lesson 3 — A SQL-created table has NO grants by default (the 403)

**The bug:** created the table via SQL, RLS enabled with correct policies, and every request still returned **`403 permission denied for table`**.

**The cause:** when you create a table via the SQL editor, the API roles (`anon`, `authenticated`) get **no table-level privileges at all**. RLS restricts *which rows*, but the role still needs base permission to touch the table. (The dashboard's table editor adds these grants automatically, which is why SQL-created tables behave differently from dashboard-created ones.)

**The fix:** explicitly grant after creating:
```sql
grant select, insert, update on public.<table> to authenticated;
```
(No DELETE grant — deletes are soft.) This will bite on every new table; remember it.

## Lesson 4 — Deletes are tombstones, not row removals (and the "lingering row" non-bug)

**The realization:** a soft delete intentionally **keeps the row** with `deleted_at` set. So "I deleted an event in the app but the row is still in the Supabase table" is **correct behavior, not a bug.** The tombstone is how a stale device learns not to resurrect the record.

**The actual bug it prevents:** if deletes removed rows, a device holding a stale copy would re-push the "missing" row on next sync and resurrect a deleted event. Tombstones (kept sticky at the DB — a re-push never clears `deleted_at`) make resurrection impossible.

**The cost of forgetting:** tombstoned rows accumulate forever. This is acceptable (they're RLS-isolated and invisible cross-account) but should eventually be purged (Stage 3) — which also becomes the "30-day recovery window."

## Lesson 5 — Profile/identity must sync too, or you get phantom re-onboarding

**The bug:** events synced but the **profile (baby identity + settings) was localStorage-only.** So clearing the cache, or opening a second device, found no local profile → showed first-run onboarding again → created a *new* profile → "phantom babies."

**The deeper symptom:** the "5 sample profiles I can't find" were transient local-only profiles that never persisted server-side; each evaporated on the next cache clear. They were never in any database. Meanwhile events logged in those sessions DID sync, becoming parentless.

**The fix:** sync the profile in its own single-row-per-account table, and **decide onboarding from the SERVER profile** (`pullProfile`) when reachable, not from local state (Stage 1.7). Onboarding fires only when no server profile exists for the account.

## Lesson 6 — localStorage must be account-scoped (cross-account bleed)

**The bug:** on a shared browser, signing into account B showed account A's cached events. Account B's *server* data was correct and isolated (RLS held), but the app rendered A's events from localStorage on top of B's, because the local cache wasn't tied to an account and the merge only ADDS server rows, never REMOVES foreign local ones.

**How to confirm it's a client bug not an RLS breach:** query the server directly — count live events per `user_id`. If each account owns the right rows on the server but the *frontend* shows commingled data, it's purely client-side stale cache. (This exact check ruled out an RLS leak and localized the bug.)

**The fix:** stamp localStorage with the owning `user_id`; on a mismatch at login, wipe local before pulling/rendering (Stage 1.9). Same-account login never wipes (offline-first preserved).

## Lesson 7 — A new browser/URL doesn't share localStorage; "clear cache" often doesn't clear it

Two distinct gotchas that caused repeated confusion during testing:

- **A new domain has its own separate localStorage.** Opening the app at a new preview/production URL does NOT carry over the old URL's local data. (Useful for clean testing; surprising if unexpected.)
- **Chrome's "Clear browsing data" does NOT clear localStorage** unless you specifically select "Cookies and other site data." Repeated "I cleared cache but the data's still there" was this: the data was never actually cleared. To truly reset for testing: DevTools → Application → Storage → **Clear site data**, or delete the specific localStorage keys. Do not rely on the browser's cache-clear for a true reset.

## Lesson 8 — Service-worker updates don't ship on refresh without a controllerchange reload

**The bug:** new versions shipped (cache version bumped, `skipWaiting` + `clients.claim` present), but a normal refresh kept running the OLD code; users had to manually clear cache.

**The cause was registration-side, not the SW:** the new SW activated and claimed control, but the **open page kept running the old in-memory JS** because nothing reloaded it when control changed. The navigation that triggered the update had already been served by the old SW.

**The fix:** a loop-guarded `controllerchange` listener that reloads once when the new SW takes control, skipping the first-ever install, plus `registration.update()` on load/visibility (Stage 1.11). Caveat: the device currently running the *old* (pre-fix) SW still needs one manual clear to get onto the fixed version; from then on it self-updates.

## Lesson 9 — Erase must be server-first, abort-on-failure (ordering is correctness)

**The bug risk:** an erase/reset that clears local state or signs out *before* tombstoning the server rows. The device loses its auth session before it can push the tombstones → the data persists on the server → next sync pulls it back → you're doing SQL surgery to truly reset.

**The fix:** strict order — tombstone events on server, tombstone profile on server, THEN (only on success) clear local + sign out. Abort before any local change if a server step fails (Stage 1.8). The "delete everywhere and it stays deleted" behavior depends entirely on this ordering.

## Lesson 10 — Don't reason from a stale mental model; verify against ground truth

**The meta-lesson (communication/process).** The single biggest source of looping was acting on an assumed state of the system that was already outdated. Symptoms: proposing a fix based on what the code "should" look like rather than what it currently is; the model being wrong by the time the next change was made.

**The fixes that worked:**
- **Look before theorizing.** When a bug appears, run a read-only diagnostic against the actual database (counts per `user_id`, profile rows, tombstone flags) and read the actual current repo, before forming a fix. Do not write the fix prose before seeing ground truth.
- **One change at a time, verified.** Each change shipped with a verification log (commit hash, version, what was tested, what the actual output was). The next step was informed by the pasted-back log, not by assumption.
- **Distinguish "server is wrong" from "client is wrong" empirically** before fixing — they have opposite fixes (Lesson 6 is the canonical example).

## Lesson 11 — Communication: decide-with-default, don't ask-after-giving

**The process failure (worth encoding because it recurred).** A repeated frustration pattern: producing a full answer/instruction/code block, then ending with a clarifying question whose answer would change the procedure — so the recipient acts on the answer, then reads the question. This wastes effort and trust.

**The rule:** if a decision affects the output, **surface it as a question FIRST and wait**, OR (better) **make the decision yourself with a stated default and note the one thing that changes if the assumption is wrong.** Do not hand over output plus a trailing question that invalidates it. When a task has an open decision and the most likely answer is knowable, write for that case and flag the single variable, rather than blocking on a question. Give instructions in small steps (1–2 at a time), not ten steps in advance that will change by the next reply.

## Lesson 12 — Headless tests prove logic, not reality; test on real devices

Headless (jsdom) tests are valuable for logic (merge correctness, tombstone stickiness, ordering) and should be written and kept green. But they **cannot** prove: real touch interactions, actual cross-device sync, the real auth round-trip against the live backend, service-worker reload behavior, or how something looks/behaves on an actual phone. For those, test on a real device against the real (preview) deployment. Be explicit about which claims are "proven headlessly / reasoned" vs "verified live." The live round-trip (e.g. create on one session, confirm a second session pulls it; delete and confirm it stays deleted against a stale re-push) is the real proof for sync correctness.

## Lesson 13 — Phone-first chart interaction: never `touch-action: none`, never capture a touch pointer

This is a frontend lesson but it's exactly "what NOT to do", so it lives here. The app's inline charts (KPI sparklines, trend bars, weight line chart) are all **press/hover-to-scrub**, and on a phone a naïve implementation breaks two ways — both shipped at least once:

- **`touch-action: none` traps page scroll.** A full-width chart that sets `touch-action: none` captures *every* gesture, including vertical pans, so the user can't scroll the page past the chart. Use **`touch-action: pan-y`**: a vertical drag scrolls the page; only horizontal scrubbing is delivered to the chart.
- **`setPointerCapture` on a touch pointer can swallow the scroll.** Capturing the pointer on `pointerdown` redirects events to the element and can prevent the browser from starting its pan. Only capture for mouse/pen (`pointerType !== 'touch'`); for touch, rely on `pointermove` while the finger is over the chart. Always handle **`pointercancel` → hide** (the browser fires it when it takes the gesture for scrolling, so the tooltip doesn't linger).
- **Long-press selects text / pops the "search" callout.** SVG `<text>` labels (axis ticks, dates) are selectable; a long-press highlights them and opens the OS copy/search menu. Set `user-select: none` + `-webkit-touch-callout: none` on the chart container and svgs.

**The fix is structural, not per-chart:** one shared `attachScrub(svg, showAt, hide)` wires all of this once, and every chart goes through it. When the bars and the weight chart had their own copies of the handler, they each had to be fixed separately — the second one (weight) still had `touch-action: none` + unconditional touch capture after the bars were fixed. Centralize the interaction so a chart can't drift. (Working-guide SOP: `CLAUDE.md` → "Charts & metric interaction (SOP)".)

---

# STAGE 3 — FUTURE PHASES (deferred roadmap)

The architecture is stable for the current use case (admin-provisioned accounts, one baby per account, shared by a small family). These are the known next phases, in rough priority order, with the approach for each. None are blocking; all are real items from the build discussion.

## Phase A — Self-serve signup (the main "real app" gap)

**What:** a "create account" flow in the app so families onboard themselves, instead of an admin manually creating each account in the Supabase dashboard.

**Why / when:** currently the admin is the account-creation bottleneck. Fine for a handful of trusted friends; required to scale beyond that.

**Approach:** add a sign-up screen alongside login that calls Supabase `signUp` with the username→fake-email mapping (or, if moving to real emails, a genuine email + the email-confirmation flow re-enabled). Decide whether to keep the `.local` fake-email convenience (no inbox, but no password reset / no real identity) or move to real emails (enables password reset and recovery, at the cost of requiring a real address). For a real public app, real emails are likely worth it. RLS already isolates accounts, so no data-model change is needed — only the account-creation entry point.

## Phase B — Multiple babies per account

**What:** let one account track more than one baby (siblings), switching between them.

**Why:** families with twins/multiple children; also the natural shape once "profile" is generalized.

**Approach:** this is the one item that touches the data model. Today the profile table is one-row-per-account (`user_id` is the PK). To support multiple babies:
- Promote to one-row-per-baby: a `baby_id` (or reuse the profile row id) becomes the unit, with `user_id` as a foreign key (an account owns many babies).
- Events gain a `baby_id` foreign key so they're scoped to a baby, not just an account. RLS still scopes by `user_id` (the account owns the babies and their events); add `baby_id` filtering in the app's queries and merge.
- The app gains a baby-switcher in the UI; the "active baby" is a per-device UI selection.
- Migration: existing single-baby accounts map their one profile to one baby cleanly. Plan the migration carefully (this is the kind of change where the per-event/per-baby scoping must be gotten right to avoid cross-baby bleed — apply the same rigor as Lesson 6).

## Phase C — Multiple distinct parents per account (real per-user identity)

**What:** today a "shared family account" means literally one shared login that both parents use. A future phase could give each parent their own login while sharing access to the same baby's data.

**Why:** per-user attribution (who logged this feed), individual preferences, not sharing a password.

**Approach:** this is a larger shift — it separates "account" (the human login) from "baby/household" (the shared data). Likely a join model: a `household` (or `baby`) owns the data; multiple `user`s are members of a household; RLS checks household membership rather than direct `user_id` ownership. This is more complex RLS (membership-based, not `user_id = auth.uid()`) and should be approached only when genuinely needed. The current shared-account model is a deliberate simplification that works for two parents who trust each other with one login.

## Phase D — 30-day tombstone purge (hygiene + GDPR + recovery window)

**What:** a scheduled job that hard-deletes rows whose `deleted_at` is older than 30 days.

**Why:** keeps the tables clean (tombstones accumulate forever otherwise), provides a true GDPR-style purge (soft-delete alone is not a real "delete my data"), and the 30-day delay IS the recovery window — within 30 days a deletion can be undone; after, it's permanently purged.

**Approach:** Supabase supports `pg_cron`. A periodic job:
```sql
delete from public.events  where deleted_at is not null and deleted_at < now() - interval '30 days';
delete from public.profile where deleted_at is not null and deleted_at < now() - interval '30 days';
```
Low effort, deferrable (tombstoned rows are harmless meanwhile — RLS-isolated, invisible cross-account). Implement when table size or a real "delete my data" requirement makes it worthwhile.

## Phase E — Profile-edit live-sync verification

**What:** confirm that editing the profile/identity (e.g. fixing the baby's name) on one device propagates to another *already-open* device, not just on a fresh pull.

**Why:** the legitimate core of the "stale data" concern. Event sync and unit-setting sync were verified live; a profile *edit* landing on an open second device via realtime was reasoned but not exhaustively verified.

**Approach:** the realtime subscription on the profile table should handle it (an update pushes to subscribed devices, applied additively). Verify with two open sessions: edit the name on one, confirm the other reflects it without a manual refresh. If it doesn't, the fix is small (ensure the realtime profile handler applies the change), but it's post-launch polish, not a blocker. Note: deliberately do NOT build "deleting the profile server-side force-logs-out other devices in real time" — that's a testing-only scenario (in production nobody deletes a profile), and building reactive delete-propagation adds risk for no real-use benefit. The tombstone + next-sync convergence already handles it correctly.

## Phase F — Deployment naming cleanup (cosmetic)

The repo/deployment may carry a legacy name from when the app was single-purpose (e.g. named after the first baby). Renaming to a neutral product name is cosmetic — no functional impact — but worth doing if other users will see the URL. Low priority.

---

# APPENDIX — Quick rebuild checklist

To rebuild this architecture from scratch, in order:

1. **Repo + hosting:** static files in GitHub; connect Cloudflare Pages (preset None, build command empty, output `/`); enable preview for all non-production branches.
2. **Supabase project:** create it; Authentication → Email provider ON, **Confirm email OFF**.
3. **Schema:** run the `events` and `profile` table SQL (Stage 1.4) INCLUDING the `grant ... to authenticated` (Lesson 3) and the realtime publication adds.
4. **Auth in app:** supabase-js via CDN (no build step); username→`<username>@<app>.local` mapping; auth-gate the UI; only public URL + anon key in code.
5. **Store (localStorage):** state object as source of truth; persist on every mutation; `id`+`ts`+`updatedAt` on events; tombstones map; the settings split (`SYNCED_SETTING_KEYS`); the **owner stamp**.
6. **Sync:** `pushEvent`/`pushDelete` (fire-and-forget, offline queue, collapse-per-id); `pullSince`/`fullPull` (per-device watermark); **`mergeEvents`** (per-id, tombstone-aware, never wholesale); profile pull/push (last-write-wins, three-outcome `pullProfile`); realtime additive.
7. **App-start flow:** auth → **scope local to account (wipe on owner mismatch BEFORE pull)** → start sync → decide onboarding from SERVER profile.
8. **Lifecycle:** Log out (local only) vs Delete (server-first, abort-on-failure, then clear local + signout).
9. **Export/import:** JSON backup, validated, confirmation-guarded.
10. **Service worker:** precache + cache-version bump discipline; `skipWaiting`/`clients.claim`; **controllerchange reload (loop-guarded, skip first install)** + `registration.update()` on load/visibility.
11. **Process discipline:** branch → preview URL → test on real devices (sample account for destructive tests) → merge. Verify each change against ground truth (DB queries, real-device checks), one step at a time. Never whole-state overwrite. Never test on production with a live user.
