// AI-ASSISTED: Cursor — create lobby page (nav moved to (app) layout)
// AI-ASSISTED: ChatGPT (GPT-5) — dark-mode create lobby page wrapper
import NewLobbyForm from "@/components/NewLobbyForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NewLobbyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-white">Create a Study Lobby</h1>
      <NewLobbyForm userId={user.id} />
    </main>
  );
}
