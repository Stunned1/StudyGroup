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
    <nav className="flex items-center justify-between bg-[#861F41] px-6 py-4 text-white">
      <Link href="/lobbies" className="text-lg font-bold hover:opacity-90">
        StudyGroup
      </Link>
      <div className="flex items-center gap-4">
        {showNewLobby && (
          <Link
            href="/lobbies/new"
            className="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-[#861F41] hover:bg-gray-100"
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
            <div className="absolute right-0 z-50 mt-2 min-w-[11rem] rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg">
              <Link
                href="/profile"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                View profile
              </Link>
              <form action="/api/auth/signout" method="post" className="border-t border-gray-100">
                <button
                  type="submit"
                  className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
