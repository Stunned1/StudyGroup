# StudyGroup

Find your study group — a location-based study session finder for Virginia Tech students.

## Setup

1. Clone the repo and `cd studygroup`
2. `npm install`
3. Copy `.env.local` and fill in your Supabase credentials (already set for the hosted project)
4. `npm run dev`
5. Run `npm run test` to verify the test suite passes

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

### First-time setup

- Supabase project: **StudyGroup** (`vykutvpclkadshbrgpfr`)
- Schema is already applied via migration — tables: `profiles`, `lobbies`, `lobby_members`
- **Profile photos:** run the SQL in `studygroup/supabase/migrations/20250410120000_profile_avatar_storage.sql` in the Supabase SQL Editor once (adds `profiles.avatar_url`, public `avatars` storage bucket, and RLS)
- Auth: email/password, restricted to `@vt.edu` addresses on the client

## Changelog

**Infrastructure**

- Scaffolded Next.js 15 app with TypeScript, Tailwind, and App Router
- Installed and configured `@supabase/supabase-js` and `@supabase/ssr`
- Created typed Supabase server and browser clients
- Applied initial database migration (profiles, lobbies, lobby_members with RLS)
- Enabled Supabase Realtime on lobbies and lobby_members tables
- Generated TypeScript types from live Supabase schema
- Added proxy (auth-gated routing) via `proxy.ts`
- Moved signed-in pages into `app/(app)/` route group with shared server layout
- Added `lib/display-name.ts` utility with fallback chain: profile name → auth metadata → email local → "Student"
- SQL migration for `profiles.avatar_url`, public `avatars` Storage bucket, storage RLS, and profile self-update policy
- Renamed `middleware.ts` to `proxy.ts` and updated export to `proxy` per Next.js 15 convention
- Added `turbopack.root` to `next.config.ts` to fix workspace root detection in monorepo-style folder
- Added Vitest + React Testing Library (`vitest.config.ts`, `vitest.setup.ts`, `__tests__/LobbyList.knock.test.tsx`)
- Added `test` script to `package.json`

**Auth**

- Login page with @vt.edu email validation
- Signup page with name, email, password
- Auto-creates profile row on signup via Postgres trigger
- Sign out API route
- Profile page (`/profile`) — view name, major, year; edit major/year; upload profile photo to Supabase Storage with save/cancel flow
- Signed-in shell: avatar dropdown with "View profile" and "Sign out"

**Lobbies**

- Browse page listing all open (non-expired) lobbies
- Filter lobbies by course ID and campus location
- Create lobby form with course, location, description, max size, and duration
- Clicking a lobby card opens an in-lobby chat modal
- In-lobby chat: guests can send messages and knock to request entry
- Host sees Accept/Decline buttons on knock messages; accepting adds the guest to `lobby_members`
- Host can close (delete) their own lobby from the chat modal

**Realtime**

- In-lobby chat subscribes to `lobby_messages` Postgres changes via Supabase Realtime channel
- New messages from other users appear live without a page refresh

**UI**

- VT maroon (#861F41) brand color applied throughout
- Lobby cards showing course badge, location, host name, member count, and time remaining
- `AppHeader` component with VT maroon nav, "+ New Lobby" link, and avatar dropdown
- `UserAvatar` component renders circular avatar with photo or initials fallback at any size
- `ProfilePageClient` with avatar upload (tap to pick, save/cancel), major, and year fields
- Circular avatars in the header and on lobby cards

**Bug Fixes**

- Profile and lobby queries use wildcard selects so a missing `avatar_url` column before migration does not break the app
- Header display name falls back to auth metadata or email prefix instead of "Student" (fixes wrong initials like "ST")

## Known Bugs

_None yet._

## Minor Gaps

- **Lobby list not realtime** — the lobby browse list requires a manual page refresh to reflect new lobbies or joins; only the in-lobby chat is realtime.
- **Profile photo migration required** — avatar upload requires running the SQL migration on the Supabase project once; until then Storage RLS will reject uploads.

## Deferred

- **Push/email notifications** — deferred until core lobby flow is validated; would require a Supabase Edge Function or third-party service.
- **Schedule/calendar integration** — out of scope for MVP; would require significant UX work.
- **Mobile app** — web-first for MVP; React Native port deferred.
