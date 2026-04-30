/**
 * AI-GENERATED: Cursor (Codex 5.3) — unit tests for display name fallback logic
 * Prompt log:
 * 1) "Generate unit tests for the function(s) implemented for PM4 (at least one unit test per function)."
 * 2) "can you generate at least one test please"
 */
import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";
import { displayNameForUser } from "@/lib/display-name";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email: "hokie@vt.edu",
    ...overrides,
  } as User;
}

describe("displayNameForUser", () => {
  it("prefers profile name over metadata and email", () => {
    const user = makeUser({
      email: "emailfallback@vt.edu",
      user_metadata: { name: "Metadata Name" },
    });

    const result = displayNameForUser({ name: "Profile Name" }, user);
    expect(result).toBe("Profile Name");
  });

  it("falls back to user metadata name when profile name is missing", () => {
    const user = makeUser({ user_metadata: { name: "Metadata Name" } });

    const result = displayNameForUser({ name: "   " }, user);
    expect(result).toBe("Metadata Name");
  });

  it("falls back to email local-part when profile and metadata names are missing", () => {
    const user = makeUser({
      email: "my.local.part@vt.edu",
      user_metadata: { name: "   " },
    });

    const result = displayNameForUser(null, user);
    expect(result).toBe("my.local.part");
  });

  it('returns "Student" when all fallbacks are unavailable', () => {
    const user = makeUser({
      email: undefined,
      user_metadata: {},
    });

    const result = displayNameForUser(undefined, user);
    expect(result).toBe("Student");
  });
});
