// AI-GENERATED: Cursor — server page that loads current user profile for viewing and editing
import ProfilePageClient from "@/components/ProfilePageClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/lobbies");
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold text-[#861F41]">Your profile</h1>
      <ProfilePageClient profile={profile} />
    </main>
  );
}
