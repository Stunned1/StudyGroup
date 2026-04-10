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
- **Profile photos:** run the SQL in `studygroup/supabase/migrations/20250410120000_profile_avatar_storage.sql` in the Supabase SQL Editor once (adds `profiles.avatar_url`, public `avatars` storage bucket, and RLS). Rebuild the app with `NEXT_PUBLIC_SUPABASE_URL` set so Next.js can optimize images from Storage.
- Auth: email/password, restricted to `@vt.edu` addresses on the client

## Changelog

**Infrastructure**

- SQL migration and docs for `profiles.avatar_url`, public Storage bucket `avatars`, storage RLS, and profile self-update policy (`studygroup/supabase/migrations/20250410120000_profile_avatar_storage.sql`)
- Next.js `images.remotePatterns` for Supabase Storage public object URLs
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
- Profile page (`/profile`) to view name, major, and year; edit major/year; upload profile photo to Storage with save/cancel
- Signed-in shell: avatar opens menu with “View profile” and “Sign out” (replaces standalone sign-out control)

**Lobbies**

- Browse page listing all open (non-expired) lobbies
- Host profile picture shown on lobby cards when set
- Filter lobbies by course ID and campus location
- Create lobby form with course, location, description, max size, and duration
- Join lobby button with full-lobby guard
- Host can close (delete) their own lobby

**UI**

- VT maroon (#861F41) brand color applied throughout
- Lobby cards showing course badge, location, host name, member count, and time remaining
- Circular user avatars (image or initials) in the header and on lobby cards

**Bug Fixes**

- Lobbies and header profile queries use wildcard profile selects so a missing `avatar_url` column (before migration) does not break the app; header display name falls back to auth metadata or email instead of defaulting to “Student” (fixes wrong initials such as “ST”)

## Known Bugs

_None yet._

## Minor Gaps

- **No real-time updates** — lobby list requires a page refresh to reflect joins; Supabase Realtime subscription not yet wired into the client.
- **No in-lobby chat** — members can join but have no way to coordinate beyond the description field.
- **Profile photo migration** — avatar upload and `avatar_url` updates require running `studygroup/supabase/migrations/20250410120000_profile_avatar_storage.sql` on the Supabase project once; until then, Storage/RLS may reject uploads.

## Deferred

- **Push/email notifications** — deferred until core lobby flow is validated; would require a Supabase Edge Function or third-party service.
- **Schedule/calendar integration** — out of scope for MVP; would require significant UX work.
- **Mobile app** — web-first for MVP; React Native port deferred.
