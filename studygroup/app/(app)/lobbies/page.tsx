// AI-ASSISTED: Cursor — open lobbies list; host profile embed profiles(*) when avatar_url may be missing
// AI-ASSISTED: Cursor (Codex 5.3) — dashboard-style lobbies page container and heading polish
// AI-ASSISTED: Cursor (Codex 5.3) — dark-mode page typography and contrast updates
// AI-ASSISTED: ChatGPT (GPT-5) — keeps lobbies page typography aligned with the dark app shell
// AI-ASSISTED: ChatGPT (GPT-5) — exposes demo seeding prompt when open lobby data is sparse
// AI-ASSISTED: ChatGPT (GPT-5) — wires top search query into lobby results
// AI-ASSISTED: ChatGPT (GPT-5) — removes user-facing demo seed prompt from lobby page
// AI-ASSISTED: ChatGPT (GPT-5) — keeps lobbies visible until manually closed
// AI-ASSISTED: ChatGPT (GPT-5) — passes current memberships for deterministic join state
// AI-ASSISTED: ChatGPT (GPT-5) — adds visible create-group action on lobbies page
import LobbyList from "@/components/LobbyList";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

type Props = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function LobbiesPage({ searchParams }: Props) {
  const supabase = await createClient();
  const params = await searchParams;
  const searchQuery = params?.q?.trim() ?? "";
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // profiles(*) avoids referencing columns that are not migrated yet (e.g. avatar_url)
  const { data: lobbies, error: lobbiesError } = await supabase
    .from("lobbies")
    .select("*, profiles!lobbies_host_id_fkey(*), lobby_members!left(count)")
    .order("created_at", { ascending: false });

  if (lobbiesError) {
    console.error("lobbies fetch:", lobbiesError.message);
  }

  const { data: joinedMemberships, error: membershipsError } = await supabase
    .from("lobby_members")
    .select("lobby_id")
    .eq("user_id", user.id);

  if (membershipsError) {
    console.error("lobby memberships fetch:", membershipsError.message);
  }

  return (
    <main className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Open Study Lobbies
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Discover active groups and jump into the right session quickly.
          </p>
        </div>
        <Link
          href="/lobbies/new"
          className="inline-flex items-center justify-center rounded-xl bg-[#8b7bff] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-black/20 transition hover:bg-[#7968ff]"
        >
          Create group
        </Link>
      </div>
      <LobbyList
        lobbies={lobbies ?? []}
        userId={user.id}
        searchQuery={searchQuery}
        joinedLobbyIds={(joinedMemberships ?? []).map((row) => row.lobby_id)}
      />
    </main>
  );
}
