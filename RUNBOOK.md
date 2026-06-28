# RUNBOOK — Academic Planner

Comprehensive operations guide. Written for an AI or human to follow for setup, migration, scaling, or troubleshooting.

---

## 1. Infrastructure Overview

### Services Used (all free tier)

| Service | Purpose | Account | URL |
|---------|---------|---------|-----|
| GitHub | Source code hosting | arlov-commits | github.com/arlov-commits/x7k9m |
| Supabase | Database (PostgreSQL) | [main account] | nxjypjgqsywxukcnchmh.supabase.co |
| Cloudflare Pages | Static site hosting | [TBD] | [TBD].pages.dev |

### Supabase Credentials

- **Project URL:** `https://nxjypjgqsywxukcnchmh.supabase.co`
- **Anon (public) key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54anlwamdxc3l3eHVrY25jaG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTAzNzQsImV4cCI6MjA4OTY4NjM3NH0.Hh1GErLUxJbswFJGi8xVEzD60AUkRX0JVPgo91pdVKY`
- **Secret key:** Do NOT put in client-side code. Available in Supabase dashboard → Settings → API.

### GitHub Branch Protection

- Branch `main` is protected: no force pushes, no deletions allowed.
- Claude Code and direct pushes still work normally.
- Configured at: repo → Settings → Branches → Branch protection rules.

---

## 2. Supabase Database Schema

### Existing Tables

#### `schedules` (used by agroforest project)
Shared Supabase instance. Do not modify this table.

#### `planner_state` (private planner)
```sql
create table planner_state (
  id text primary key default 'default',
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);
```
Stores the entire private planner state as a JSON blob. Single row with `id = 'default'`.

### Tables to Create (Tier 2 — shared dashboards)

#### `cohorts`
```sql
create table cohorts (
  id text primary key,
  name text not null,
  semester text not null default '2026-spring',
  admin_password_hash text,
  google_sheet_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table cohorts enable row level security;
create policy "Public read" on cohorts for select using (true);
create policy "Auth write" on cohorts for all using (true) with check (true);

-- Pre-populate
insert into cohorts (id, name) values
  ('ba1', 'BA Year 1'), ('ba2', 'BA Year 2'),
  ('ba3', 'BA Year 3'), ('ba4', 'BA Year 4'),
  ('ma1', 'MA Year 1'), ('ma2', 'MA Year 2'),
  ('translation', 'Translation Program');
```

#### `syllabus_entries`
```sql
create table syllabus_entries (
  id uuid primary key default gen_random_uuid(),
  cohort_id text references cohorts(id) on delete cascade,
  class_name text not null,
  class_short text not null,
  title text not null,
  description text default '',
  due_date date not null,
  type text not null check (type in ('reading', 'paper', 'exam', 'presentation')),
  hours_estimate real default 0,
  status text default 'active' check (status in ('active', 'complete', 'cancelled')),
  sort_order int default 0,
  semester text not null default '2026-spring',
  initial_due_date date,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table syllabus_entries enable row level security;
create policy "Public read" on syllabus_entries for select using (true);
create policy "Auth write" on syllabus_entries for all using (true) with check (true);

-- initial_due_date stores the original date from the syllabus.
-- due_date stores the current/updated date.
-- When due_date != initial_due_date, the UI shows "Updated [date]" badge.
```

#### `syllabus_changelog`
```sql
create table syllabus_changelog (
  id uuid primary key default gen_random_uuid(),
  cohort_id text references cohorts(id) on delete cascade,
  semester text not null,
  entry_id uuid references syllabus_entries(id) on delete set null,
  change_type text not null,
  description text not null,
  changed_at timestamptz default now()
);

alter table syllabus_changelog enable row level security;
create policy "Public read" on syllabus_changelog for select using (true);
create policy "Auth write" on syllabus_changelog for all using (true) with check (true);
```

#### `semester_archives`
```sql
create table semester_archives (
  id uuid primary key default gen_random_uuid(),
  cohort_id text references cohorts(id),
  semester text not null,
  data jsonb not null,
  archived_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 days'),
  downloaded boolean default false
);

alter table semester_archives enable row level security;
create policy "Public read" on semester_archives for select using (true);
create policy "Auth write" on semester_archives for all using (true) with check (true);
```

#### `analytics_events`
```sql
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  cohort_id text,
  visitor_id text not null,
  visitor_alias text,
  session_id text,
  event_type text not null,
  event_data jsonb default '{}',
  page text,
  device_info jsonb default '{}',
  timestamp timestamptz default now()
);

alter table analytics_events enable row level security;
create policy "Public insert" on analytics_events for insert with check (true);
create policy "Admin read" on analytics_events for select using (true);

-- Index for common queries
create index idx_analytics_cohort_time on analytics_events(cohort_id, timestamp);
create index idx_analytics_visitor on analytics_events(visitor_id);
```

### Running the Schema

1. Go to Supabase dashboard → SQL Editor
2. Paste each table creation block above and run
3. Run them in order (cohorts first, then syllabus_entries, then changelog, then archives, then analytics)

---

## 3. Cloudflare Pages Setup

### Initial Setup

1. Create account at dash.cloudflare.com
2. Left sidebar → Workers & Pages → Create → Pages
3. Connect to GitHub → authorize → select `x7k9m` repo
4. Build settings: Framework preset = None, Build command = (leave empty), Output directory = `/`
5. Deploy

### Custom Domain (optional)
Pages → your project → Custom domains → Add. Free with Cloudflare.

### Second Project (shared dashboard)
Create a separate GitHub repo (e.g. `drbu-dash`) containing `index.html` (the share page), connect to Cloudflare Pages as a separate project. This gives it a completely separate URL with no connection to the private planner.

### Deployment
Push to `main` branch on GitHub → Cloudflare auto-deploys within ~30 seconds.

---

## 4. Google Sheets Integration

### Template Structure

Create a Google Sheet with these columns:

| Column | Description | Example |
|--------|-------------|---------|
| Class | Full class name | Buddhist Hermeneutics |
| Class Short | Abbreviation | BH |
| Title | Reading/assignment title | Powers — Saṃdhinirmocana-sūtra |
| Description | Full details, page numbers | pp.78-82 & 138-147 |
| Due Date | MM/DD/YYYY format | 03/31/2026 |
| Type | reading, paper, exam, or presentation | reading |
| Hours | Estimated hours | 3 |

### Publishing as CSV
1. In Google Sheets: File → Share → Publish to web
2. Select the specific sheet tab, format = CSV
3. Copy the URL — it looks like: `https://docs.google.com/spreadsheets/d/e/[ID]/pub?gid=0&single=true&output=csv`
4. Store this URL in the `cohorts` table `google_sheet_url` column

### Live Sync Behavior
- The share page fetches the CSV URL on every page load
- Additionally polls every 5 minutes if the page stays open
- No manual sync button needed
- Changes appear within 5 minutes of editing the Sheet
- The system compares incoming data with stored data and auto-generates changelog entries for any differences

---

## 5. Semester Management

### Starting a New Semester

1. Admin page → select cohort → "New Semester"
2. System prompts: "Download backup of current semester?" → Yes/No
3. If yes, downloads JSON backup to admin's device
4. Current semester data is moved to `semester_archives` table with 30-day expiry
5. Admin enters new semester identifier (e.g. "2026-fall")
6. Fresh syllabus tab, ready for new data
7. Import from Google Sheet or enter manually

### Restoring Archived Semester

1. Admin page → select cohort → "Restore Archive"
2. Shows available archives (within 30-day window)
3. Restoring pushes current data down (does not overwrite)
4. After 30 days with no restore, archived data is permanently deleted

### Backup Downloads

Available at any time:
- Admin page → "Download Semester Backup" → downloads JSON
- Private planner → ⬇ button → downloads planner state JSON
- Both are complete snapshots that can be restored

---

## 6. Analytics

### What Is Tracked

| Event | Trigger | Data Captured |
|-------|---------|---------------|
| session_start | Page opens | device type, screen size, browser, OS, referrer |
| page_view | Tab switch | which tab, time spent on previous tab |
| entry_expand | Click to expand reading details | which entry |
| scroll_depth | Scroll position sampled every 10s | percentage scrolled |
| session_end | Page closes / navigates away | total session duration |

### Visitor Identification

- Each visitor gets a random UUID stored in localStorage on first visit
- Soft name prompt appears on first visit (skippable)
- If skipped, prompts again once per week
- When name is entered, all previous anonymous events for that visitor_id are retroactively tagged with the alias
- Device info (screen size, browser, OS) helps distinguish users on shared devices

### Viewing Analytics

Analytics dashboard is a tab in the private planner (not visible on shared dashboard). Shows:
- Visitors per cohort per week (bar chart)
- Return visitor rate
- Tab usage breakdown
- Most-viewed readings
- Session duration distribution
- Mobile vs desktop split

### Data Retention

Analytics events accumulate indefinitely on free tier. At ~100 bytes per event, 10,000 events ≈ 1MB. Supabase free tier has 500MB. At projected usage (9 cohorts × ~30 students × ~50 events/week), roughly 70KB/week = ~3.5MB/semester. No cleanup needed for years.

---

## 7. Security Model

### Private Planner
- Obscure URL is the primary access control
- Data in localStorage (per-device) + Supabase (synced)
- Supabase writes are open (accepted risk for single-user convenience)
- Future improvement: add write token to RLS policy

### Shared Dashboard
- Hosted on completely separate URL/project — no path back to private planner
- Read-only: only fetches data, never writes (except analytics inserts)
- Analytics inserts use insert-only RLS policy (can write events, cannot read/modify them)
- Admin page is password-protected per cohort

### Supabase RLS Summary

| Table | Anonymous Read | Anonymous Write |
|-------|---------------|-----------------|
| planner_state | Yes | Yes (single user, accepted risk) |
| cohorts | Yes | Yes (admin password checked in app) |
| syllabus_entries | Yes | Yes (admin password checked in app) |
| syllabus_changelog | Yes | Yes (auto-generated) |
| semester_archives | Yes | Yes (admin only in practice) |
| analytics_events | No | Insert only |

---

## 8. Migration Guide

### Moving to a New Supabase Instance

1. Export all tables: Supabase dashboard → SQL Editor → run `SELECT * FROM [table]` for each table → download as CSV
2. Create new Supabase project
3. Run the schema SQL from Section 2 above
4. Import CSVs into new tables
5. Update `SB_URL` and `SB_KEY` constants in `index.html`, `share.html`, and `admin.html`
6. Push to GitHub → auto-deploys

### Moving to a New Hosting Provider

1. Download all files from GitHub repo
2. Create account on new provider (Netlify, Vercel, or any static host)
3. Connect to same GitHub repo, or upload files manually
4. Update any hardcoded URLs if applicable
5. Old URLs stop working; share new URLs with users

### Moving to a New GitHub Account

1. Fork or transfer the repo to new account
2. Update Cloudflare Pages to point to new repo
3. Branch protection rules need to be re-created on new repo

### Scaling to Multiple Schools

Current architecture supports this with minimal changes:
1. Add a `school` field to `cohorts` table
2. Share page URL becomes `?school=drbu&cohort=ma1`
3. Each school gets its own Google Sheet templates
4. Single Supabase instance handles all schools (until free tier limits are hit)
5. If scaling beyond free tier: Supabase Pro is $25/month for 8GB database, which would support thousands of users

### Scaling to Tier 3 (User Accounts)

Requires:
1. Enable Supabase Auth (built-in, free)
2. Add `users` table with cohort association
3. Replace single `planner_state` row with per-user rows keyed by auth user ID
4. Add "Sign Up / Log In" flow to the planner
5. On first login, pre-populate user's planner with their cohort's syllabus
6. Update RLS policies to restrict reads/writes to authenticated user's own data
7. Estimated effort: 2-3 sessions with Claude Code

---

## 9. Troubleshooting

### "Black screen" on page load
- Open DevTools (F12) → Console tab → look for red errors
- Most common: JavaScript syntax error from a bad commit. Check the line number, compare with recent changes.
- Fix: revert to previous commit on GitHub.

### Data not syncing between devices
- Check the connection indicator (green = online, red = offline)
- Open DevTools → Console → look for "SB sync failed" or "SB get err" messages
- Verify Supabase is up: visit `https://nxjypjgqsywxukcnchmh.supabase.co` in browser
- Check if the anon key has expired (unlikely before 2089 based on JWT exp claim)

### Lost data
- Check localStorage: DevTools → Application → Local Storage → look for `sprint-planner-v3`
- Check Supabase: dashboard → Table Editor → `planner_state` → inspect the `data` column
- Restore from JSON backup if available

### Cloudflare Pages not updating after push
- Check Cloudflare dashboard → your project → Deployments → see if latest deploy succeeded
- GitHub webhook may have failed: try Cloudflare dashboard → Retry deployment
- Cache: hard refresh with Ctrl+Shift+R

### Service worker serving stale version
- DevTools → Application → Service Workers → click "Unregister"
- Hard refresh: Ctrl+Shift+R
- The SW uses network-first strategy so it should self-update, but cached versions can occasionally stick

---

## 10. Cost Projections

| Scale | Supabase Usage | Cloudflare Usage | Monthly Cost |
|-------|---------------|------------------|--------------|
| 1 user (current) | <1MB | <1000 requests | $0 |
| 9 cohorts, ~50 students | ~5MB | ~10,000 requests | $0 |
| 9 cohorts, ~200 students | ~20MB | ~50,000 requests | $0 |
| Multiple schools, ~1000 students | ~100MB | ~500,000 requests | $0 |
| Exceeding free tier | >500MB database | >100,000 deploys/month | Supabase Pro $25/mo |

Free tier is sufficient for at least 2-3 years of projected growth at DRBU scale.

---

*Last updated: March 2026 | Planner version: v2.7+*
