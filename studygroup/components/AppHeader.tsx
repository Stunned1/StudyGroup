// AI-GENERATED: Cursor — top nav with avatar dropdown: view profile and sign out
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import UserAvatar from "@/components/UserAvatar";

type Props = {
  name: string;
  avatarUrl: string | null;
  showNewLobby?: boolean;
};

export default function AppHeader({
  name,
  avatarUrl,
  showNewLobby = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1220]/95 px-6 py-4 text-white backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
      <Link href="/lobbies" className="text-lg font-bold text-pink-400 hover:opacity-90">
        StudyGroup
      </Link>
      <div className="hidden min-w-[280px] flex-1 md:flex">
        <input
          type="text"
          placeholder="Search courses or groups..."
          className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>
      <div className="flex items-center gap-4">
        {showNewLobby && (
          <Link
            href="/lobbies/new"
            className="rounded-lg bg-pink-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-pink-500"
          >
            + New Lobby
          </Link>
        )}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-expanded={open}
            aria-haspopup="true"
            aria-label="Account menu"
          >
            <UserAvatar avatarUrl={avatarUrl} name={name} sizePx={40} />
          </button>
          {open && (
            <div className="absolute right-0 z-50 mt-2 min-w-[11rem] rounded-lg border border-white/10 bg-[#111827] py-1 text-sm shadow-lg">
              <Link
                href="/profile"
                className="block px-4 py-2 text-gray-100 hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                View profile
              </Link>
              <form action="/api/auth/signout" method="post" className="border-t border-white/10">
                <button
                  type="submit"
                  className="w-full px-4 py-2 text-left text-gray-100 hover:bg-white/5"
                >
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      </div>
    </nav>
  );
}
