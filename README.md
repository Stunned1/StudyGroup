# StudyGroup

Find your study group — a location-based study session finder for Virginia Tech students.

## Setup

1. Clone the repo and `cd studygroup`
2. `npm install`
3. Copy `.env.local` and fill in your Supabase credentials (already set for the hosted project)
4. `npm run dev`

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

### First-time setup

- Supabase project: **StudyGroup** (`vykutvpclkadshbrgpfr`)
- Schema is already applied via migration — tables: `profiles`, `lobbies`, `lobby_members`
- Auth: email/password, restricted to `@vt.edu` addresses on the client

## Changelog

**Infrastructure**

- Scaffolded Next.js 15 app with TypeScript, Tailwind, and App Router
- Installed and configured `@supabase/supabase-js` and `@supabase/ssr`
- Created typed Supabase server and browser clients
- Applied initial database migration (profiles, lobbies, lobby_members with RLS)
- Enabled Supabase Realtime on lobbies and lobby_members tables
- Generated TypeScript types from live Supabase schema
- Added middleware for auth-gated routing

**Auth**

- Login page with @vt.edu email validation
- Signup page with name, email, password
- Auto-creates profile row on signup via Postgres trigger
- Sign out API route

**Lobbies**

- Browse page listing all open (non-expired) lobbies
- Filter lobbies by course ID and campus location
- Create lobby form with course, location, description, max size, and duration
- Join lobby button with full-lobby guard
- Host can close (delete) their own lobby

**UI**

- VT maroon (#861F41) brand color applied throughout
- Lobby cards showing course badge, location, host name, member count, and time remaining

## Known Bugs

_None yet._

## Minor Gaps

- **No real-time updates** — lobby list requires a page refresh to reflect joins; Supabase Realtime subscription not yet wired into the client.
- **No in-lobby chat** — members can join but have no way to coordinate beyond the description field.

## Deferred

- **Push/email notifications** — deferred until core lobby flow is validated; would require a Supabase Edge Function or third-party service.
- **Schedule/calendar integration** — out of scope for MVP; would require significant UX work.
- **Mobile app** — web-first for MVP; React Native port deferred.
