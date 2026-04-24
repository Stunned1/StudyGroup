// AI-ASSISTED: Cursor — open lobbies list; host profile embed profiles(*) when avatar_url may be missing
import LobbyList from "@/components/LobbyList";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LobbiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fire any of this user's scheduled lobbies that are now due
  const { data: dueSchedules } = await supabase
    .from("scheduled_lobbies")
    .select("*")
    .eq("host_id", user.id)
    .eq("triggered", false)
    .lte("scheduled_for", new Date().toISOString());

  if (dueSchedules && dueSchedules.length > 0) {
    for (const s of dueSchedules) {
      const expiresAt = new Date(
        new Date(s.scheduled_for).getTime() + s.duration_minutes * 60 * 1000
      ).toISOString();
      await supabase.from("lobbies").insert({
        host_id: s.host_id,
        course_id: s.course_id,
        location: s.location,
        description: s.description,
        max_size: s.max_size,
        expires_at: expiresAt,
      });
      await supabase
        .from("scheduled_lobbies")
        .update({ triggered: true, triggered_at: new Date().toISOString() })
        .eq("id", s.id);
    }
  }

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
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Open Study Lobbies</h2>
        <Link href="/lobbies/scheduled" className="text-sm text-[#861F41] hover:underline">
          My Schedules
        </Link>
      </div>
      <LobbyList lobbies={lobbies ?? []} userId={user.id} />
    </main>
  );
}
