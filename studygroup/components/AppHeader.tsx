// AI-GENERATED: Cursor — top nav with avatar dropdown: view profile and sign out
// AI-ASSISTED: Cursor (Codex 5.3) — responsive app sidebar with lobby navigation and profile settings access
// AI-ASSISTED: Cursor (Codex 5.3) — modernized clean sidebar styling with active nav state
// AI-ASSISTED: Cursor (Codex 5.3) — full dark-mode sidebar styling and navigation surfaces
// AI-ASSISTED: Cursor (Codex 5.3) — GroupHub-style light sidebar refresh
// AI-ASSISTED: ChatGPT (GPT-5) — dark sidebar navigation without a separate profile settings tab
// AI-ASSISTED: ChatGPT (GPT-5) — adds account schedule navigation tab
// AI-ASSISTED: ChatGPT (GPT-5) — removes new lobby from the primary sidebar navigation
// AI-ASSISTED: ChatGPT (GPT-5) — adds sidebar Groups tab for joined study groups
// AI-ASSISTED: ChatGPT (GPT-5) — adds visible sidebar create-group action
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserAvatar from "@/components/UserAvatar";

type Props = {
  name: string;
  avatarUrl: string | null;
};

export default function AppHeader({ name, avatarUrl }: Props) {
  const pathname = usePathname();
  const firstName = name.split(" ")[0] ?? name;

  return (
    <aside className="flex h-full w-full flex-col border-r border-white/10 bg-[#0d1320] text-gray-100">
      <div className="border-b border-white/10 px-6 py-6">
        <Link href="/lobbies" className="text-3xl font-bold tracking-tight text-white">
          StudyGroup
        </Link>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#8b7bff]">
          VT study hub
        </p>
      </div>

      <nav className="flex flex-col gap-2 px-4 py-5">
        <Link
          href="/lobbies/new"
          className="rounded-xl bg-[#8b7bff] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7968ff]"
        >
          Create group
        </Link>
        <Link
          href="/lobbies"
          className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
            pathname === "/lobbies"
              ? "bg-[#8b7bff] text-white"
              : "text-gray-400 hover:bg-white/5 hover:text-gray-100"
          }`}
        >
          Open lobbies
        </Link>
        <Link
          href="/groups"
          className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
            pathname === "/groups"
              ? "bg-[#8b7bff] text-white"
              : "text-gray-400 hover:bg-white/5 hover:text-gray-100"
          }`}
        >
          Groups
        </Link>
        <Link
          href="/schedule"
          className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
            pathname === "/schedule"
              ? "bg-[#8b7bff] text-white"
              : "text-gray-400 hover:bg-white/5 hover:text-gray-100"
          }`}
        >
          Schedule
        </Link>
      </nav>

      <div className="mt-auto border-t border-white/10 p-4">
        <Link
          href="/profile"
          className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 bg-[#111827] p-3 transition-colors hover:border-[#8b7bff]/50 hover:bg-[#161f33]"
          aria-label="Open profile"
        >
          <UserAvatar avatarUrl={avatarUrl} name={name} sizePx={32} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-100">{firstName}</p>
            <p className="text-xs text-gray-500">View profile</p>
          </div>
        </Link>
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-left text-sm font-medium text-gray-300 transition-colors hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
