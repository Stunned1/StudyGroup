// AI-GENERATED: Kiro — new lobby creation form with VT location picker and duration selector
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { VT_LOCATIONS } from "@/lib/types";

export default function NewLobbyForm({ userId }: { userId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [courseId, setCourseId] = useState("");
  const [location, setLocation] = useState(VT_LOCATIONS[0]);
  const [description, setDescription] = useState("");
  const [maxSize, setMaxSize] = useState(5);
  const [duration, setDuration] = useState(60); // minutes
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const expiresAt = new Date(Date.now() + duration * 60 * 1000).toISOString();

    const { error } = await supabase.from("lobbies").insert({
      host_id: userId,
      course_id: courseId.toUpperCase().trim(),
      location,
      description: description || null,
      max_size: maxSize,
      expires_at: expiresAt,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/lobbies");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Course ID</label>
        <input
          type="text"
          placeholder="e.g. CS 3114"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          required
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#861F41] text-black"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Location</label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#861F41] text-black"
        >
          {VT_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Description (optional)</label>
        <input
          type="text"
          placeholder="e.g. Working on HW3, bring your notes"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#861F41] text-black"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Max group size</label>
          <input
            type="number"
            min={2}
            max={20}
            value={maxSize}
            onChange={(e) => setMaxSize(Number(e.target.value))}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#861F41] text-black"
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Duration (minutes)</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#861F41] text-black"
          >
            <option value={30}>30 min</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
            <option value={180}>3 hours</option>
          </select>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-[#861F41] text-white rounded-lg py-2 text-sm font-semibold hover:bg-[#6d1934] disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Lobby"}
      </button>
    </form>
  );
}
