// AI-GENERATED: Cursor — shared shell for signed-in routes with profile avatar header
// AI-ASSISTED: Cursor — profile select("*") and displayNameForUser when avatar_url or profile fetch fails
import AppHeader from "@/components/AppHeader";
import { isOfflineDevModeEnabled } from "@/lib/dev-mode";
import { displayNameForUser } from "@/lib/display-name";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (isOfflineDevModeEnabled()) {
    return (
      <div className="flex min-h-screen flex-col bg-[#050914]">
        <AppHeader name="Developer" avatarUrl={null} />
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Use * so missing DB columns (e.g. avatar_url before migration) do not break the query
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const avatarUrl = profile?.avatar_url ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-[#050914]">
      <AppHeader
        name={displayNameForUser(profile, user)}
        avatarUrl={avatarUrl}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}
