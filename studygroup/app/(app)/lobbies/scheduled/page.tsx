import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ScheduledLobby } from "@/lib/types";
import DeleteScheduleButton from "./DeleteScheduleButton";

export default async function ScheduledLobbiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: schedules } = await supabase
    .from("scheduled_lobbies")
    .select("*")
    .eq("host_id", user.id)
    .eq("triggered", false)
    .order("scheduled_for", { ascending: true });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#861F41]">Scheduled Lobbies</h1>
        <Link
          href="/lobbies/scheduled/new"
          className="bg-[#861F41] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#6d1934]"
        >
          + New Schedule
        </Link>
      </div>

      {(!schedules || schedules.length === 0) ? (
        <div className="text-center py-16 text-gray-500">
          <p className="mb-4">No upcoming scheduled lobbies.</p>
          <Link href="/lobbies/scheduled/new" className="text-[#861F41] hover:underline font-medium">
            Schedule one now
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {(schedules as ScheduledLobby[]).map((s) => {
            const when = new Date(s.scheduled_for);
            return (
              <li key={s.id} className="bg-white rounded-2xl shadow px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-900">{s.course_id}</span>
                  <span className="text-sm text-gray-600">{s.location}</span>
                  {s.description && (
                    <span className="text-xs text-gray-400">{s.description}</span>
                  )}
                  <span className="text-xs text-[#861F41] font-medium mt-1">
                    {when.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    {" at "}
                    {when.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                  </span>
                  <span className="text-xs text-gray-400">
                    {s.duration_minutes} min · up to {s.max_size} people
                  </span>
                </div>
                <DeleteScheduleButton id={s.id} />
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6">
        <Link href="/lobbies" className="text-sm text-gray-500 hover:underline">
          ← Back to lobbies
        </Link>
      </div>
    </main>
  );
}
