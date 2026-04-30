// AI-ASSISTED: Cursor (Codex 5.3) — dark-mode lobby list cards, filters, and modal surfaces
// AI-ASSISTED: ChatGPT (GPT-5) — replaces lobby chat emoji affordances with inline SVG icons
// AI-ASSISTED: ChatGPT (GPT-5) — adds demo lobby seeding control for sparse demo states
// AI-ASSISTED: ChatGPT (GPT-5) — removes duplicate course filter in favor of top search
// AI-ASSISTED: ChatGPT (GPT-5) — removes user-facing demo seed control from lobby filters
// AI-ASSISTED: ChatGPT (GPT-5) — removes lobby time-left display from cards
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { VT_LOCATIONS } from "@/lib/types";

type LobbyRow = {
  id: string;
  course_id: string;
  location: string;
  description: string | null;
  max_size: number;
  expires_at: string;
  host_id: string;
  profiles: { name: string } | null;
  lobby_members: { count: number | string }[];
};
 
type Message = {
  id: string;
  lobby_id: string;
  user_id: string;
  content: string;
  type: "message" | "knock" | "accepted" | "declined";
  created_at: string;
  profiles?: { name: string } | null;
};

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function DoorIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3H18v18" />
      <path d="M6 21h14" />
      <path d="M13 12h.01" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6" />
      <path d="m15 9-6 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 6-12 12" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function LobbyList({
  lobbies,
  userId,
  searchQuery = "",
}: {
  lobbies: LobbyRow[];
  userId: string;
  searchQuery?: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [locationFilter, setLocationFilter] = useState("");
  const [activeLobby, setActiveLobby] = useState<LobbyRow | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [userName, setUserName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const normalizedSearch = searchQuery.toLowerCase();
  const filtered = lobbies.filter((l) => {
    const matchSearch = normalizedSearch
      ? [
          l.course_id,
          l.location,
          l.description ?? "",
          l.profiles?.name ?? "",
        ].some((value) => value.toLowerCase().includes(normalizedSearch))
      : true;
    const matchLocation = locationFilter ? l.location === locationFilter : true;
    return matchSearch && matchLocation;
  });

  // Fetch current user's name
  useEffect(() => {
    supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data) setUserName(data.name);
      });
  }, [userId]);

  // Load messages + subscribe to realtime when a lobby is opened
  useEffect(() => {
    if (!activeLobby) return;
 
    (supabase as any)
      .from("lobby_messages")
      .select("*, profiles(name)")
      .eq("lobby_id", activeLobby.id)
      .order("created_at", { ascending: true })
      .then(({ data }: { data: Message[] | null }) => {
        if (data) setMessages(data);
      });
 
    const channel = supabase
      .channel(`lobby:${activeLobby.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "lobby_messages",
          filter: `lobby_id=eq.${activeLobby.id}`,
        },
        async (payload: any) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", payload.new.user_id)
            .single();
 
          setMessages((prev) => [
            ...prev,
            { ...payload.new, profiles: profile } as Message,
          ]);
        }
      )
      .subscribe();
 
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeLobby?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
 
  async function sendMessage() {
    if (!activeLobby || !input.trim()) return;
    setSending(true);
    await (supabase as any).from("lobby_messages").insert({
      lobby_id: activeLobby.id,
      user_id: userId,
      content: input.trim(),
      type: "message",
    });
    setInput("");
    setSending(false);
  }
 
  async function sendKnock() {
    if (!activeLobby) return;
    setSending(true);
    await (supabase as any).from("lobby_messages").insert({
      lobby_id: activeLobby.id,
      user_id: userId,
      content: `${userName} is knocking to join!`,
      type: "knock",
    });
    setSending(false);
  }
 
  async function respondToKnock(msg: Message, accept: boolean) {
    const responseType = accept ? "accepted" : "declined";
    const content = accept
      ? `${msg.profiles?.name ?? "Someone"} was accepted!`
      : `${msg.profiles?.name ?? "Someone"} was declined.`;
 
    await (supabase as any).from("lobby_messages").insert({
      lobby_id: activeLobby!.id,
      user_id: userId,
      content,
      type: responseType,
    });
 
    if (accept) {
      await supabase
        .from("lobby_members")
        .insert({ lobby_id: activeLobby!.id, user_id: msg.user_id });
    }
  }
 
  async function closeLobby(lobbyId: string) {
    await supabase.from("lobbies").delete().eq("id", lobbyId);
    setActiveLobby(null);
    router.refresh();
  }

  const isHost = activeLobby?.host_id === userId;
 
  return (
    <div>
      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-[#111827] p-4 shadow-sm shadow-black/20">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="min-w-52 rounded-xl border border-white/10 bg-[#0b1220] px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8b7bff]/40"
          >
            <option value="">All locations</option>
            {VT_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          {searchQuery && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-300">
              Search: <span className="font-semibold text-white">{searchQuery}</span>
            </div>
          )}
        </div>
      </div>
 
      {/* Lobby cards */}
      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/20 bg-[#0f172a] py-12 text-center text-sm text-gray-400">
          No open lobbies right now. Create one!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((lobby) => {
            const memberCount = Number(lobby.lobby_members?.[0]?.count ?? 0);
            const isFull = memberCount >= lobby.max_size;
 
            return (
              <div
                key={lobby.id}
                data-testid={`lobby-card-${lobby.id}`}
                onClick={() => setActiveLobby(lobby)}
                className="cursor-pointer rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-sm shadow-black/20 transition-all hover:-translate-y-0.5 hover:border-[#8b7bff]/40 hover:shadow-md hover:shadow-black/30"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-full bg-[#8b7bff] px-2.5 py-1 text-xs font-semibold text-white">
                      {lobby.course_id}
                    </span>
                    <p className="mt-3 text-base font-semibold text-gray-100">
                      {lobby.location}
                    </p>
                    {lobby.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                        {lobby.description}
                      </p>
                    )}
                    <p className="mt-3 text-xs text-gray-500">
                      Host: {lobby.profiles?.name ?? "Unknown"} ·{" "}
                      {memberCount}/{lobby.max_size} members
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#8b7bff]/40 bg-[#1d2440] px-3 py-1.5 text-xs font-semibold text-[#c4bcff]">
                    {isFull ? (
                      "Full"
                    ) : (
                      <>
                        Open
                        <ArrowRightIcon />
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
 
      {/* Chat Modal */}
      {activeLobby && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setActiveLobby(null)}
          />
 
          {/* Modal */}
          <div
            className="relative flex h-[85vh] w-full flex-col rounded-t-2xl border border-white/10 bg-[#0f172a] shadow-2xl shadow-black/50 sm:max-h-[600px] sm:max-w-md sm:rounded-2xl"
            style={{ height: "85vh", maxHeight: "600px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#8b7bff] px-2 py-0.5 text-xs font-semibold text-white">
                    {activeLobby.course_id}
                  </span>
                  <span className="text-sm font-semibold text-gray-100">
                    {activeLobby.location}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">
                  Host: {activeLobby.profiles?.name} ·{" "}
                  {Number(activeLobby.lobby_members?.[0]?.count ?? 0)}/
                  {activeLobby.max_size} members
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isHost && (
                  <button
                    onClick={() => closeLobby(activeLobby.id)}
                    className="rounded-lg border border-red-400/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
                  >
                    Close lobby
                  </button>
                )}
                <button
                  onClick={() => setActiveLobby(null)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  aria-label="Close chat"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
 
            {/* Messages */}
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
              {messages.length === 0 && (
                <p className="mt-4 text-center text-xs text-gray-400">
                  No messages yet.{" "}
                  {!isHost
                    ? "Knock to ask if you can join!"
                    : "Waiting for people to knock."}
                </p>
              )}
              {messages.map((msg) => {
                const isMe = msg.user_id === userId;
                const isKnock = msg.type === "knock";
                const isSystem =
                  msg.type === "accepted" || msg.type === "declined";
 
                if (isSystem) {
                  const accepted = msg.type === "accepted";
                  return (
                    <div key={msg.id} className="text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${
                          accepted
                            ? "bg-green-500/10 text-green-200"
                            : "bg-red-500/10 text-red-200"
                        }`}
                      >
                        {accepted ? <CheckCircleIcon /> : <XCircleIcon />}
                        {msg.content}
                      </span>
                    </div>
                  );
                }
 
                if (isKnock) {
                  return (
                    <div
                      key={msg.id}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 px-4 py-2 text-center">
                        <p className="inline-flex items-center justify-center gap-2 text-sm font-medium text-amber-200">
                          <DoorIcon />
                          {msg.content}
                        </p>
                        {isHost && (
                          <div className="mt-2 flex justify-center gap-2">
                            <button
                              onClick={() => respondToKnock(msg, true)}
                              className="rounded-lg bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => respondToKnock(msg, false)}
                              className="rounded-lg bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
 
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    {!isMe && (
                      <span className="mb-0.5 ml-1 text-xs text-gray-400">
                        {msg.profiles?.name ?? "Unknown"}
                      </span>
                    )}
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm max-w-[75%] ${
                        isMe
                          ? "rounded-br-sm bg-[#8b7bff] text-white"
                          : "rounded-bl-sm bg-white/10 text-gray-100"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
 
            {/* Input area */}
            <div className="flex flex-col gap-2 border-t border-white/10 px-3 py-2">
              {!isHost && (
                <button
                  onClick={sendKnock}
                  disabled={sending}
                  className="w-full rounded-xl border border-amber-300/30 bg-amber-500/10 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/20 disabled:opacity-50"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <DoorIcon />
                    Knock to join
                  </span>
                </button>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8b7bff]/40"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  className="rounded-xl bg-[#8b7bff] px-4 py-2 text-sm font-medium text-white hover:bg-[#7968ff] disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
