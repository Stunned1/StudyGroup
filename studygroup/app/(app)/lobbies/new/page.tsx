// AI-ASSISTED: Cursor — create lobby page (nav moved to (app) layout)
// AI-ASSISTED: ChatGPT (GPT-5) — dark-mode create lobby page wrapper
// AI-ASSISTED: ChatGPT (GPT-5) — aligns creation page wording with study groups
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
      <h1 className="mb-2 text-2xl font-bold text-white">Create a study group</h1>
      <p className="mb-6 text-sm text-gray-400">
        Start a group for a class and it will show up under Groups.
      </p>
      <NewLobbyForm userId={user.id} />
    </main>
  );
}
