import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NewLobbyForm from "@/components/NewLobbyForm";

export default async function NewLobbyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-[#861F41] mb-6">Create a Study Lobby</h1>
        <NewLobbyForm userId={user.id} />
      </div>
    </main>
  );
}
