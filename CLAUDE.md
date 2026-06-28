# CLAUDE.md — Academic Planner (x7k9m)

Operating instructions for Claude Code working in this repo. Read this before making changes.

## What this is
A single-file academic planner PWA (`index.html`, vanilla HTML/CSS/JS, no build step) for one user. Tabs: Dashboard, Week (sprints), Syllabus, Tasks, Events, Notes. Data persists to localStorage and mirrors to Supabase. Hosted on Cloudflare Pages, auto-deploys from `main`.

## Deploy workflow (NON-NEGOTIABLE)
- **Never commit directly to `main`.** A live user depends on `main`.
- Work on a branch. Push the branch → Cloudflare builds a **preview URL** automatically.
- The user tests the preview URL on PC + phone, then merges the PR to `main` to ship.
- When you finish a task: push the branch and tell the user the exact branch name and that they need to open the PR and merge it. Do not assume merged.
- Branch naming: `claude/<short-description>`.

## Versioning
- Version lives as an HTML comment on line 1: `<!-- Academic Planner vX.Y -->`, and in a visible `.version-label` in the header, and in the service worker `CACHE_NAME`.
- **Bump the version on every commit** (patch bumps for fixes, minor for features). Current: v7.0. All three locations must match.
- Bumping the SW `CACHE_NAME` every change is required or installed devices serve stale code.

## Architecture rules (hard-won — do not violate)
- **localStorage is the source of truth for the UI.** The network is never in the critical path of a user action. A tap/keystroke must never block on a fetch.
- **NEVER do whole-state last-write-wins.** Do not overwrite the whole remote blob with one device's whole local blob, and do not replace the whole local state from a remote payload. This silently destroys cross-device edits. (See SYNC_REFERENCE.md.)
- Sync reconciliation is **per-record, by immutable client-generated id**, with a DB-owned `updated_at` and `deleted_at` tombstones. Merge by id; never wholesale-replace arrays.
- Re-renders must not clobber in-progress user input. Never swap the entire state object out from under an open editor/text field mid-typing.
- Per-device cosmetic prefs (theme, UI modes) stay in localStorage and are NEVER synced. Only data-meaningful state syncs.

## Service worker
- Bump `CACHE_NAME` every meaningful change.
- `install`: cache shell, `skipWaiting()`. `activate`: delete old caches, `clients.claim()`.
- Registration side: loop-guarded `controllerchange` reload (reload once when new SW takes control; guard with a flag; skip first install) so a refresh lands on new code.

## When unsure
Prefer the smallest correct change. If a change touches sync/persistence, follow SYNC_REFERENCE.md exactly. Ask the user before any destructive data migration.
