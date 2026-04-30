// AI-GENERATED: Cursor — shared shell for signed-in routes with profile avatar header
// AI-ASSISTED: Cursor — profile select("*") and displayNameForUser when avatar_url or profile fetch fails
// AI-ASSISTED: Cursor (Codex 5.3) — clean modern shell styling for sidebar + top search header
// AI-ASSISTED: Cursor (Codex 5.3) — full dark-mode shell with dark search/header surfaces
// AI-ASSISTED: Cursor (Codex 5.3) — adds header notifications button for demo-ready shell
// AI-ASSISTED: Cursor (Codex 5.3) — GroupHub-style light top header with icon actions
// AI-ASSISTED: ChatGPT (GPT-5) — restores dark app shell and keeps profile settings inside the profile page
// AI-ASSISTED: ChatGPT (GPT-5) — modern dark header spacing with SVG search and action icons
// AI-ASSISTED: ChatGPT (GPT-5) — pins header search/action columns to prevent refresh-time stretching
// AI-ASSISTED: ChatGPT (GPT-5) — right-aligns header action icons in the available header space
// AI-ASSISTED: ChatGPT (GPT-5) — tunes global search placeholder for recorded CS 3704 demo flow
import AppHeader from "@/components/AppHeader";
import UserAvatar from "@/components/UserAvatar";
import { displayNameForUser } from "@/lib/display-name";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      style={{ width: "20px", height: "20px" }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      style={{ width: "24px", height: "24px" }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      style={{ width: "24px", height: "24px" }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.06.06a2.15 2.15 0 0 1-3.04 3.04l-.06-.06a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.08 1.64V21.5a2.15 2.15 0 0 1-4.3 0v-.18a1.8 1.8 0 0 0-1.08-1.64 1.8 1.8 0 0 0-2 .36l-.06.06a2.15 2.15 0 0 1-3.04-3.04l.06-.06a1.8 1.8 0 0 0 .36-2A1.8 1.8 0 0 0 1.95 14H1.8a2.15 2.15 0 0 1 0-4.3h.15a1.8 1.8 0 0 0 1.64-1.08 1.8 1.8 0 0 0-.36-2l-.06-.06a2.15 2.15 0 0 1 3.04-3.04l.06.06a1.8 1.8 0 0 0 2 .36A1.8 1.8 0 0 0 9.35 2.3V2.15a2.15 2.15 0 0 1 4.3 0v.15a1.8 1.8 0 0 0 1.08 1.64 1.8 1.8 0 0 0 2-.36l.06-.06a2.15 2.15 0 0 1 3.04 3.04l-.06.06a1.8 1.8 0 0 0-.36 2A1.8 1.8 0 0 0 21.05 9.7h.15a2.15 2.15 0 0 1 0 4.3h-.15A1.8 1.8 0 0 0 19.4 15Z" />
    </svg>
  );
}

export default async function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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

  const displayName = displayNameForUser(profile, user);
  const avatarUrl = profile?.avatar_url ?? null;

  return (
    <div className="flex min-h-screen bg-[#080b12]">
      <div className="sticky top-0 h-screen w-64 flex-shrink-0">
        <AppHeader name={displayName} avatarUrl={avatarUrl} />
      </div>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0d1320]/95 px-5 py-4 backdrop-blur sm:px-7 lg:px-10">
          <div
            className="grid min-h-14 w-full items-center"
            style={{
              gridTemplateColumns: "minmax(0, 720px) minmax(max-content, 1fr)",
              columnGap: "48px",
            }}
          >
            <form action="/lobbies" method="get" className="min-w-0">
              <label htmlFor="global-search" className="sr-only">
                Search lobbies
              </label>
              <div className="relative text-gray-500">
                <span
                  className="pointer-events-none absolute top-1/2 z-10 -translate-y-1/2"
                  style={{ left: "20px" }}
                >
                  <SearchIcon />
                </span>
                <input
                  id="global-search"
                  name="q"
                  type="search"
                  placeholder="Search CS 3704, courses, groups, or locations..."
                  className="h-14 w-full rounded-full border border-white/10 bg-[#171b2d] pr-5 text-lg text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b7bff]/40"
                  style={{
                    WebkitAppearance: "none",
                    appearance: "none",
                    paddingLeft: "56px",
                  }}
                />
              </div>
            </form>
            <div
              className="ml-auto flex flex-shrink-0 items-center gap-5"
              style={{ justifySelf: "end" }}
            >
              <button
                type="button"
                aria-label="Open notifications"
                className="relative inline-flex items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                style={{ width: "44px", height: "44px" }}
              >
                <BellIcon />
                <span
                  className="absolute rounded-full bg-[#d9044d]"
                  style={{
                    right: "8px",
                    top: "8px",
                    width: "10px",
                    height: "10px",
                    boxShadow: "0 0 0 2px #0d1320",
                  }}
                />
              </button>
              <Link
                href="/profile"
                aria-label="Open profile settings"
                className="inline-flex items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                style={{ width: "44px", height: "44px" }}
              >
                <SettingsIcon />
              </Link>
              <Link
                href="/profile"
                className="rounded-full ring-2 ring-white/10 transition hover:ring-[#8b7bff]/60"
                aria-label="Open profile"
              >
                <UserAvatar avatarUrl={avatarUrl} name={displayName} sizePx={44} />
              </Link>
            </div>
          </div>
        </header>
        <div className="px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
