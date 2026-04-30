StudyGroup is a Virginia Tech-focused study session app built with Next.js and Supabase.

## Features

- Authenticated students can browse and create study lobbies.
- Profiles support major, year, and avatar updates.
- Signed-in users can maintain a private weekly class schedule from the Schedule sidebar tab.

## Setup

Required environment variables:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL used by browser and server clients. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key used by browser and server clients. |

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

If styles disappear only after a development refresh, stop the dev server and run:

```bash
npm run dev:webpack
```

Next.js 16 uses Turbopack for `next dev` by default. The Webpack dev script is a fallback for stale development chunks or refresh-only styling drift; production builds should still be checked with `npm run build`.

Apply Supabase migrations before using features that require new tables or columns.

The weekly Schedule tab requires `supabase/migrations/20260430120000_user_weekly_schedule.sql`. If Supabase reports that `public.schedule_classes` is missing from the schema cache, apply that migration and reload the app.

## Changelog

**Auth**

- Existing auth flow remains the entry point for all app pages.

**Lobbies**

- Existing lobby browsing and creation remain available from the sidebar.

**Realtime**

- Existing lobby message subscriptions remain unchanged.

**UI**

- Added a Schedule sidebar tab with a one-week class calendar and an add-class form.
- Improved Schedule class entry with repeat presets and custom weekday toggles.
- Right-aligned the header settings, notification, and profile actions.

**Infrastructure**

- Added a `schedule_classes` Supabase table for private user-owned weekly class blocks.
- Added a Webpack dev fallback script for refresh-only styling issues caused by stale Turbopack development chunks.

**Bug Fixes**

- Schedule now shows a setup message instead of logging a console error when the `schedule_classes` table migration has not been applied.

## Known Bugs

- No known bugs are currently documented.

## Minor Gaps

- **Schedule editing** — Schedule entries can be added and deleted, but editing an existing class requires deleting and re-adding it.

## Deferred

- **Conflict detection** — Overlapping class time warnings were deferred because the first version focuses on basic account-owned schedule entry and display.
