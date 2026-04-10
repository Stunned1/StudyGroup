# StudyGroup — Agent Instructions

This file applies to **all AI agents** working anywhere in this repository, regardless of which tool or model you are. Read this entire file before making any changes.

---

## Table of Contents

1. [General Rules](#general-rules)
2. [README Maintenance](#readme-maintenance)
3. [IMPLEMENTATION.md Maintenance](#implementationmd-maintenance)
4. [Course Compliance — AI Labeling](#course-compliance--ai-labeling)
5. [Changelog Format](#changelog-format)
6. [Known Bugs / Minor Gaps / Deferred](#known-bugs--minor-gaps--deferred)
7. [Setup Documentation](#setup-documentation)

---

## General Rules

- **Always read `README.md` before starting work** so you understand the current state of the project.
- **Always read `IMPLEMENTATION.md` before starting work** so you understand what has already been built and documented.
- Never leave either file stale — if you touched code, you update the docs.
- Do not create additional markdown files to document your work. Everything goes in `README.md` and `IMPLEMENTATION.md`.
- This is a Virginia Tech student product. Keep UX decisions simple and campus-aware.
- Use `strReplace` for all targeted edits to existing files. Never use `fsAppend` on structured documents.

---

## README Maintenance

Update `README.md` at the repo root after **any** of the following:

- Adding a new feature
- Fixing a bug
- Discovering a data gap or limitation
- Deferring something for later
- Changing setup steps or environment variables

---

## IMPLEMENTATION.md Maintenance

`IMPLEMENTATION.md` lives at the repo root. It is a **course compliance document** that logs every AI-assisted contribution to this codebase. It must be kept accurate and up to date.

### When to update

Update `IMPLEMENTATION.md` whenever you:

- Create a new file
- Significantly modify an existing file
- Apply a database migration or schema change
- Use a new AI tool, model, or prompt strategy
- Fix a bug that changes observable behavior
- Discover that generated code did not work as expected

### Structure of IMPLEMENTATION.md

The file has the following top-level sections. Do not add new top-level sections without a strong reason. Do not reorder or remove existing sections.

```
# Implementation
## Sessions
### Session N — <short title>
#### What Was Built
#### AI Tool(s) Used
#### Prompts Used
#### What the Code Does and Whether It Met Expectations
#### Modifications Made
#### AI Comment Markers Added
```

Each time you do a meaningful unit of work, you add a **new Session block** at the bottom of `## Sessions`. Sessions are numbered sequentially (Session 1, Session 2, etc.).

### How to add a new Session block

1. Read `IMPLEMENTATION.md` to find the last session number.
2. Increment by 1 for your new session.
3. Use `strReplace` to insert the new session block **at the bottom of the `## Sessions` section**, before any trailing content or end of file.
4. Fill in every subsection — do not leave any blank.

### Session block template

Copy this exactly and fill in all fields:

```markdown
### Session N — <short title describing what was done>

#### What Was Built

| File/Folder | What it does | AI-generated? |
|---|---|---|
| `path/to/file.tsx` | One sentence description | Yes / Partial / No |

#### AI Tool(s) Used

- **Tool name** (e.g. Kiro, GitHub Copilot, ChatGPT, Claude, Cursor, etc.)
- Mode used if applicable (e.g. Autopilot, Chat, Inline completion)
- Model name if known (e.g. Claude 3.5 Sonnet, GPT-4o)

#### Prompts Used

List the actual prompts or paraphrased prompts that drove this session, in order. Be specific — a future reader should understand exactly what was asked.

1. "Exact or paraphrased prompt text"
2. "Follow-up prompt text"
3. etc.

If prompts were iterated or refined, note what changed and why.

#### What the Code Does and Whether It Met Expectations

For each major piece of code generated, write a short paragraph:
- What it does functionally
- Whether it behaved as expected when tested
- Any unexpected behavior, errors, or gaps

#### Modifications Made

List any changes that were required after the initial generation:
- Prompt modifications (what you changed in the prompt and why)
- Code corrections (what was wrong, what was fixed, who fixed it — you or the AI)
- If nothing needed modification, write: "No modifications were necessary."

#### AI Comment Markers Added

List every file where you added an `// AI-GENERATED` comment, in the format:

- `// AI-GENERATED: <ToolName> — <description>` → `path/to/file`

If a file was not AI-generated, do not add a marker and do not list it here.
```

### Rules for IMPLEMENTATION.md

- **Never delete or edit past sessions.** They are a permanent log.
- **Never summarize or compress past sessions** to save space.
- **Be honest.** If the code didn't work, say so. If you had to fix it, say so and explain what was wrong.
- **Be specific about prompts.** Vague entries like "asked AI to build the feature" are not acceptable.
- **Attribute the correct tool.** If you are not Kiro, identify yourself accurately (e.g. GitHub Copilot, ChatGPT, Claude via API, Cursor, etc.).
- Use `strReplace` to append the new session block. Target the end of the last existing session as your `oldStr` anchor.

---

## Course Compliance — AI Labeling

This project is submitted for a university course that requires all AI-generated code to be clearly labeled.

### Comment format

Add this comment as the **first line** of any file you create or significantly modify:

```
// AI-GENERATED: <ToolName> — <one sentence describing what this file does>
```

Examples:
```ts
// AI-GENERATED: Kiro — typed Supabase server client using @supabase/ssr
// AI-GENERATED: GitHub Copilot — lobby creation form with VT location picker
// AI-GENERATED: ChatGPT (GPT-4o) — Supabase SSR middleware for auth-gated routing
```

### Rules

- Use your actual tool name, not "AI" generically.
- If a file was partially AI-generated (e.g. you wrote the skeleton and AI filled in logic), use `// AI-ASSISTED:` instead of `// AI-GENERATED:`.
- If a file was written entirely by hand with no AI involvement, do not add a marker.
- **Never remove or alter existing AI markers** left by previous agents.
- After adding markers, log them in the `#### AI Comment Markers Added` section of your session block in `IMPLEMENTATION.md`.

---

## Changelog Format

The changelog lives in `README.md` under `## Changelog`. It is in the **middle** of the file — not at the bottom.

### CRITICAL: Where to insert

- Find `## Changelog` in the README
- Find the correct category block
- Append your bullet(s) under that category
- **NEVER append to the bottom of the file** — the README has sections after the changelog

### Format

```markdown
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
- If a category block already exists, append to it — don't create a duplicate
- Never delete existing changelog entries
- Use `strReplace` to insert — never `fsAppend`

---

## Known Bugs / Minor Gaps / Deferred

### Known Bugs

Add to `## Known Bugs` in `README.md`:

```markdown
- **Short title** — One sentence: what the bug is, where it occurs, which file/function is responsible. Include fix approach if known.
```

Remove a bug entry once fixed and move it to the changelog as a Bug Fix.

### Minor Gaps

Add to `## Minor Gaps` in `README.md`:

```markdown
- **Short title** — What's missing, why it's missing, what would be needed to fix it.
```

### Deferred

Add to `## Deferred` in `README.md`:

```markdown
- **Short title** — Why it was deferred, what the blocker is, what conditions would allow it to be revisited.
```

---

## Setup Documentation

If you add a new environment variable, script, or required setup step, update `## Setup` in `README.md`. Keep the env var table and first-time setup steps accurate at all times.
