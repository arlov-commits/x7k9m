-- ============================================================================
-- Per-record sync schema for Academic Planner (v7.1)
-- Run this in the Supabase SQL editor. Single-user app: the anon key is used
-- directly (no auth), so policies are open — same trust model as the existing
-- planner_state row. The old planner_state table is left untouched.
--
-- Each synced collection gets its own table:
--   id         text  PRIMARY KEY  (client-generated, immutable)
--   data       jsonb              (the full record's fields)
--   updated_at timestamptz        (DB-OWNED via trigger; drives incremental pull + merge)
--   deleted_at timestamptz        (soft-delete tombstone; null = alive)
--
-- Deletes are SOFT (set deleted_at). No DELETE privilege is granted, so rows
-- are never hard-removed and a stale device can't resurrect a deleted record.
-- ============================================================================

-- 1.5 — shared trigger function: the DB owns updated_at on every insert AND update.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- ---- Helper macro pattern (repeated per table) -----------------------------
-- tasks ----------------------------------------------------------------------
create table if not exists public.tasks (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists tasks_updated_idx on public.tasks (updated_at);
drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before insert or update on public.tasks
  for each row execute function public.set_updated_at();
alter table public.tasks enable row level security;
drop policy if exists tasks_all on public.tasks;
create policy tasks_all on public.tasks for all using (true) with check (true);
grant select, insert, update on public.tasks to anon, authenticated;

-- events ---------------------------------------------------------------------
create table if not exists public.events (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists events_updated_idx on public.events (updated_at);
drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at before insert or update on public.events
  for each row execute function public.set_updated_at();
alter table public.events enable row level security;
drop policy if exists events_all on public.events;
create policy events_all on public.events for all using (true) with check (true);
grant select, insert, update on public.events to anon, authenticated;

-- syllabus -------------------------------------------------------------------
create table if not exists public.syllabus (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists syllabus_updated_idx on public.syllabus (updated_at);
drop trigger if exists syllabus_set_updated_at on public.syllabus;
create trigger syllabus_set_updated_at before insert or update on public.syllabus
  for each row execute function public.set_updated_at();
alter table public.syllabus enable row level security;
drop policy if exists syllabus_all on public.syllabus;
create policy syllabus_all on public.syllabus for all using (true) with check (true);
grant select, insert, update on public.syllabus to anon, authenticated;

-- life_tasks (state key: lifeTasks) ------------------------------------------
create table if not exists public.life_tasks (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists life_tasks_updated_idx on public.life_tasks (updated_at);
drop trigger if exists life_tasks_set_updated_at on public.life_tasks;
create trigger life_tasks_set_updated_at before insert or update on public.life_tasks
  for each row execute function public.set_updated_at();
alter table public.life_tasks enable row level security;
drop policy if exists life_tasks_all on public.life_tasks;
create policy life_tasks_all on public.life_tasks for all using (true) with check (true);
grant select, insert, update on public.life_tasks to anon, authenticated;

-- notes ----------------------------------------------------------------------
create table if not exists public.notes (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists notes_updated_idx on public.notes (updated_at);
drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at before insert or update on public.notes
  for each row execute function public.set_updated_at();
alter table public.notes enable row level security;
drop policy if exists notes_all on public.notes;
create policy notes_all on public.notes for all using (true) with check (true);
grant select, insert, update on public.notes to anon, authenticated;

-- deliverables ---------------------------------------------------------------
create table if not exists public.deliverables (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists deliverables_updated_idx on public.deliverables (updated_at);
drop trigger if exists deliverables_set_updated_at on public.deliverables;
create trigger deliverables_set_updated_at before insert or update on public.deliverables
  for each row execute function public.set_updated_at();
alter table public.deliverables enable row level security;
drop policy if exists deliverables_all on public.deliverables;
create policy deliverables_all on public.deliverables for all using (true) with check (true);
grant select, insert, update on public.deliverables to anon, authenticated;

-- profile (data-meaningful singletons; single row id='default', last-write-wins) (1.7)
create table if not exists public.profile (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
drop trigger if exists profile_set_updated_at on public.profile;
create trigger profile_set_updated_at before insert or update on public.profile
  for each row execute function public.set_updated_at();
alter table public.profile enable row level security;
drop policy if exists profile_all on public.profile;
create policy profile_all on public.profile for all using (true) with check (true);
grant select, insert, update on public.profile to anon, authenticated;

-- NOTE: do NOT drop or modify the existing planner_state table yet. It remains
-- as a frozen backup until the new per-record sync is confirmed working.
