// AI-ASSISTED: Cursor — create lobby page (nav moved to (app) layout)
import NewLobbyForm from "@/components/NewLobbyForm";
import { getOfflineDevUserId, isOfflineDevModeEnabled } from "@/lib/dev-mode";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NewLobbyPage() {
  if (isOfflineDevModeEnabled()) {
    return (
      <main className="mx-auto max-w-lg px-4 py-12">
        <h1 className="mb-6 text-2xl font-bold text-[#861F41]">Create a Study Lobby</h1>
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Offline dev mode is enabled. Creating lobbies requires Supabase and may fail.
        </p>
        <NewLobbyForm userId={getOfflineDevUserId()} />
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-[#861F41]">Create a Study Lobby</h1>
      <NewLobbyForm userId={user.id} />
    </main>
  );
}
