import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LobbyList from "@/components/LobbyList";
import Link from "next/link";

export default async function LobbiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: lobbies } = await supabase
    .from("lobbies")
    .select("*, profiles(name), lobby_members(count)")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-[#861F41] text-white px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg">StudyGroup</span>
        <div className="flex gap-4 items-center text-sm">
          <Link href="/lobbies/new" className="bg-white text-[#861F41] font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-100">
            + New Lobby
          </Link>
          <form action="/api/auth/signout" method="post">
            <button className="opacity-80 hover:opacity-100">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Open Study Lobbies</h2>
        <LobbyList lobbies={lobbies ?? []} userId={user.id} />
      </div>
    </main>
  );
}
