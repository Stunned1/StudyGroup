# StudyGroup — Agent Instructions

This file applies to all agents working anywhere in this repository.

---

## README Maintenance (Required)

After **any** of the following, you MUST update `README.md` at the repo root:

- Adding a new feature
- Fixing a bug
- Discovering a data gap or limitation
- Deferring something for later
- Changing setup steps or environment variables

---

## How to Update the Changelog

The changelog lives in `README.md` under `## Changelog`. It is in the **middle** of the file — not at the bottom. Always insert new entries inside the `## Changelog` section, under the correct category heading.

### CRITICAL: Where to insert

- Find `## Changelog` in the README
- Find the correct category block (e.g. `**Auth**`)
- Add a new entry block under that category, or append to an existing block for the current session
- **NEVER append to the bottom of the file** — the README has sections after the changelog (Known Bugs, Minor Gaps, Deferred)

### Format

```
**Category**

- Description of change
```

### Categories

Use one of these exactly:

- `**Auth**` — login, signup, session management, VT email validation
- `**Lobbies**` — lobby creation, joining, expiration, filtering
- `**Realtime**` — Supabase realtime subscriptions, live updates
- `**UI**` — page layout, components, forms, navigation
- `**Infrastructure**` — API routes, env vars, build config, Supabase schema, scripts
- `**Bug Fixes**` — anything that was broken and is now fixed

### Rules

- Do NOT add dates to changelog entries
- Each bullet is a single concise sentence
- If multiple things changed in one session, group them under the same category block
- If a category block already exists, append to it — don't create a duplicate
- Never delete existing changelog entries
- **Use `strReplace` to insert into the correct location — never use `fsAppend`**

### Example of correct insertion

```markdown
**Lobbies**

- Added course ID filter to lobby browse page
- Lobby auto-expires after host-set duration
```

---

## How to Update Known Bugs

Add to `## Known Bugs` in `README.md`:

```markdown
- **Short title** — One sentence describing the bug, where it occurs, and what file/function is responsible. Include the fix approach if known.
```

Remove a bug entry once it is fixed and move it to the changelog as a bug fix.

---

## How to Update Minor Gaps

Add to `## Minor Gaps` in `README.md`:

```markdown
- **Short title** — What's missing, why it's missing, and what would be needed to fix it.
```

---

## How to Update Deferred Items

Add to `## Deferred` in `README.md`:

```markdown
- **Short title** — Why it was deferred, what the blocker is, and what conditions would allow it to be revisited.
```

---

## How to Update Setup

If you add a new environment variable, script, or required setup step, update `## Setup` in `README.md` accordingly. Keep the env var list and first-time setup steps accurate at all times.

---

## How to Update IMPLEMENTATION.md

`IMPLEMENTATION.md` lives at the repo root and must be kept current for course compliance. Update it when:

- A new feature is added
- A bug is fixed that changes behavior
- A new AI tool or prompt strategy is used

When updating, add to the relevant section:

- **What Was Built** — add a new row to the file/folder table
- **What the Generated Code Does** — append a short paragraph describing the new behavior and whether it met expectations
- **Modifications Made** — note any prompt iterations or code corrections that were needed

Do NOT rewrite the whole file — use `strReplace` to append to the correct section.

---

## Course Guidelines (Required)

This project is submitted for a university course. All agents working on this codebase must adhere to the following:

- **Label all AI-generated code.** Add a comment at the top of any file you create or significantly modify in the format:
  ```
  // AI-GENERATED: Kiro — <one sentence describing what this file does>
  ```
- **Log all significant changes in IMPLEMENTATION.md.** Every feature addition or fix must be reflected there, including what the code does, whether it met expectations, and any prompt/code modifications needed.
- **Do not misrepresent authorship.** Do not remove or alter AI-generated markers. Do not claim AI-generated code was written by hand.
- **Keep IMPLEMENTATION.md honest.** If generated code did not work as expected or required manual fixes, document that accurately.

---

## General Rules

- Always read `README.md` before starting work so you understand the current state of the project
- Never leave the README stale — if you touched the code, update the docs
- Keep entries concise — one sentence per bullet is the target
- Do not create separate markdown files to document your work — everything goes in `README.md`
- This is a VT (Virginia Tech) student product — keep UX decisions simple and campus-aware
