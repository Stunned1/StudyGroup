// AI-ASSISTED: Cursor (Codex 5.3) — dark-mode lobby list cards, filters, and modal surfaces
// AI-ASSISTED: ChatGPT (GPT-5) — replaces lobby chat emoji affordances with inline SVG icons
// AI-ASSISTED: ChatGPT (GPT-5) — adds demo lobby seeding control for sparse demo states
// AI-ASSISTED: ChatGPT (GPT-5) — removes duplicate course filter in favor of top search
// AI-ASSISTED: ChatGPT (GPT-5) — removes user-facing demo seed control from lobby filters
// AI-ASSISTED: ChatGPT (GPT-5) — removes lobby time-left display from cards
// AI-ASSISTED: ChatGPT (GPT-5) — adds deterministic optimistic join flow for recorded demos
// AI-ASSISTED: ChatGPT (GPT-5) — adds demo room members, calendar comparison, shared availability, and session scheduling
// AI-ASSISTED: ChatGPT (GPT-5) — moves members to right rail and renders multi-person traditional calendar comparison
// AI-ASSISTED: ChatGPT (GPT-5) — wires reliable demo chat replies with Gemini fallback
// AI-ASSISTED: ChatGPT (GPT-5) — polishes recorded demo room behavior and removes stale request UI
// AI-ASSISTED: ChatGPT (GPT-5) — prevents realtime echoes from duplicating optimistic demo chat messages
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { VT_LOCATIONS } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";

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

type LobbyMemberProfile = {
  user_id: string;
  profiles: {
    name: string;
    major?: string | null;
    year?: string | null;
    avatar_url?: string | null;
    email?: string | null;
  } | null;
};

type ScheduleClass = {
  user_id?: string;
  course_name: string;
  location: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  color: string;
};

type SuggestedSlot = {
  id: string;
  label: string;
  time: string;
  location: string;
  badge: string;
};

type DemoChatResponse = {
  reply?: string;
  source?: "gemini" | "fallback";
};

type LobbyMessageInsert = {
  lobby_id: string;
  user_id: string;
  content: string;
  type: Message["type"];
};

type LobbyMessageQuery = {
  select: (columns: string) => {
    eq: (
      column: string,
      value: string
    ) => {
      order: (
        column: string,
        options: { ascending: boolean }
      ) => PromiseLike<{ data: Message[] | null }>;
    };
  };
  insert: (row: LobbyMessageInsert) => PromiseLike<unknown>;
};

type RealtimeInsertPayload = {
  new: Omit<Message, "profiles">;
};
 
type Message = {
  id: string;
  lobby_id: string;
  user_id: string;
  content: string;
  type: "message" | "accepted" | "declined";
  created_at: string;
  profiles?: { name: string } | null;
};

const DEMO_IDS = {
  aidan: "77777777-7777-4777-8777-777777777777",
  priya: "11111111-1111-4111-8111-111111111111",
  marcus: "22222222-2222-4222-8222-222222222222",
};

const DAYS = [
  { value: 1, short: "MON" },
  { value: 2, short: "TUE" },
  { value: 3, short: "WED" },
  { value: 4, short: "THUR" },
  { value: 5, short: "FRI" },
];

const START_HOUR = 8;
const END_HOUR = 20;
const SLOT_MINUTES = 30;
const ROW_HEIGHT_PX = 28;
const TIME_MARKERS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, index) => START_HOUR + index
);

const DEMO_SCHEDULES: Record<string, ScheduleClass[]> = {
  [DEMO_IDS.aidan]: [
    classBlock("CS 3704", "McBryde 100", 2, "17:00", "18:15", "#8b7bff"),
    classBlock("CS 3704", "McBryde 100", 4, "17:00", "18:15", "#8b7bff"),
    classBlock("CS 3114", "Torgersen 2150", 1, "09:00", "10:15", "#06b6d4"),
    classBlock("CS 3114", "Torgersen 2150", 3, "09:00", "10:15", "#06b6d4"),
    classBlock("MATH 1226", "McBryde 231", 1, "13:00", "14:15", "#22c55e"),
    classBlock("MATH 1226", "McBryde 231", 3, "13:00", "14:15", "#22c55e"),
  ],
  [DEMO_IDS.priya]: [
    classBlock("CS 3704", "McBryde 100", 2, "17:00", "18:15", "#8b7bff"),
    classBlock("CS 3704", "McBryde 100", 4, "17:00", "18:15", "#8b7bff"),
    classBlock("COMM 2004", "Pamplin 30", 1, "11:00", "12:15", "#f97316"),
    classBlock("COMM 2004", "Pamplin 30", 3, "11:00", "12:15", "#f97316"),
    classBlock("STAT 3615", "Newman Library", 2, "13:00", "14:15", "#22c55e"),
    classBlock("STAT 3615", "Newman Library", 4, "13:00", "14:15", "#22c55e"),
  ],
  [DEMO_IDS.marcus]: [
    classBlock("CS 3704", "McBryde 100", 2, "17:00", "18:15", "#8b7bff"),
    classBlock("CS 3704", "McBryde 100", 4, "17:00", "18:15", "#8b7bff"),
    classBlock("BIT 2406", "Surge Space", 1, "10:30", "11:45", "#ec4899"),
    classBlock("BIT 2406", "Surge Space", 3, "10:30", "11:45", "#ec4899"),
  ],
};

const SUGGESTED_SLOTS: SuggestedSlot[] = [
  {
    id: "tue-1830",
    label: "Tue 6:30 PM",
    time: "Tuesday, 6:30 PM",
    location: "Newman Library",
    badge: "Best match",
  },
  {
    id: "thu-1830",
    label: "Thu 6:30 PM",
    time: "Thursday, 6:30 PM",
    location: "Newman Library",
    badge: "Both free",
  },
];

const DEMO_CHAT_MESSAGES: Record<string, Message[]> = {
  "CS 3704": [
    {
      id: "demo-cs3704-priya-1",
      lobby_id: "demo",
      user_id: DEMO_IDS.priya,
      content: "I can meet after CS 3704. Newman Library is easiest for me.",
      type: "message",
      created_at: "2026-04-30T15:00:00.000Z",
      profiles: { name: "Priya Shah" },
    },
    {
      id: "demo-cs3704-marcus-1",
      lobby_id: "demo",
      user_id: DEMO_IDS.marcus,
      content: "I can bring the sprint backlog notes and project rubric.",
      type: "message",
      created_at: "2026-04-30T15:01:00.000Z",
      profiles: { name: "Marcus Johnson" },
    },
  ],
};

function classBlock(
  course_name: string,
  location: string,
  day_of_week: number,
  start_time: string,
  end_time: string,
  color: string
): ScheduleClass {
  return { course_name, location, day_of_week, start_time, end_time, color };
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

function minutesFromTime(value: string) {
  const [hourRaw, minuteRaw] = value.split(":");
  return Number(hourRaw) * 60 + Number(minuteRaw ?? "0");
}

function gridRowForTime(value: string) {
  const minutes = minutesFromTime(value);
  const min = START_HOUR * 60;
  const max = END_HOUR * 60;
  const clamped = Math.min(Math.max(minutes, min), max);
  return Math.floor((clamped - min) / SLOT_MINUTES) + 2;
}

function timeLabel(hour: number) {
  const suffix = hour >= 12 ? "p.m." : "a.m.";
  const displayHour = hour % 12 || 12;
  return `${displayHour} ${suffix}`;
}

function scheduleForDemoUser(userId: string, displayName: string) {
  if (DEMO_SCHEDULES[userId]) return DEMO_SCHEDULES[userId];
  if (displayName === "Aidan Nguyen") return DEMO_SCHEDULES[DEMO_IDS.aidan];
  return [];
}

function lobbyMessagesTable(supabase: ReturnType<typeof createClient>) {
  return supabase.from("lobby_messages" as never) as unknown as LobbyMessageQuery;
}

function ComparisonCalendar({
  schedules,
}: {
  schedules: {
    ownerId: string;
    ownerName: string;
    classes: ScheduleClass[];
  }[];
}) {
  const blocks = schedules.flatMap((schedule, ownerIndex) =>
    schedule.classes
      .filter((item) => item.day_of_week >= 1 && item.day_of_week <= 5)
      .map((item) => ({ ...item, ownerIndex, ownerName: schedule.ownerName }))
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#111827] p-3">
      <div
        className="relative grid min-w-[780px] overflow-hidden rounded-lg border-2 border-[#111827] bg-white text-[#111827]"
        style={{
          gridTemplateColumns: `76px repeat(${DAYS.length}, minmax(130px, 1fr))`,
          gridTemplateRows: `38px repeat(${(END_HOUR - START_HOUR) * 2}, ${ROW_HEIGHT_PX}px)`,
        }}
      >
        <div className="border-b-2 border-r-2 border-[#111827] bg-[#f8fafc]" />
        {DAYS.map((day) => {
          return (
            <div
              key={day.value}
              className="flex items-center justify-center border-b-2 border-r-2 border-[#111827] bg-[#f8fafc] text-xs font-bold last:border-r-0"
            >
              {day.short}
            </div>
          );
        })}

        {TIME_MARKERS.map((hour) => (
          <div
            key={hour}
            className="flex items-start justify-center border-r-2 border-t-2 border-[#111827] bg-[#f8fafc] pt-1.5 text-xs font-semibold"
            style={{
              gridColumn: 1,
              gridRow: `${(hour - START_HOUR) * 2 + 2} / span 2`,
            }}
          >
            {timeLabel(hour)}
          </div>
        ))}

        {DAYS.map((day, dayIndex) =>
          Array.from({ length: (END_HOUR - START_HOUR) * 2 }, (_, slot) => (
            <div
              key={`${day.value}-${slot}`}
              className={`border-r-2 border-[#111827] bg-white last:border-r-0 ${
                slot % 2 === 0 ? "border-t-2" : "border-t"
              }`}
              style={{
                gridColumn: dayIndex + 2,
                gridRow: slot + 2,
              }}
            />
          ))
        )}

        {blocks.map((item, index) => {
          const dayIndex = DAYS.findIndex((day) => day.value === item.day_of_week);
          const startRow = gridRowForTime(item.start_time);
          const endRow = Math.max(startRow + 1, gridRowForTime(item.end_time));
          const inset = item.ownerIndex * 6;

          if (dayIndex < 0) return null;

          return (
            <article
              key={`${item.ownerName}-${item.course_name}-${item.day_of_week}-${item.start_time}-${index}`}
              className="relative z-10 m-0.5 overflow-hidden border-2 border-[#111827] px-1.5 py-1 text-center shadow-sm"
              style={{
                gridColumn: dayIndex + 2,
                gridRow: `${startRow} / ${endRow}`,
                backgroundColor: item.color,
                marginLeft: `${inset}px`,
                marginRight: `${Math.max(0, (schedules.length - item.ownerIndex - 1) * 4)}px`,
              }}
              title={`${item.ownerName}: ${item.course_name} ${formatTime(item.start_time)}-${formatTime(item.end_time)}`}
            >
              <div className="truncate text-[11px] font-black text-white drop-shadow">
                {item.course_name}
              </div>
              <div className="truncate text-[10px] font-semibold text-white/90 drop-shadow">
                {item.ownerName}
              </div>
              <div className="truncate text-[10px] font-semibold text-white/85 drop-shadow">
                {formatTime(item.start_time)}-{formatTime(item.end_time)}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

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
  joinedLobbyIds = [],
}: {
  lobbies: LobbyRow[];
  userId: string;
  searchQuery?: string;
  joinedLobbyIds?: string[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [locationFilter, setLocationFilter] = useState("");
  const [activeLobby, setActiveLobby] = useState<LobbyRow | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<LobbyMemberProfile[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(
    () => new Set()
  );
  const [currentSchedule, setCurrentSchedule] = useState<ScheduleClass[]>([]);
  const [peerSchedules, setPeerSchedules] = useState<Record<string, ScheduleClass[]>>({});
  const [selectedSlot, setSelectedSlot] = useState<SuggestedSlot>(
    SUGGESTED_SLOTS[0]
  );
  const [scheduledSession, setScheduledSession] = useState<{
    slot: SuggestedSlot;
    participants: string[];
  } | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatReplying, setChatReplying] = useState(false);
  const [joining, setJoining] = useState(false);
  const [userName, setUserName] = useState("");
  const [userProfile, setUserProfile] = useState<LobbyMemberProfile["profiles"]>(
    null
  );
  const [joinedIds, setJoinedIds] = useState<Set<string>>(
    () => new Set(joinedLobbyIds)
  );
  const [optimisticMemberCounts, setOptimisticMemberCounts] = useState<
    Record<string, number>
  >({});
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

  // Fetch current user's profile and schedule.
  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data) {
          setUserProfile(data);
          setUserName(data.name);
        }
      });

    supabase
      .from("schedule_classes")
      .select("*")
      .eq("user_id", userId)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true })
      .then(({ data }) => {
        const fallback = scheduleForDemoUser(userId, userProfile?.name ?? "");
        setCurrentSchedule(((data as ScheduleClass[] | null) ?? fallback));
      });
  }, [userId]);

  // Load messages + subscribe to realtime when a lobby is opened
  useEffect(() => {
    if (!activeLobby) return;

    supabase
      .from("lobby_members")
      .select("user_id, profiles(*)")
      .eq("lobby_id", activeLobby.id)
      .then(({ data }) => {
        if (data) {
          const rows = data as unknown as LobbyMemberProfile[];
          setMembers(rows);
          const peerIds = rows
            .filter((member) => member.user_id !== userId)
            .slice(0, 2)
            .map((member) => member.user_id);
          setSelectedMemberIds(new Set(peerIds));
        }
      });
 
    lobbyMessagesTable(supabase)
      .select("*, profiles(name)")
      .eq("lobby_id", activeLobby.id)
      .order("created_at", { ascending: true })
      .then(({ data }: { data: Message[] | null }) => {
        if (data && data.length > 0) {
          setMessages(data);
          return;
        }

        setMessages(
          (DEMO_CHAT_MESSAGES[activeLobby.course_id] ?? []).map((message) => ({
            ...message,
            lobby_id: activeLobby.id,
          }))
        );
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
        async (payload: RealtimeInsertPayload) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", payload.new.user_id)
            .single();
 
          setMessages((prev) => {
            const duplicateLocalEcho =
              payload.new.user_id === userId &&
              prev.some(
                (message) =>
                  message.id.startsWith("local-") &&
                  message.user_id === payload.new.user_id &&
                  message.content === payload.new.content
              );

            if (duplicateLocalEcho) return prev;

            return [...prev, { ...payload.new, profiles: profile } as Message];
          });
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

  useEffect(() => {
    const selectedMembers = members.filter(
      (member) => member.user_id !== userId && selectedMemberIds.has(member.user_id)
    );

    for (const member of selectedMembers) {
      if (peerSchedules[member.user_id]) continue;

      const displayName = member.profiles?.name ?? "Student";
      const fallback = scheduleForDemoUser(member.user_id, displayName);

      supabase
        .from("schedule_classes")
        .select("*")
        .eq("user_id", member.user_id)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true })
        .then(({ data }) => {
          const rows = (data as ScheduleClass[] | null) ?? [];
          setPeerSchedules((prev) => ({
            ...prev,
            [member.user_id]: rows.length > 0 ? rows : fallback,
          }));
        });
    }
  }, [members, selectedMemberIds, userId, peerSchedules]);
 
  async function sendMessage() {
    if (!activeLobby || !input.trim()) return;
    if (!isHost && !joinedIds.has(activeLobby.id)) return;
    const content = input.trim();
    const selectedNames = selectedMembers.map(
      (member) => member.profiles?.name ?? "Student"
    );
    const responder = selectedMembers[0] ?? members.find((member) => member.user_id !== userId);
    const responderName = responder?.profiles?.name ?? "Priya Shah";
    const responderId = responder?.user_id ?? DEMO_IDS.priya;

    setSending(true);
    setInput("");
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        lobby_id: activeLobby.id,
        user_id: userId,
        content,
        type: "message",
        created_at: new Date().toISOString(),
        profiles: { name: userName || "You" },
      },
    ]);

    void lobbyMessagesTable(supabase).insert({
      lobby_id: activeLobby.id,
      user_id: userId,
      content,
      type: "message",
    });

    setChatReplying(true);
    try {
      const response = await fetch("/api/demo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          courseId: activeLobby.course_id,
          location: activeLobby.location,
          participants: [userName || "Aidan Nguyen", ...selectedNames],
          selectedSlot,
        }),
      });
      const data = (await response.json()) as DemoChatResponse;
      const reply =
        data.reply ??
        "Tuesday at 6:30 PM in Newman Library works for me. I can bring the project notes.";

      setMessages((prev) => [
        ...prev,
        {
          id: `demo-reply-${Date.now()}`,
          lobby_id: activeLobby.id,
          user_id: responderId,
          content: reply,
          type: "message",
          created_at: new Date().toISOString(),
          profiles: { name: responderName },
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `demo-reply-${Date.now()}`,
          lobby_id: activeLobby.id,
          user_id: responderId,
          content:
            "Tuesday at 6:30 PM in Newman Library works for me. I can bring the project notes.",
          type: "message",
          created_at: new Date().toISOString(),
          profiles: { name: responderName },
        },
      ]);
    }
    setChatReplying(false);
    setSending(false);
  }
 
  async function joinLobby() {
    if (!activeLobby) return;
    const lobbyId = activeLobby.id;
    const alreadyJoined = joinedIds.has(lobbyId);
    if (alreadyJoined) return;

    setJoining(true);
    setJoinedIds((prev) => new Set(prev).add(lobbyId));
    setOptimisticMemberCounts((prev) => ({
      ...prev,
      [lobbyId]: (prev[lobbyId] ?? 0) + 1,
    }));
    setMembers((prev) => [
      ...prev,
      {
        user_id: userId,
        profiles: { name: userName || "You" },
      },
    ]);

    const { error } = await supabase.from("lobby_members").insert({
      lobby_id: lobbyId,
      user_id: userId,
    });

    if (!error) {
      await lobbyMessagesTable(supabase).insert({
        lobby_id: lobbyId,
        user_id: userId,
        content: `${userName || "A student"} joined the group.`,
        type: "accepted",
      });
    }

    setJoining(false);
  }

  function scheduleStudySession() {
    if (!activeLobby) return;
    const selectedNames = members
      .filter((member) => selectedMemberIds.has(member.user_id))
      .map((member) => member.profiles?.name ?? "Student");
    const participants = [userName || "You", ...selectedNames];
      setScheduledSession({ slot: selectedSlot, participants });
    setMessages((prev) => [
      ...prev,
      {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `scheduled-${Date.now()}`,
        lobby_id: activeLobby.id,
        user_id: userId,
        content: `Study session scheduled for ${activeLobby.course_id}: ${selectedSlot.time} at ${selectedSlot.location} with ${participants.join(", ")}.`,
        type: "accepted",
        created_at: new Date().toISOString(),
        profiles: { name: userName || "You" },
      },
    ]);
  }

  function toggleSelectedMember(memberId: string) {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  }
 
  async function closeLobby(lobbyId: string) {
    await supabase.from("lobbies").delete().eq("id", lobbyId);
    setActiveLobby(null);
    router.refresh();
  }

  function openLobby(lobby: LobbyRow) {
    setMembers([]);
    setSelectedMemberIds(new Set());
    setPeerSchedules({});
    setScheduledSession(null);
    setMessages([]);
    setInput("");
    setActiveLobby(lobby);
  }

  const isHost = activeLobby?.host_id === userId;
  const isJoined = activeLobby
    ? isHost || joinedIds.has(activeLobby.id)
    : false;

  function memberCountFor(lobby: LobbyRow) {
    return (
      Number(lobby.lobby_members?.[0]?.count ?? 0) +
      (optimisticMemberCounts[lobby.id] ?? 0)
    );
  }

  const selectedMembers = members.filter(
    (member) => member.user_id !== userId && selectedMemberIds.has(member.user_id)
  );
  const comparisonSchedules = [
    {
      ownerId: userId,
      ownerName: userName || "You",
      classes:
        currentSchedule.length > 0
          ? currentSchedule
          : scheduleForDemoUser(userId, userName),
    },
    ...selectedMembers.map((member) => ({
      ownerId: member.user_id,
      ownerName: member.profiles?.name ?? "Student",
      classes:
        peerSchedules[member.user_id] ??
        scheduleForDemoUser(member.user_id, member.profiles?.name ?? ""),
    })),
  ];
 
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
          No matching study groups yet. Create a group to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((lobby) => {
            const memberCount = memberCountFor(lobby);
            const isFull = memberCount >= lobby.max_size;
            const joined = lobby.host_id === userId || joinedIds.has(lobby.id);
 
            return (
              <div
                key={lobby.id}
                data-testid={`lobby-card-${lobby.id}`}
                onClick={() => openLobby(lobby)}
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
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                      joined
                        ? "border-green-400/40 bg-green-500/10 text-green-200"
                        : "border-[#8b7bff]/40 bg-[#1d2440] text-[#c4bcff]"
                    }`}
                  >
                    {joined ? (
                      <>
                        Joined
                        <CheckCircleIcon />
                      </>
                    ) : isFull ? (
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
            className="relative flex h-[90vh] w-full flex-col rounded-t-2xl border border-white/10 bg-[#0f172a] shadow-2xl shadow-black/50 sm:max-h-[780px] sm:rounded-2xl"
            style={{ height: "90vh", maxHeight: "780px", maxWidth: "min(96vw, 1280px)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
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
                  {activeLobby.description ?? "Study group room"} · Host:{" "}
                  {activeLobby.profiles?.name} ·{" "}
                  {memberCountFor(activeLobby)}/
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
 
            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_340px] gap-0 overflow-hidden">
              <section className="min-h-0 overflow-y-auto p-4">
                {isJoined ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-white">
                            Calendar comparison
                          </p>
                          <p className="mt-1 text-sm text-gray-400">
                            Your calendar plus selected group members.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {comparisonSchedules.map((schedule) => (
                            <span
                              key={schedule.ownerId}
                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-200"
                            >
                              {schedule.ownerName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <ComparisonCalendar schedules={comparisonSchedules} />

                    <div className="rounded-xl border border-green-400/20 bg-green-500/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-green-100">
                            Shared availability
                          </p>
                          <p className="mt-1 text-xs text-green-200/80">
                            Suggested after CS 3704 with selected calendars clear.
                          </p>
                        </div>
                        <span className="rounded-full bg-green-400/20 px-3 py-1 text-xs font-semibold text-green-100">
                          After CS 3704
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {SUGGESTED_SLOTS.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`rounded-xl border p-3 text-left transition ${
                              selectedSlot.id === slot.id
                                ? "border-green-300/60 bg-green-400/20"
                                : "border-green-300/20 bg-black/10 hover:bg-green-400/10"
                            }`}
                          >
                            <span className="block text-sm font-semibold text-white">
                              {slot.label}
                            </span>
                            <span className="mt-1 block text-xs text-green-100">
                              {slot.badge} · {slot.location}
                            </span>
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={scheduleStudySession}
                        className="mt-4 w-full rounded-xl bg-green-400 px-4 py-2.5 text-sm font-semibold text-[#052e1a] hover:bg-green-300"
                      >
                        Schedule study session
                      </button>
                      {scheduledSession && (
                        <div className="mt-3 rounded-xl border border-green-300/30 bg-black/20 p-3 text-sm text-green-50">
                          <p className="font-semibold">
                            {activeLobby.course_id} confirmed
                          </p>
                          <p className="mt-1 text-green-100">
                            {scheduledSession.slot.time} at{" "}
                            {scheduledSession.slot.location} with{" "}
                            {scheduledSession.participants.join(", ")}.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-gray-400">
                    Join the group to compare calendars and schedule a session.
                  </div>
                )}
              </section>

              <aside className="flex min-h-0 flex-col border-l border-white/10">
                <div className="border-b border-white/10 p-4">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                          Status
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-100">
                          {isJoined ? "You are in this group" : "Join to enter the room"}
                        </p>
                      </div>
                      {isJoined ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-200">
                          <CheckCircleIcon />
                          Joined
                        </span>
                      ) : (
                        <button
                          onClick={joinLobby}
                          disabled={joining}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8b7bff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7968ff] disabled:opacity-50"
                        >
                          <DoorIcon />
                          {joining ? "Joining..." : "Join group"}
                        </button>
                      )}
                    </div>
                  </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Members
                  </p>
                  <div className="mt-3 space-y-2">
                    {isJoined &&
                      members.map((member) => {
                        const name =
                          member.user_id === userId
                            ? "You"
                            : member.profiles?.name ?? "Student";
                        const selected =
                          member.user_id === userId ||
                          selectedMemberIds.has(member.user_id);

                        return (
                          <button
                            key={member.user_id}
                            type="button"
                            onClick={() => {
                              if (member.user_id !== userId) {
                                toggleSelectedMember(member.user_id);
                              }
                            }}
                            disabled={member.user_id === userId}
                            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                              selected
                                ? "border-[#8b7bff]/60 bg-[#8b7bff]/10"
                                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                            }`}
                          >
                            <UserAvatar
                              avatarUrl={member.profiles?.avatar_url ?? null}
                              name={name}
                              sizePx={36}
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-gray-100">
                                {name}
                              </span>
                              <span className="block truncate text-xs text-gray-500">
                                {member.profiles?.major ?? "Virginia Tech"} ·{" "}
                                {member.profiles?.year ?? "Student"}
                              </span>
                            </span>
                            <span
                              className={`ml-auto h-4 w-4 rounded border ${
                                selected
                                  ? "border-[#8b7bff] bg-[#8b7bff]"
                                  : "border-white/20"
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                        );
                      })}
                  </div>
                </div>
                </div>
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="text-sm font-semibold text-white">Group chat</p>
                  <p className="text-xs text-gray-500">Coordinate the study plan.</p>
                </div>
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
                  {!isJoined ? (
                    <p className="mt-6 text-center text-xs text-gray-400">
                      Join the group to see the chat and coordinate with members.
                    </p>
                  ) : messages.length === 0 ? (
                    <p className="mt-4 text-center text-xs text-gray-400">
                      No messages yet. Start the study plan.
                    </p>
                  ) : null}
                  {isJoined &&
                    messages.map((msg) => {
                      const isMe = msg.user_id === userId;
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
                            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
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
                  {isJoined && chatReplying && (
                    <div className="flex flex-col items-start">
                      <span className="mb-0.5 ml-1 text-xs text-gray-400">
                        {selectedMembers[0]?.profiles?.name ?? "Priya Shah"}
                      </span>
                      <div className="rounded-2xl rounded-bl-sm bg-white/10 px-3 py-2 text-sm text-gray-300">
                        typing...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </aside>
            </div>
 
            {/* Input area */}
            <div className="flex flex-col gap-2 border-t border-white/10 px-3 py-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={
                    isJoined ? "Ask a question..." : "Join the group to chat"
                  }
                  value={input}
                  disabled={!isJoined}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8b7bff]/40 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!isJoined || sending || !input.trim()}
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
 
