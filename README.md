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
| `GEMINI_API_KEY` | Optional Gemini key for demo chat replies; scripted fallback is used when unset or when Gemini fails |

### First-time setup

- Supabase project: **StudyGroup** (`vykutvpclkadshbrgpfr`)
- Schema is already applied via migration — tables: `profiles`, `lobbies`, `lobby_members`
- **Profile photos:** run the SQL in `studygroup/supabase/migrations/20250410120000_profile_avatar_storage.sql` in the Supabase SQL Editor once (adds `profiles.avatar_url`, public `avatars` storage bucket, and RLS)
- **Weekly schedule table:** run the SQL in `studygroup/supabase/migrations/20260430120000_user_weekly_schedule.sql` in the Supabase SQL Editor once before using schedule/demo-calendar features
- **Profile reliability ratings:** run the SQL in `studygroup/supabase/migrations/20260430149000_profile_reliability_rating.sql` once before refreshing demo data
- **Demo data:** after the weekly schedule table exists, run the SQL in `studygroup/supabase/migrations/20260430150000_demo_open_lobbies_seed.sql` in the Supabase SQL Editor to seed or refresh demo users, lobbies, memberships, and calendars
- **No-expiry lobbies:** run the SQL in `studygroup/supabase/migrations/20260430151000_remove_lobby_expiration_behavior.sql` once to keep existing lobbies visible until manually closed
- Auth: email/password, restricted to `@vt.edu` addresses on the client

## Changelog

**Infrastructure**

- Scaffolded Next.js 15 app with TypeScript, Tailwind, and App Router
- Installed and configured `@supabase/supabase-js` and `@supabase/ssr`
- Created typed Supabase server and browser clients
- Added `/api/demo/chat` with optional Gemini replies and a deterministic scripted fallback for recorded demos
- Added a short Gemini timeout so demo chat falls back quickly instead of blocking a recording
- Added a profile reliability rating migration with a 1-5 range check
- Applied initial database migration (profiles, lobbies, lobby_members with RLS)
- Enabled Supabase Realtime on lobbies and lobby_members tables
- Generated TypeScript types from live Supabase schema
- Added proxy (auth-gated routing) via `proxy.ts`
- Moved signed-in pages into `app/(app)/` route group with shared server layout
- Added `lib/display-name.ts` utility with fallback chain: profile name → auth metadata → email local → "Student"
- SQL migration for `profiles.avatar_url`, public `avatars` Storage bucket, storage RLS, and profile self-update policy
- Renamed `middleware.ts` to `proxy.ts` and updated export to `proxy` per Next.js 15 convention
- Added `turbopack.root` to `next.config.ts` to fix workspace root detection in monorepo-style folder
- Added Vitest + React Testing Library (`vitest.config.ts`, `vitest.setup.ts`, `__tests__/LobbyList.join.test.tsx`)
- Added `test` script to `package.json`
- Added login page test coverage for render, VT email validation, auth failure, and success redirect (`__tests__/LoginPage.test.tsx`)
- Added unit tests for `displayNameForUser` fallback behavior in `lib/display-name.test.ts`

**Auth**

- Login page with @vt.edu email validation
- Signup page with name, email, password
- Auto-creates profile row on signup via Postgres trigger
- Sign out API route
- Profile page (`/profile`) — view name, major, year; edit major/year; upload profile photo to Supabase Storage with save/cancel flow
- Signed-in shell: avatar dropdown with "View profile" and "Sign out"

**Lobbies**

- Browse page listing lobbies until they are manually closed
- Groups page for study groups the signed-in user has joined or created
- Filter lobbies by campus location
- Search open lobbies from the top header search bar
- Create lobby form with course, location, description, and max size
- Visible `Create group` action on the lobbies page opens the existing group creation form
- Visible `Create group` actions in the sidebar and Groups page let students make their own study group quickly
- Removed lobby duration/time-left behavior so study groups stay visible until closed
- Added SQL seed migration for the recorded demo world with fake VT student hosts, full lobby memberships, and weekly calendars
- Clicking a lobby card opens an in-lobby chat modal
- In-lobby join flow: guests can click "Join group" and immediately see joined state, members, and chat access
- Lobby room modal now shows right-side member selection, multi-person calendar comparison, suggested shared times, and a schedule-session confirmation
- In-lobby chat sends demo messages through Gemini when configured and falls back to scripted VT student replies when unavailable
- Rerunning the demo seed removes Aidan from the CS 3704 membership so the direct Join group step can be recorded again
- Demo setup now removes Aidan from all preexisting lobby memberships and fills every seeded lobby with fake peer members
- Demo profiles now include seeded 1-5 reliability ratings
- Host can close (delete) their own lobby from the chat modal

**Realtime**

- In-lobby chat subscribes to `lobby_messages` Postgres changes via Supabase Realtime channel
- New messages from other users appear live without a page refresh

**UI**

- VT maroon (#861F41) brand color applied throughout
- Lobby cards showing course badge, location, host name, and member count
- `AppHeader` component with VT maroon nav, "+ New Lobby" link, and avatar dropdown
- `UserAvatar` component renders circular avatar with photo or initials fallback at any size
- `ProfilePageClient` with avatar upload (tap to pick, save/cancel), major, and year fields
- Circular avatars in the header and on lobby cards
- Replaced the signed-in top header with a left sidebar that includes lobby navigation and direct "Profile settings" access
- Added a blended app shell with persistent left sidebar plus top header containing a lobby search bar and top-right profile avatar shortcut
- Refreshed the signed-in UI to a cleaner modern dashboard style with light sidebar, pill search bar, softer page background, and updated lobby cards/filters
- Fully transitioned the signed-in shell and lobby browsing experience to a dark-mode-first dashboard palette (sidebar, top header, filters, cards, and chat modal)
- Added a notifications bell button to the signed-in header for clearer dashboard-style demo affordance
- Restyled the signed-in shell to a light, GroupHub-inspired dashboard layout with rounded search, right-side action icons, and a cleaner sidebar hierarchy
- Restored a dark-mode-only visual system across auth, shell, lobby creation, and profile settings surfaces
- Removed the standalone sidebar profile settings tab; profile editing now lives behind the profile/avatar entry point
- Refined the dark header to match the modern reference spacing with a large search pill and SVG-only action icons
- Tuned the top search placeholder to make the recorded `CS 3704` lookup obvious
- Added a traditional college timetable comparison inside the lobby room with multiple selected members overlaid
- Locked the lobby room modal into a side-by-side layout so the member list stays in the right rail beside the calendar during the recorded demo
- Reworked the schedule page into a traditional weekday college timetable with time rows and class blocks spanning their meeting times
- Simplified schedule class repeats into Daily and Custom tabs with Notion-style weekday chips
- Added visible schedule class delete controls on timetable blocks and in a side-panel class list
- Grouped repeated schedule classes into one `Your classes` entry with combined weekday labels
- Removed the `+ New lobby` action from the primary sidebar navigation
- Added a left-sidebar `Groups` tab for the signed-in user's current study groups
- Added a prominent left-sidebar `Create group` action and aligned the creation page with group wording
- Displayed reliability ratings as 1-5 stars on lobby hosts, group members, and profile pages

**Bug Fixes**

- Profile and lobby queries use wildcard selects so a missing `avatar_url` column before migration does not break the app
- Header display name falls back to auth metadata or email prefix instead of "Student" (fixes wrong initials like "ST")
- Removed global dark-mode CSS override that caused the modern dashboard refresh to flip to a black background on page reload
- Fixed header flex behavior so the notifications button remains visible after refresh and at tighter viewport widths
- Replaced icon-only notifications control with a high-contrast alerts pill and count badge to avoid intermittent visibility issues during refresh/demo
- Hardened header responsiveness with grid layout and adaptive text visibility so refresh/resizing no longer squishes controls on Safari-like viewport edge cases
- Reworked header into explicit search/notification/profile columns and reduced sidebar width at smaller desktop sizes to prevent refresh-time control squashing
- Stabilized header column rendering by pinning `grid-template-columns` directly, preventing occasional fallback to stacked single-column rows after refresh
- Pinned the modern dark header to explicit search/action columns so refresh no longer stretches the search bar over the action icons
- Removed the broken custom shell CSS class approach and restored utility-based shell/header layout with inline critical SVG/search sizing
- Fixed the recorded demo seed so it updates existing demo auth users by email instead of failing on duplicate email rows
- Removed stale request-to-join room controls so the recorded demo only shows the direct Join group flow
- Prevented realtime echoes from duplicating optimistic local chat messages in the lobby room

## Known Bugs

_None yet._

## Minor Gaps

- **Lobby list not realtime** — the lobby browse list requires a manual page refresh to reflect new lobbies or joins; only the in-lobby chat is realtime.
- **Profile photo migration required** — avatar upload requires running the SQL migration on the Supabase project once; until then Storage RLS will reject uploads.

## Deferred

- **Push/email notifications** — deferred until core lobby flow is validated; would require a Supabase Edge Function or third-party service.
- **Schedule/calendar integration** — out of scope for MVP; would require significant UX work.
- **Mobile app** — web-first for MVP; React Native port deferred.
