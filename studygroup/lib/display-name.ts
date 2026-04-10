// AI-GENERATED: Cursor — display name from profile row with Supabase auth fallbacks
import type { User } from "@supabase/supabase-js";

export function displayNameForUser(
  profile: { name?: string | null } | null | undefined,
  user: User
): string {
  const fromProfile = profile?.name?.trim();
  if (fromProfile) return fromProfile;

  const meta = user.user_metadata?.name;
  if (typeof meta === "string" && meta.trim()) return meta.trim();

  const emailLocal = user.email?.split("@")[0]?.trim();
  if (emailLocal) return emailLocal;

  return "Student";
}
