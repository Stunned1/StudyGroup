// AI-GENERATED: ChatGPT (GPT-5) — joined groups page for the signed-in student's study groups
// AI-ASSISTED: ChatGPT (GPT-5) — adds create-group entry points to the Groups page
import LobbyList from "@/components/LobbyList";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: joinedMemberships, error: membershipsError } = await supabase
    .from("lobby_members")
    .select("lobby_id")
    .eq("user_id", user.id);

  if (membershipsError) {
    console.error("joined groups fetch:", membershipsError.message);
  }

  const joinedLobbyIds = (joinedMemberships ?? []).map((row) => row.lobby_id);

  const { data: lobbies, error: lobbiesError } = await supabase
    .from("lobbies")
    .select("*, profiles!lobbies_host_id_fkey(*), lobby_members!left(count)")
    .or(`host_id.eq.${user.id},id.in.(${joinedLobbyIds.join(",") || "00000000-0000-0000-0000-000000000000"})`)
    .order("created_at", { ascending: false });

  if (lobbiesError) {
    console.error("groups lobbies fetch:", lobbiesError.message);
  }

  const groupIds = Array.from(
    new Set([...(joinedLobbyIds ?? []), ...((lobbies ?? []).map((lobby) => lobby.id))])
  );

  return (
    <main className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Groups
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            View study groups you have joined or created.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/lobbies/new"
            className="inline-flex items-center justify-center rounded-xl bg-[#8b7bff] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-black/20 transition hover:bg-[#7968ff]"
          >
            Create group
          </Link>
          <Link
            href="/lobbies"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#111827] px-4 py-2.5 text-sm font-semibold text-gray-100 shadow-sm shadow-black/20 transition hover:border-[#8b7bff]/50 hover:bg-[#161f33]"
          >
            Browse lobbies
          </Link>
        </div>
      </div>
      {(lobbies ?? []).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-[#0f172a] px-6 py-12 text-center">
          <p className="text-sm font-semibold text-gray-100">
            You have not joined any study groups yet.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Create your own group or search open lobbies when you are ready to study.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
              href="/lobbies/new"
              className="inline-flex items-center justify-center rounded-xl bg-[#8b7bff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7968ff]"
            >
              Create group
            </Link>
            <Link
              href="/lobbies"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#111827] px-4 py-2.5 text-sm font-semibold text-gray-100 transition hover:border-[#8b7bff]/50 hover:bg-[#161f33]"
            >
              Find a group
            </Link>
          </div>
        </div>
      ) : (
        <LobbyList
          lobbies={lobbies ?? []}
          userId={user.id}
          joinedLobbyIds={groupIds}
        />
      )}
    </main>
  );
}
