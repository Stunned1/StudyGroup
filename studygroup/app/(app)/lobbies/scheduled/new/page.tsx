import ScheduledLobbyForm from "@/components/ScheduledLobbyForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NewScheduledLobbyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/lobbies/scheduled" className="text-sm text-[#861F41] hover:underline">
          ← My Schedules
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-[#861F41]">Schedule a Lobby</h1>
      <ScheduledLobbyForm userId={user.id} />
    </main>
  );
}
