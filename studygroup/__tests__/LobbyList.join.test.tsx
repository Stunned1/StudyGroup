// AI-ASSISTED: ChatGPT (GPT-5) — verifies optimistic join behavior for recorded demo lobby flow
/**
 * AI-GENERATED: Kiro — functional test for the original join request flow in LobbyList
 *
 * Updated for the recorded demo join flow:
 * 1. Top search input query filters lobby cards
 * 2. A non-host user sees a clear "Join group" button when a lobby is open
 * 3. Clicking "Join group" inserts into lobby_members
 * 4. The modal immediately shows joined state, member profile/calendar UI,
 *    suggested availability, scheduled-session confirmation, and demo chat
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import LobbyList from "@/components/LobbyList";

const mockRouterRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRouterRefresh }),
}));

const insertCalls: { table: string; data: Record<string, unknown> }[] = [];

function makeQueryMock(resolveWith: unknown = { data: [], error: null }) {
  const chain: Record<string, unknown> & { __table?: string } = {};
  const methods = ["select", "eq", "order", "single", "insert", "delete"];
  methods.forEach((method) => {
    chain[method] = (...args: unknown[]) => {
      if (method === "insert") {
        insertCalls.push({
          table: chain.__table ?? "",
          data: args[0] as Record<string, unknown>,
        });
      }
      return { ...chain, then: (cb: (value: unknown) => void) => cb(resolveWith) };
    };
  });
  chain["then"] = (cb: (value: unknown) => void) => cb(resolveWith);
  return chain;
}

const channelMock = {
  on: vi.fn(() => channelMock),
  subscribe: vi.fn(() => channelMock),
};

const fromMock = vi.fn((table: string) => {
  const resolveWith =
    table === "profiles"
      ? { data: { name: "Aidan Nguyen" }, error: null }
      : table === "lobby_members"
        ? {
            data: [
              { user_id: "host-user-id", profiles: { name: "Priya Shah" } },
              {
                user_id: "member-user-id",
                profiles: { name: "Marcus Johnson" },
              },
            ],
            error: null,
          }
        : { data: [], error: null };
  const query = makeQueryMock(resolveWith);
  query.__table = table;
  return query;
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: fromMock,
    channel: vi.fn(() => channelMock),
    removeChannel: vi.fn(),
  }),
}));

const HOST_ID = "host-user-id";
const GUEST_ID = "guest-user-id";

const cs3704Lobby = {
  id: "lobby-1",
  course_id: "CS 3704",
  location: "Newman Library",
  description: "Software engineering project planning",
  max_size: 6,
  expires_at: "2099-12-31T23:59:59.000Z",
  host_id: HOST_ID,
  profiles: { name: "Priya Shah" },
  lobby_members: [{ count: 2 }],
};

const mathLobby = {
  id: "lobby-2",
  course_id: "MATH 1226",
  location: "McBryde Hall",
  description: "Calculus homework sprint",
  max_size: 5,
  expires_at: "2099-12-31T23:59:59.000Z",
  host_id: "other-host-id",
  profiles: { name: "Ethan Nguyen" },
  lobby_members: [{ count: 1 }],
};

describe("LobbyList — join flow", () => {
  beforeEach(() => {
    insertCalls.length = 0;
    vi.clearAllMocks();
  });

  it("filters lobby cards from the top search query", () => {
    render(
      <LobbyList
        lobbies={[cs3704Lobby, mathLobby]}
        userId={GUEST_ID}
        searchQuery="CS 3704"
      />
    );

    expect(screen.getAllByText("CS 3704").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("MATH 1226")).not.toBeInTheDocument();
    expect(screen.getByText("Search:")).toBeInTheDocument();
  });

  it("opens the modal with a clear join button for a non-host user", async () => {
    render(<LobbyList lobbies={[cs3704Lobby]} userId={GUEST_ID} />);

    fireEvent.click(screen.getByTestId("lobby-card-lobby-1"));

    await waitFor(() => {
      expect(screen.getByText("Join group")).toBeInTheDocument();
      expect(screen.getByText("Join to enter the room")).toBeInTheDocument();
    });
  });

  it("optimistically joins, inserts membership, and enables chat", async () => {
    render(<LobbyList lobbies={[cs3704Lobby]} userId={GUEST_ID} />);

    fireEvent.click(screen.getByTestId("lobby-card-lobby-1"));
    await waitFor(() => expect(screen.getByText("Join group")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Join group"));

    await waitFor(() => {
      expect(screen.getAllByText("Joined").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("You are in this group")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Ask a question...")).toBeEnabled();
      expect(screen.getAllByText("Priya Shah").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Marcus Johnson").length).toBeGreaterThanOrEqual(1);
    });

    const memberInsert = insertCalls.find(
      (call) =>
        call.table === "lobby_members" &&
        call.data.lobby_id === "lobby-1" &&
        call.data.user_id === GUEST_ID
    );
    expect(memberInsert).toBeDefined();
  });

  it("shows peer calendar comparison and schedules a suggested study session", async () => {
    render(<LobbyList lobbies={[cs3704Lobby]} userId={GUEST_ID} />);

    fireEvent.click(screen.getByTestId("lobby-card-lobby-1"));
    await waitFor(() => expect(screen.getByText("Join group")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Join group"));

    await waitFor(() => {
      expect(screen.getByText("Shared availability")).toBeInTheDocument();
      expect(screen.getByText("Tue 6:30 PM")).toBeInTheDocument();
      expect(screen.getByText("Schedule study session")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Schedule study session"));

    await waitFor(() => {
      expect(screen.getByText("CS 3704 confirmed")).toBeInTheDocument();
      expect(
        screen.getAllByText(/Tuesday, 6:30 PM at Newman Library/).length
      ).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Marcus Johnson/).length).toBeGreaterThanOrEqual(1);
      expect(
        screen.getByText(/Study session scheduled for CS 3704/)
      ).toBeInTheDocument();
    });
  });

  it("sends a demo chat message and shows fallback response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              reply: "Tuesday at 6:30 PM in Newman Library works for me.",
              source: "fallback",
            }),
        })
      )
    );

    render(<LobbyList lobbies={[cs3704Lobby]} userId={GUEST_ID} />);

    fireEvent.click(screen.getByTestId("lobby-card-lobby-1"));
    await waitFor(() => expect(screen.getByText("Join group")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Join group"));

    const input = await screen.findByPlaceholderText("Ask a question...");
    fireEvent.change(input, { target: { value: "Can we meet after class?" } });
    fireEvent.click(screen.getByText("Send"));

    await waitFor(() => {
      expect(screen.getByText("Can we meet after class?")).toBeInTheDocument();
      expect(
        screen.getByText("Tuesday at 6:30 PM in Newman Library works for me.")
      ).toBeInTheDocument();
    });

    vi.unstubAllGlobals();
  });

  it("starts joined when the current user is already a member", async () => {
    render(
      <LobbyList
        lobbies={[cs3704Lobby]}
        userId={GUEST_ID}
        joinedLobbyIds={["lobby-1"]}
      />
    );

    fireEvent.click(screen.getByTestId("lobby-card-lobby-1"));

    await waitFor(() => {
      expect(screen.queryByText("Join group")).not.toBeInTheDocument();
      expect(screen.getByText("You are in this group")).toBeInTheDocument();
      expect(screen.getByText("Shared availability")).toBeInTheDocument();
    });
  });
});
