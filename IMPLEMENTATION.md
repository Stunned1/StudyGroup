# Implementation

This file is a course compliance log. It records every AI-assisted contribution to this codebase — what was built, which tools were used, what prompts were given, whether the output met expectations, and what modifications were needed.

**Do not edit past sessions. Do not delete entries. Add new sessions at the bottom.**

See `AGENTS.md` for detailed instructions on how to maintain this file.

---

## Sessions

---

### Session 1 — Initial scaffold, Supabase integration, and full MVP build

#### What Was Built

| File/Folder | What it does | AI-generated? |
|---|---|---|
| `MVP.txt` | Outlines the MVP feature set, VT-specific locations, tech stack, and success metric | Yes |
| `AGENTS.md` | Agent instructions for README and IMPLEMENTATION.md maintenance, changelog format, course compliance rules | Yes |
| `studygroup/` | Next.js 15 app scaffolded via `create-next-app` with TypeScript, Tailwind, App Router | Yes |
| `studygroup/.env.local` | Environment variables wired to the live Supabase project | Yes |
| `studygroup/lib/supabase/client.ts` | Typed Supabase browser client using `@supabase/ssr` | Yes |
| `studygroup/lib/supabase/server.ts` | Typed Supabase server client using `@supabase/ssr` and Next.js cookies | Yes |
| `studygroup/lib/types.ts` | Shared TypeScript types (Profile, Lobby, LobbyMember) and VT campus location constants | Yes |
| `studygroup/lib/database.types.ts` | TypeScript types auto-generated from the live Supabase schema | Yes |
| `studygroup/middleware.ts` | Supabase SSR middleware that enforces auth-gated routing across all routes | Yes |
| `studygroup/app/page.tsx` | Root page — redirects to `/lobbies` | Yes |
| `studygroup/app/layout.tsx` | Root layout with metadata, Geist font, Tailwind globals | Partial (scaffolded by create-next-app, metadata updated by AI) |
| `studygroup/app/login/page.tsx` | Login page with @vt.edu email validation and Supabase Auth sign-in | Yes |
| `studygroup/app/signup/page.tsx` | Signup page with name, email, password and Supabase Auth sign-up | Yes |
| `studygroup/app/lobbies/page.tsx` | Server component — fetches and renders open lobbies from Supabase | Yes |
| `studygroup/app/lobbies/new/page.tsx` | Server component — renders the new lobby form | Yes |
| `studygroup/app/api/auth/signout/route.ts` | POST route that calls `supabase.auth.signOut()` and redirects to `/login` | Yes |
| `studygroup/components/LobbyList.tsx` | Client component — lobby cards with course/location filters, join button, close button | Yes |
| `studygroup/components/NewLobbyForm.tsx` | Client component — lobby creation form with course ID, VT location picker, max size, duration | Yes |
| Supabase migration (applied remotely) | `profiles`, `lobbies`, `lobby_members` tables; RLS policies; realtime enabled; Postgres trigger to auto-create profile on signup | Yes |

#### AI Tool(s) Used

- **Kiro** — built-in AI agent in the Kiro IDE
- Mode: Autopilot (agent reads and writes files directly without per-change approval)
- Model: auto (Kiro selects model; exact model not exposed to user)
- Kiro also used its **Supabase MCP integration** to interact with the hosted Supabase project directly — listing projects, applying migrations, fetching API keys, generating types, and checking security advisors

#### Prompts Used

Prompts were conversational and iterative. Listed in order:

1. _(Provided the course description of the product)_ "We're making StudyGroup — [description of study group finder for VT students with lobby system]. Make an MVP.txt file to outline a quick MVP of what our product should be (remember, VT students). Make an AGENTS.md file so we can have detailed instructions for LLMs and agents when they update our codebase. Structure it like this: [provided example AGENTS.md format]. Then add some starter code for me to work with."
2. "Use your supabase superpower to use supabase, its already titled studygroup" — triggered Kiro to use its Supabase MCP tool to find the existing project, wire up credentials, apply the schema, and generate types.
3. "Don't forget to do what you were doing before too" — Kiro had paused after Supabase setup; this prompted it to finish the app pages and components.
4. "Wait no I meant the agents.md and the mvp.txt" — clarified that the previous message was about verifying those files existed, not about code. Kiro confirmed both were already created correctly.
5. "I don't think you ever finished it, was it finished?" — prompted Kiro to audit the project structure and confirm all files were present. It identified the `layout.tsx` metadata was still the default Next.js boilerplate and updated it.
6. "Ok we're about to push to main, can you check that the gitignore is working for the .env.local" — Kiro read the `.gitignore` and ran `git check-ignore -v .env.local` to confirm it was covered by the `.env*` rule.
7. "Ok, update the changelog and I'll push" — Kiro confirmed the changelog was already up to date from the build session and no new entry was needed.
8. "Make an IMPLEMENTATION.md file. Add to AGENTS.md instructions on how to maintain it. Make sure agents adhere to course guidelines." — produced the first version of this file and updated AGENTS.md.
9. "Make sure the AGENTS.md is DETAILED in its instructions. Remember that not all agents will be Kiro. Make sure IMPLEMENTATION.md is structured well and well maintained by the detailed instructions in AGENTS.md." — produced the current version of both files.

#### What the Code Does and Whether It Met Expectations

**Auth flow** — Login and signup pages validate `@vt.edu` email on the client before calling Supabase Auth. A Postgres trigger (`on_auth_user_created`) auto-inserts a row into `public.profiles` using the user's email and display name from metadata. Middleware redirects unauthenticated users to `/login` and authenticated users away from auth pages. This all worked as expected on first generation.

**Lobby system** — Users create lobbies with a course ID (free text, uppercased), a campus location from a fixed VT list, an optional description, max group size (2–20), and a duration (30 min to 3 hours). `expires_at` is computed at creation time. The browse page queries only lobbies where `expires_at > now()`. Filters for course and location work client-side. Hosts can delete their own lobby; other users can join up to `max_size`. This matched the MVP spec from `MVP.txt`.

**Database** — RLS policies restrict mutations to the row owner. Realtime was enabled on both `lobbies` and `lobby_members` via `alter publication supabase_realtime add table`. The schema passed Supabase's security advisor with zero warnings. One gap: the React client does not yet subscribe to realtime events, so the lobby list requires a manual page refresh to reflect joins. This is documented in README under Minor Gaps.

**TypeScript types** — Initial `lib/types.ts` used hand-written types. After the Supabase migration was applied, Kiro generated `lib/database.types.ts` from the live schema via MCP and updated both Supabase clients to use the `Database` generic. This was a self-correction Kiro made without being prompted.

**Overall** — The generated code met MVP expectations. The only unmet expectation is the missing realtime client subscription, which is a known gap, not a bug.

#### Modifications Made

- **Prompt refinement:** The initial prompt asked for "starter code" without specifying the full page structure. A follow-up ("don't forget to do what you were doing before") was needed to get Kiro to finish the components and pages after it paused to set up Supabase.
- **Type correction:** Kiro self-corrected from hand-written types to generated types after applying the migration. No manual intervention was needed.
- **Metadata update:** `app/layout.tsx` title and description were still the default Next.js boilerplate after scaffolding. Kiro updated them when prompted to audit completeness.
- **AGENTS.md iteration:** The first version of AGENTS.md was modeled on a provided example and adapted for this project. A second pass (this session) rewrote it to be tool-agnostic, more detailed, and to include the session-based IMPLEMENTATION.md format.

#### AI Comment Markers Added

- `// AI-GENERATED: Kiro — typed Supabase server client using @supabase/ssr` → `studygroup/lib/supabase/server.ts`
- `// AI-GENERATED: Kiro — typed Supabase browser client using @supabase/ssr` → `studygroup/lib/supabase/client.ts`
- `// AI-GENERATED: Kiro — Supabase SSR middleware for auth-gated routing` → `studygroup/middleware.ts`
- `// AI-GENERATED: Kiro — lobby list client component with join/close logic and course/location filters` → `studygroup/components/LobbyList.tsx`
- `// AI-GENERATED: Kiro — new lobby creation form with VT location picker and duration selector` → `studygroup/components/NewLobbyForm.tsx`
- `// AI-GENERATED: Kiro — shared app types and VT campus location constants` → `studygroup/lib/types.ts`
- `// AI-GENERATED: Kiro — TypeScript types generated from live Supabase schema` → `studygroup/lib/database.types.ts`

---
