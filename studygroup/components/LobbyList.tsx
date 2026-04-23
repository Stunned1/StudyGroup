"use client";
 
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { VT_LOCATIONS } from "@/lib/types";
 
export type LobbyRow = {
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
 
export default function LobbyList({
  lobbies,
  userId,
  offlineMode = false,
}: {
  lobbies: LobbyRow[];
  userId: string;
  offlineMode?: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [courseFilter, setCourseFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [activeLobby, setActiveLobby] = useState<LobbyRow | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
 
  const filtered = lobbies.filter((l) => {
    const matchCourse = courseFilter
      ? l.course_id.toLowerCase().includes(courseFilter.toLowerCase())
      : true;
    const matchLocation = locationFilter ? l.location === locationFilter : true;
    return matchCourse && matchLocation;
  });
 
  // Fetch current user's name
  useEffect(() => {
    if (offlineMode) {
      setUserName("Developer");
      return;
    }
    supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data) setUserName(data.name);
      });
  }, [offlineMode, userId]);
 
  // Load messages + subscribe to realtime when a lobby is opened
  useEffect(() => {
    if (!activeLobby) return;
    if (offlineMode) return;
 
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
  }, [activeLobby?.id, offlineMode]);
 
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
 
  async function sendMessage() {
    if (offlineMode) return;
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
    if (offlineMode) return;
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
    if (offlineMode) return;
    const responseType = accept ? "accepted" : "declined";
    const content = accept
      ? `✅ ${msg.profiles?.name ?? "Someone"} was accepted!`
      : `❌ ${msg.profiles?.name ?? "Someone"} was declined.`;
 
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
    if (offlineMode) {
      setActiveLobby(null);
      return;
    }
    await supabase.from("lobbies").delete().eq("id", lobbyId);
    setActiveLobby(null);
    router.refresh();
  }
 
  const isHost = activeLobby?.host_id === userId;
  const canSeed = process.env.NODE_ENV !== "production" && !offlineMode;

  async function seedMockLobbies() {
    setSeeding(true);
    setSeedStatus(null);
    try {
      const response = await fetch("/api/dev/seed-lobbies", { method: "POST" });
      const body = (await response.json()) as { inserted?: number; error?: string };
      if (!response.ok) {
        setSeedStatus(body.error ?? "Failed to seed mock lobbies.");
      } else {
        setSeedStatus(`Added ${body.inserted ?? 0} mock lobbies.`);
        router.refresh();
      }
    } catch {
      setSeedStatus("Failed to seed mock lobbies.");
    } finally {
      setSeeding(false);
    }
  }
 
  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-[#111827]/80 p-4 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-[#f59e0b]">Discover groups</p>
          {canSeed && (
            <button
              type="button"
              onClick={() => void seedMockLobbies()}
              disabled={seeding}
              className="rounded-lg border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-3 py-1.5 text-xs font-semibold text-[#fbbf24] hover:bg-[#f59e0b]/20 disabled:opacity-50"
            >
              {seeding ? "Seeding..." : "Seed Mock Lobbies"}
            </button>
          )}
        </div>
        <div className="flex gap-3">
        <input
          type="text"
          placeholder="Filter by course (e.g. CS 3114)"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="flex-1 rounded-lg border border-white/15 bg-[#0b1220] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ec4899]"
        />
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="rounded-lg border border-white/15 bg-[#0b1220] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ec4899]"
        >
          <option value="">All locations</option>
          {VT_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
        </div>
        {seedStatus && <p className="mt-3 text-xs text-gray-300">{seedStatus}</p>}
      </div>
 
      {/* Lobby cards */}
      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-[#111827]/80 py-12 text-center text-sm text-gray-400">
          No open lobbies right now. Create one!
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((lobby) => {
            const memberCount = Number(lobby.lobby_members?.[0]?.count ?? 0);
            const isFull = memberCount >= lobby.max_size;
            const expiresAt = new Date(lobby.expires_at);
            const minsLeft = Math.max(
              0,
              Math.round((expiresAt.getTime() - Date.now()) / 60000)
            );
            const cleanedDescription =
              lobby.description?.replace(/^\[MOCK\]\s*/i, "").trim() ?? "";
            const title = cleanedDescription || `${lobby.course_id} Study Group`;
            const subtitle = cleanedDescription
              ? `Session focus: ${cleanedDescription}`
              : `Focused session for ${lobby.course_id}`;
            const extraCount = Math.max(0, memberCount - 2);
 
            return (
              <div
                key={lobby.id}
                onClick={() => setActiveLobby(lobby)}
                className="cursor-pointer rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-xl shadow-black/30 transition-all hover:-translate-y-0.5 hover:border-[#f97316]/50"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-md bg-[#4f1d36] px-3 py-1 text-xs font-semibold tracking-wide text-[#f9a8d4]">
                    {lobby.course_id}
                  </span>
                  <div className="flex items-center">
                    <div className="h-7 w-7 rounded-full border border-[#0f1420] bg-gradient-to-br from-cyan-400 to-blue-600" />
                    <div className="-ml-2 h-7 w-7 rounded-full border border-[#0f1420] bg-gradient-to-br from-teal-300 to-sky-700" />
                    <div className="-ml-2 h-7 w-7 rounded-full border border-[#0f1420] bg-gradient-to-br from-slate-300 to-slate-500" />
                    {extraCount > 0 && (
                      <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-gray-200">
                        +{extraCount}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="line-clamp-2 min-h-[4.5rem] text-4xl font-semibold leading-[1.05] tracking-tight text-gray-100">
                  {title}
                </h3>
                <p className="mt-2 min-h-[2.75rem] line-clamp-2 text-sm text-gray-400">
                  {subtitle}
                </p>

                <div className="mt-6 space-y-2 text-base text-gray-300">
                  <p className="flex items-center gap-2">
                    <span className="text-pink-400">🕒</span>
                    <span>Today · {minsLeft} min left</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-pink-400">📍</span>
                    <span>{lobby.location}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveLobby(lobby);
                  }}
                  className="mt-6 w-full rounded-xl border border-[#6b4a24] bg-[#3a2714] py-3 text-2xl font-semibold text-amber-300 transition-colors hover:bg-[#4a2f16]"
                >
                  {isFull ? "Group Full" : "Join Group"}
                </button>

                <p className="mt-4 text-xs text-gray-500">
                  Host: {lobby.profiles?.name ?? "Unknown"} · {memberCount}/{lobby.max_size} members
                </p>
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
            className="relative flex w-full flex-col rounded-t-2xl bg-[#0b1220] sm:max-w-md sm:rounded-2xl border border-white/10 shadow-2xl"
            style={{ height: "85vh", maxHeight: "600px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[#ec4899]/40 bg-[#ec4899]/20 px-2 py-0.5 text-xs font-semibold text-[#f9a8d4]">
                    {activeLobby.course_id}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {activeLobby.location}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">
                  Host: {activeLobby.profiles?.name} ·{" "}
                  {Number(activeLobby.lobby_members?.[0]?.count ?? 0)}/
                  {activeLobby.max_size} members
                </p>
              </div>
              <div className="flex gap-2 items-center">
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
                  className="px-1 text-xl leading-none text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
 
            {/* Messages */}
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
              {messages.length === 0 && (
                <p className="mt-4 text-center text-xs text-gray-500">
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
                  return (
                    <div key={msg.id} className="text-center">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
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
                      <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-center">
                        <p className="text-sm font-medium text-amber-200">
                          🚪 {msg.content}
                        </p>
                        {isHost && (
                          <div className="flex gap-2 mt-2 justify-center">
                            <button
                              onClick={() => respondToKnock(msg, true)}
                              className="rounded-lg bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-500"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => respondToKnock(msg, false)}
                              className="rounded-lg bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-400"
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
                          ? "rounded-br-sm bg-[#ec4899] text-white"
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
                  className="w-full rounded-xl border border-amber-300/30 bg-amber-400/10 py-2 text-sm font-medium text-amber-200 hover:bg-amber-400/20 disabled:opacity-50"
                >
                  🚪 Knock to join
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
                  className="flex-1 rounded-xl border border-white/15 bg-[#111827] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ec4899]"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  className="rounded-xl bg-[#ec4899] px-4 py-2 text-sm font-medium text-white hover:bg-[#db2777] disabled:opacity-40"
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
 