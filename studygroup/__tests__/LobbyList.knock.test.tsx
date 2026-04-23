/**
 * AI-GENERATED: Kiro — functional test for knock-to-join flow in LobbyList
 *
 * Tests that:
 * 1. A non-host user sees the "Knock to join" button when a lobby is open
 * 2. Clicking "Knock to join" inserts a knock message via Supabase
 * 3. The host sees Accept/Decline buttons on a knock message
 * 4. Clicking Accept inserts an accepted message and adds the user to lobby_members
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import LobbyList from "@/components/LobbyList";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockRouterRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRouterRefresh }),
}));

// Track all Supabase insert calls so we can assert on them
const insertCalls: { table: string; data: Record<string, unknown> }[] = [];

// Build a chainable Supabase mock
function makeQueryMock(resolveWith: unknown = { data: [], error: null }) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "eq", "order", "single", "insert", "delete"];
  methods.forEach((m) => {
    chain[m] = (..._args: unknown[]) => {
      if (m === "insert") {
        // record what was inserted and which table
        insertCalls.push({
          table: (chain as any).__table,
          data: _args[0] as Record<string, unknown>,
        });
      }
      return { ...chain, then: (cb: (v: unknown) => void) => cb(resolveWith) };
    };
  });
  chain["then"] = (cb: (v: unknown) => void) => cb(resolveWith);
  return chain;
}

// Supabase channel mock — captures the INSERT callback so we can fire it
let capturedInsertCallback: ((payload: unknown) => void) | null = null;
const channelMock = {
  on: vi.fn((_event: string, _filter: unknown, cb: (p: unknown) => void) => {
    capturedInsertCallback = cb;
    return channelMock;
  }),
  subscribe: vi.fn(() => channelMock),
};

const fromMock = vi.fn((table: string) => {
  const q = makeQueryMock(
    table === "profiles"
      ? { data: { name: "Test User" }, error: null }
      : { data: [], error: null }
  );
  (q as any).__table = table;
  return q;
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: fromMock,
    channel: vi.fn(() => channelMock),
    removeChannel: vi.fn(),
  }),
}));

// ── Fixtures ─────────────────────────────────────────────────────────────────

const HOST_ID = "host-user-id";
const GUEST_ID = "guest-user-id";

const baseLobby = {
  id: "lobby-1",
  course_id: "CS 3114",
  location: "Torgersen Hall",
  description: "Working on HW3",
  max_size: 5,
  expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  host_id: HOST_ID,
  profiles: { name: "Host Hokie" },
  lobby_members: [{ count: 1 }],
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("LobbyList — knock-to-join flow", () => {
  beforeEach(() => {
    insertCalls.length = 0;
    capturedInsertCallback = null;
    vi.clearAllMocks();
  });

  it("shows the lobby card with course badge and location", () => {
    render(<LobbyList lobbies={[baseLobby]} userId={GUEST_ID} />);
    expect(screen.getByText("CS 3114")).toBeInTheDocument();
    // Use getAllByText since "Torgersen Hall" also appears in the location filter <option>
    const locationHeadings = screen.getAllByText("Torgersen Hall");
    expect(locationHeadings.length).toBeGreaterThanOrEqual(1);
  });

  it("opens the chat modal when a lobby card is clicked", async () => {
    render(<LobbyList lobbies={[baseLobby]} userId={GUEST_ID} />);
    // Click the card's <p> element specifically (not the <option>)
    const card = screen.getByText("Working on HW3").closest("div[class*='cursor-pointer']")!;
    fireEvent.click(card);
    await waitFor(() => {
      expect(screen.getByText("🚪 Knock to join")).toBeInTheDocument();
    });
  });

  it("inserts a knock message when guest clicks 'Knock to join'", async () => {
    render(<LobbyList lobbies={[baseLobby]} userId={GUEST_ID} />);
    const card = screen.getByText("Working on HW3").closest("div[class*='cursor-pointer']")!;
    fireEvent.click(card);

    await waitFor(() =>
      expect(screen.getByText("🚪 Knock to join")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText("🚪 Knock to join"));

    await waitFor(() => {
      const knock = insertCalls.find(
        (c) => c.table === "lobby_messages" && (c.data as any).type === "knock"
      );
      expect(knock).toBeDefined();
      expect((knock!.data as any).lobby_id).toBe("lobby-1");
      expect((knock!.data as any).user_id).toBe(GUEST_ID);
    });
  });

  it("host sees Accept/Decline buttons when a knock arrives via realtime", async () => {
    render(<LobbyList lobbies={[baseLobby]} userId={HOST_ID} />);
    const card = screen.getByText("Working on HW3").closest("div[class*='cursor-pointer']")!;
    fireEvent.click(card);

    // Wait for channel subscription to be set up
    await waitFor(() => expect(capturedInsertCallback).not.toBeNull());

    // Simulate a realtime knock arriving
    capturedInsertCallback!({
      new: {
        id: "msg-1",
        lobby_id: "lobby-1",
        user_id: GUEST_ID,
        content: "Guest Hokie is knocking to join!",
        type: "knock",
        created_at: new Date().toISOString(),
        profiles: { name: "Guest Hokie" },
      },
    });

    await waitFor(() => {
      expect(screen.getByText("Accept")).toBeInTheDocument();
      expect(screen.getByText("Decline")).toBeInTheDocument();
    });
  });

  it("host clicking Accept inserts an accepted message and adds user to lobby_members", async () => {
    render(<LobbyList lobbies={[baseLobby]} userId={HOST_ID} />);
    const card = screen.getByText("Working on HW3").closest("div[class*='cursor-pointer']")!;
    fireEvent.click(card);

    await waitFor(() => expect(capturedInsertCallback).not.toBeNull());

    capturedInsertCallback!({
      new: {
        id: "msg-2",
        lobby_id: "lobby-1",
        user_id: GUEST_ID,
        content: "Guest Hokie is knocking to join!",
        type: "knock",
        created_at: new Date().toISOString(),
        profiles: { name: "Guest Hokie" },
      },
    });

    await waitFor(() =>
      expect(screen.getByText("Accept")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText("Accept"));

    await waitFor(() => {
      const accepted = insertCalls.find(
        (c) =>
          c.table === "lobby_messages" &&
          (c.data as any).type === "accepted"
      );
      expect(accepted).toBeDefined();

      const memberInsert = insertCalls.find(
        (c) =>
          c.table === "lobby_members" &&
          (c.data as any).user_id === GUEST_ID
      );
      expect(memberInsert).toBeDefined();
    });
  });
});
