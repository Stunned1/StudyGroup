// AI-ASSISTED: Cursor — open lobbies list; host profile embed profiles(*) when avatar_url may be missing
import LobbyList from "@/components/LobbyList";
import type { LobbyRow } from "@/components/LobbyList";
import { getOfflineDevUserId, isOfflineDevModeEnabled } from "@/lib/dev-mode";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LobbiesPage() {
  if (isOfflineDevModeEnabled()) {
    const mockLobbies: LobbyRow[] = [
      {
        id: "offline-1",
        course_id: "CS 3114",
        location: "Torgersen Hall",
        description: "Algorithms and tree balancing session",
        max_size: 6,
        expires_at: new Date(Date.now() + 95 * 60_000).toISOString(),
        host_id: getOfflineDevUserId(),
        profiles: { name: "Aidan" },
        lobby_members: [{ count: 3 }],
      },
      {
        id: "offline-2",
        course_id: "BIOL 2604",
        location: "Newman Library",
        description: "Collaborative lab prep and review",
        max_size: 5,
        expires_at: new Date(Date.now() + 70 * 60_000).toISOString(),
        host_id: getOfflineDevUserId(),
        profiles: { name: "Taylor" },
        lobby_members: [{ count: 2 }],
      },
      {
        id: "offline-3",
        course_id: "MKTG 3104",
        location: "Pamplin Hall",
        description: "Pitch deck and final strategy walkthrough",
        max_size: 8,
        expires_at: new Date(Date.now() + 130 * 60_000).toISOString(),
        host_id: getOfflineDevUserId(),
        profiles: { name: "Jordan" },
        lobby_members: [{ count: 4 }],
      },
    ];

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <section className="mb-6 rounded-3xl border border-white/10 bg-gradient-to-r from-[#111827] via-[#1f2937] to-[#172554] p-6 text-white shadow-2xl shadow-black/30">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-pink-300">Academic excellence</p>
          <h2 className="text-3xl font-bold">Find your study group</h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-300">
            Offline dev mode is on, so this page is using local sample cards while Supabase is paused.
          </p>
        </section>
        <p className="mb-4 rounded-lg border border-amber-300/30 bg-amber-400/10 p-3 text-sm text-amber-100">
          Offline dev mode is enabled. Database writes and realtime are disabled until Supabase resumes.
        </p>
        <LobbyList lobbies={mockLobbies} userId={getOfflineDevUserId()} offlineMode />
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // profiles(*) avoids referencing columns that are not migrated yet (e.g. avatar_url)
  const { data: lobbies, error: lobbiesError } = await supabase
    .from("lobbies")
    .select("*, profiles!lobbies_host_id_fkey(*), lobby_members!left(count)")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (lobbiesError) {
    console.error("lobbies fetch:", lobbiesError.message);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <section className="mb-6 rounded-3xl border border-white/10 bg-gradient-to-r from-[#111827] via-[#1f2937] to-[#172554] p-6 text-white shadow-2xl shadow-black/30">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-pink-300">Academic excellence</p>
        <h2 className="text-3xl font-bold">Find your study group</h2>
        <p className="mt-2 max-w-2xl text-sm text-gray-300">
          Connect with focused peers and jump into active sessions near you.
        </p>
      </section>
      <LobbyList lobbies={lobbies ?? []} userId={user.id} />
    </main>
  );
}
