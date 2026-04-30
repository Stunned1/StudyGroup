// AI-ASSISTED: Cursor — open lobbies list; host profile embed profiles(*) when avatar_url may be missing
// AI-ASSISTED: Cursor (Codex 5.3) — dashboard-style lobbies page container and heading polish
// AI-ASSISTED: Cursor (Codex 5.3) — dark-mode page typography and contrast updates
// AI-ASSISTED: ChatGPT (GPT-5) — keeps lobbies page typography aligned with the dark app shell
// AI-ASSISTED: ChatGPT (GPT-5) — exposes demo seeding prompt when open lobby data is sparse
// AI-ASSISTED: ChatGPT (GPT-5) — wires top search query into lobby results
// AI-ASSISTED: ChatGPT (GPT-5) — removes user-facing demo seed prompt from lobby page
// AI-ASSISTED: ChatGPT (GPT-5) — keeps lobbies visible until manually closed
import LobbyList from "@/components/LobbyList";
import { createClient } from "@/lib/supabase/server";
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

  return (
    <main className="mx-auto w-full max-w-6xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Open Study Lobbies
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Discover active groups and jump into the right session quickly.
        </p>
      </div>
      <LobbyList
        lobbies={lobbies ?? []}
        userId={user.id}
        searchQuery={searchQuery}
      />
    </main>
  );
}
