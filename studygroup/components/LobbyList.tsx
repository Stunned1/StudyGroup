// AI-GENERATED: Kiro — lobby list client component with join/close logic and course/location filters
"use client";

import { useState } from "react";
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
  lobby_members: { count: number }[];
};

export default function LobbyList({
  lobbies,
  userId,
}: {
  lobbies: LobbyRow[];
  userId: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [courseFilter, setCourseFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [joining, setJoining] = useState<string | null>(null);

  const filtered = lobbies.filter((l) => {
    const matchCourse = courseFilter
      ? l.course_id.toLowerCase().includes(courseFilter.toLowerCase())
      : true;
    const matchLocation = locationFilter ? l.location === locationFilter : true;
    return matchCourse && matchLocation;
  });

  async function joinLobby(lobbyId: string) {
    setJoining(lobbyId);
    await supabase.from("lobby_members").insert({ lobby_id: lobbyId, user_id: userId });
    setJoining(null);
    router.refresh();
  }

  async function closeLobby(lobbyId: string) {
    await supabase.from("lobbies").delete().eq("id", lobbyId);
    router.refresh();
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Filter by course (e.g. CS 3114)"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-[#861F41]"
        />
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#861F41]"
        >
          <option value="">All locations</option>
          {VT_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Lobby cards */}
      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-12">No open lobbies right now. Create one!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((lobby) => {
            const memberCount = lobby.lobby_members?.[0]?.count ?? 0;
            const isFull = memberCount >= lobby.max_size;
            const isHost = lobby.host_id === userId;
            const expiresAt = new Date(lobby.expires_at);
            const minsLeft = Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / 60000));

            return (
              <div key={lobby.id} className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold bg-[#861F41] text-white px-2 py-0.5 rounded-full">
                      {lobby.course_id}
                    </span>
                    <p className="font-semibold text-gray-800 mt-2">{lobby.location}</p>
                    {lobby.description && (
                      <p className="text-gray-500 text-sm mt-1">{lobby.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Host: {lobby.profiles?.name ?? "Unknown"} · {memberCount}/{lobby.max_size} members · {minsLeft}m left
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {isHost ? (
                      <button
                        onClick={() => closeLobby(lobby.id)}
                        className="text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50"
                      >
                        Close
                      </button>
                    ) : (
                      <button
                        onClick={() => joinLobby(lobby.id)}
                        disabled={isFull || joining === lobby.id}
                        className="text-xs bg-[#861F41] text-white rounded-lg px-3 py-1.5 hover:bg-[#6d1934] disabled:opacity-40"
                      >
                        {isFull ? "Full" : joining === lobby.id ? "Joining..." : "Join"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
