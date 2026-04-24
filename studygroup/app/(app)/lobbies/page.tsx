// AI-ASSISTED: Cursor — open lobbies list; host profile embed profiles(*) when avatar_url may be missing
import LobbyList from "@/components/LobbyList";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LobbiesPage() {
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

  const { data: membershipRows, error: membershipError } = await supabase
    .from("lobby_members")
    .select("lobby_id")
    .eq("user_id", user.id);

  if (membershipError) {
    console.error("membership fetch:", membershipError.message);
  }

  const myLobbyIds = new Set<string>((membershipRows ?? []).map((row) => row.lobby_id));

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h2 className="mb-4 text-xl font-bold text-gray-800">Open Study Lobbies</h2>
      <LobbyList lobbies={lobbies ?? []} userId={user.id} myLobbyIds={[...myLobbyIds]} />
    </main>
  );
}
