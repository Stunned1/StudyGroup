// AI-ASSISTED: Cursor — create lobby page (nav moved to (app) layout)
import NewLobbyForm from "@/components/NewLobbyForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NewLobbyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#861F41]">Create a Study Lobby</h1>
        <Link href="/lobbies/scheduled/new" className="text-sm text-[#861F41] hover:underline">
          Schedule for later →
        </Link>
      </div>
      <NewLobbyForm userId={user.id} />
    </main>
  );
}
