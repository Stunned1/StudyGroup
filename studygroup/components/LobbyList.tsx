"use client";
 
import { useState, useEffect, useMemo, useRef } from "react";
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

type LobbyMessagesInsert = {
  lobby_id: string;
  user_id: string;
  content: string;
  type: "message" | "knock" | "accepted" | "declined";
};

type RealtimeInsertPayload = {
  new: {
    id: string;
    lobby_id: string;
    user_id: string;
    content: string;
    type: Message["type"];
    created_at: string;
  };
};

type LobbyMessagesApi = {
  select: (query: string) => {
    eq: (column: string, value: string) => {
      order: (
        column: string,
        options: { ascending: boolean }
      ) => Promise<{ data: Message[] | null }>;
    };
  };
  insert: (values: LobbyMessagesInsert) => Promise<unknown>;
};

type RealtimeChannel = {
  on: (
    eventType: "postgres_changes",
    filter: {
      event: "INSERT";
      schema: "public";
      table: "lobby_messages";
      filter: string;
    },
    callback: (payload: RealtimeInsertPayload) => Promise<void>
  ) => RealtimeChannel;
  subscribe: () => RealtimeChannel;
};
 
export default function LobbyList({
  lobbies,
  userId,
  myLobbyIds,
}: {
  lobbies: LobbyRow[];
  userId: string;
  myLobbyIds: string[];
}) {
  const supabase = createClient();
  const lobbyMessagesApi = useMemo(
    () => supabase.from("lobby_messages") as unknown as LobbyMessagesApi,
    [supabase]
  );
  const router = useRouter();
  const [courseFilter, setCourseFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "mine">("all");
  const [activeLobby, setActiveLobby] = useState<LobbyRow | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [userName, setUserName] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
 
  const myLobbyIdSet = new Set(myLobbyIds);

  const filtered = lobbies.filter((l) => {
    const inMyLobbies = l.host_id === userId || myLobbyIdSet.has(l.id);
    const matchViewMode = viewMode === "all" ? true : inMyLobbies;
    const matchCourse = courseFilter
      ? l.course_id.toLowerCase().includes(courseFilter.toLowerCase())
      : true;
    const matchLocation = locationFilter ? l.location === locationFilter : true;
    return matchViewMode && matchCourse && matchLocation;
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
  }, [supabase, userId]);
 
  // Load messages + subscribe to realtime when a lobby is opened
  useEffect(() => {
    if (!activeLobby) return;
 
    lobbyMessagesApi
      .select("*, profiles(name)")
      .eq("lobby_id", activeLobby.id)
      .order("created_at", { ascending: true })
      .then(({ data }: { data: Message[] | null }) => {
        if (data) setMessages(data);
      });
 
    const channel = (supabase
      .channel(`lobby:${activeLobby.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "lobby_messages",
          filter: `lobby_id=eq.${activeLobby.id}`,
        },
        async (payload: RealtimeInsertPayload) => {
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
      .subscribe()) as unknown as RealtimeChannel;
 
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeLobby, lobbyMessagesApi, supabase]);
 
  useEffect(() => {
    const intervalId = window.setInterval(() => setNowMs(Date.now()), 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
 
  async function sendMessage() {
    if (!activeLobby || !input.trim()) return;
    setSending(true);
    await lobbyMessagesApi.insert({
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
    await lobbyMessagesApi.insert({
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
      ? `✅ ${msg.profiles?.name ?? "Someone"} was accepted!`
      : `❌ ${msg.profiles?.name ?? "Someone"} was declined.`;
 
    await lobbyMessagesApi.insert({
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
      {/* View mode tabs */}
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setViewMode("all")}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === "all"
              ? "bg-[#861F41] text-white"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setViewMode("mine")}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === "mine"
              ? "bg-[#861F41] text-white"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          My Lobbies
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3">
        <input
          type="text"
          placeholder="Filter by course (e.g. CS 3114)"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-[#861F41] text-black"
        />
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#861F41] text-black"
        >
          <option value="">All locations</option>
          {VT_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>
 
      {/* Lobby cards */}
      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-12">
          {viewMode === "mine"
            ? "You have not hosted or joined any open lobbies yet."
            : "No open lobbies right now. Create one!"}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((lobby) => {
            const memberCount = Number(lobby.lobby_members?.[0]?.count ?? 0);
            const isFull = memberCount >= lobby.max_size;
            const expiresAt = new Date(lobby.expires_at);
            const minsLeft = Math.max(
              0,
              Math.round((expiresAt.getTime() - nowMs) / 60000)
            );
 
            return (
              <div
                key={lobby.id}
                onClick={() => setActiveLobby(lobby)}
                className="bg-white rounded-xl shadow-sm border p-4 cursor-pointer hover:shadow-md hover:border-[#861F41]/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold bg-[#861F41] text-white px-2 py-0.5 rounded-full">
                      {lobby.course_id}
                    </span>
                    <p className="font-semibold text-gray-800 mt-2">
                      {lobby.location}
                    </p>
                    {lobby.description && (
                      <p className="text-gray-500 text-sm mt-1">
                        {lobby.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Host: {lobby.profiles?.name ?? "Unknown"} ·{" "}
                      {memberCount}/{lobby.max_size} members · {minsLeft}m left
                    </p>
                  </div>
                  <div className="text-xs text-[#861F41] font-medium border border-[#861F41]/30 rounded-lg px-3 py-1.5">
                    {isFull ? "Full" : "Open →"}
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
            className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl flex flex-col"
            style={{ height: "85vh", maxHeight: "600px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold bg-[#861F41] text-white px-2 py-0.5 rounded-full">
                    {activeLobby.course_id}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {activeLobby.location}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Host: {activeLobby.profiles?.name} ·{" "}
                  {Number(activeLobby.lobby_members?.[0]?.count ?? 0)}/
                  {activeLobby.max_size} members
                </p>
              </div>
              <div className="flex gap-2 items-center">
                {isHost && (
                  <button
                    onClick={() => closeLobby(activeLobby.id)}
                    className="text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50"
                  >
                    Close lobby
                  </button>
                )}
                <button
                  onClick={() => setActiveLobby(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1"
                >
                  ×
                </button>
              </div>
            </div>
 
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
              {messages.length === 0 && (
                <p className="text-gray-400 text-xs text-center mt-4">
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
                      <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">
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
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-center">
                        <p className="text-sm text-amber-800 font-medium">
                          🚪 {msg.content}
                        </p>
                        {isHost && (
                          <div className="flex gap-2 mt-2 justify-center">
                            <button
                              onClick={() => respondToKnock(msg, true)}
                              className="text-xs bg-green-500 text-white rounded-lg px-3 py-1 hover:bg-green-600"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => respondToKnock(msg, false)}
                              className="text-xs bg-red-400 text-white rounded-lg px-3 py-1 hover:bg-red-500"
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
                      <span className="text-xs text-gray-400 mb-0.5 ml-1">
                        {msg.profiles?.name ?? "Unknown"}
                      </span>
                    )}
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm max-w-[75%] ${
                        isMe
                          ? "bg-[#861F41] text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
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
            <div className="border-t px-3 py-2 flex flex-col gap-2">
              {!isHost && (
                <button
                  onClick={sendKnock}
                  disabled={sending}
                  className="w-full text-sm font-medium text-amber-700 border border-amber-300 bg-amber-50 rounded-xl py-2 hover:bg-amber-100 disabled:opacity-50"
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
                  className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#861F41] text-black"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  className="bg-[#861F41] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#6d1934] disabled:opacity-40"
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
 