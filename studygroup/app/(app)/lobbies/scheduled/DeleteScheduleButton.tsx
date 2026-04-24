"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteScheduleButton({ id }: { id: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await supabase.from("scheduled_lobbies").delete().eq("id", id);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 shrink-0 mt-1"
    >
      {loading ? "Cancelling…" : "Cancel"}
    </button>
  );
}
