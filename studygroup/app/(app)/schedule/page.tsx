// AI-GENERATED: ChatGPT (GPT-5) — authenticated weekly schedule page tied to the current user
// AI-ASSISTED: ChatGPT (GPT-5) — handles unapplied schedule migration without console errors
import ScheduleCalendar from "@/components/ScheduleCalendar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function isMissingScheduleTable(message: string) {
  return message.includes("schedule_classes") && message.includes("schema cache");
}

export default async function SchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: classes, error } = await supabase
    .from("schedule_classes")
    .select("*")
    .eq("user_id", user.id)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  const setupError =
    error && isMissingScheduleTable(error.message)
      ? "Schedule storage is not set up yet. Apply the Supabase migration `supabase/migrations/20260430120000_user_weekly_schedule.sql`, then reload this page."
      : null;

  if (error && !setupError) {
    console.error("schedule fetch:", error.message);
  }

  return (
    <main className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Weekly Schedule
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Keep a one-week view of the classes you attend during a normal week.
        </p>
      </div>
      <ScheduleCalendar
        initialClasses={setupError ? [] : classes ?? []}
        setupError={setupError}
        userId={user.id}
      />
    </main>
  );
}
