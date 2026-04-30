// AI-GENERATED: Kiro — new lobby creation form with VT location picker and duration selector
// AI-ASSISTED: Cursor — VTLocation state typing for location select
// AI-ASSISTED: ChatGPT (GPT-5) — dark-mode create lobby form styling
// AI-ASSISTED: ChatGPT (GPT-5) — removes lobby duration from the creation flow
// AI-ASSISTED: ChatGPT (GPT-5) — aligns create copy with group demo flow
// AI-ASSISTED: ChatGPT (GPT-5) — returns users to their Groups page after creating a group
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { VT_LOCATIONS, type VTLocation } from "@/lib/types";

export default function NewLobbyForm({ userId }: { userId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [courseId, setCourseId] = useState("");
  const [location, setLocation] = useState<VTLocation>(VT_LOCATIONS[0]);
  const [description, setDescription] = useState("");
  const [maxSize, setMaxSize] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("lobbies").insert({
      host_id: userId,
      course_id: courseId.toUpperCase().trim(),
      location,
      description: description || null,
      max_size: maxSize,
      expires_at: "2099-12-31T23:59:59.000Z",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/groups");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-sm shadow-black/20">
      <div>
        <label className="text-sm font-medium text-gray-200">Course ID</label>
        <input
          type="text"
          placeholder="e.g. CS 3114"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b7bff]/40"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-200">Location</label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value as VTLocation)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8b7bff]/40"
        >
          {VT_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-200">Description (optional)</label>
        <input
          type="text"
          placeholder="e.g. Working on HW3, bring your notes"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b7bff]/40"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-200">Max group size</label>
        <input
          type="number"
          min={2}
          max={20}
          value={maxSize}
          onChange={(e) => setMaxSize(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8b7bff]/40"
        />
      </div>

      {error && <p className="text-xs text-red-300">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[#8b7bff] py-2 text-sm font-semibold text-white hover:bg-[#7968ff] disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create group"}
      </button>
    </form>
  );
}
