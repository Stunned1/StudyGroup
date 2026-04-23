// AI-GENERATED: Cursor — development route that seeds mock lobbies for the signed-in user
import { createClient } from "@/lib/supabase/server";
import { VT_LOCATIONS } from "@/lib/types";
import { NextResponse } from "next/server";

function isSeedingEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

export async function POST() {
  if (!isSeedingEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const templates = [
    { course_id: "CS 3114", location: "Torgersen Hall", description: "[MOCK] Data structures deep dive", max_size: 6, minutes: 120 },
    { course_id: "MATH 2114", location: "Newman Library", description: "[MOCK] Calc III quiz prep", max_size: 5, minutes: 90 },
    { course_id: "PHYS 2305", location: "McBryde Hall", description: "[MOCK] E&M problem set sprint", max_size: 4, minutes: 75 },
    { course_id: "STAT 4705", location: "Goodwin Hall", description: "[MOCK] Regression review session", max_size: 7, minutes: 110 },
    { course_id: "CS 3214", location: "Surge Space", description: "[MOCK] Systems design whiteboard prep", max_size: 5, minutes: 100 },
    { course_id: "CHEM 1035", location: "D2 (Dietrick)", description: "[MOCK] Lab report checkpoint", max_size: 4, minutes: 60 },
  ] as const;

  const seededRows = templates.map((item, index) => ({
    host_id: user.id,
    course_id: item.course_id,
    location: VT_LOCATIONS.includes(item.location as (typeof VT_LOCATIONS)[number])
      ? item.location
      : "Other",
    description: item.description,
    max_size: item.max_size,
    expires_at: new Date(now + (item.minutes + index * 8) * 60_000).toISOString(),
  }));

  const { error: deleteError } = await supabase
    .from("lobbies")
    .delete()
    .eq("host_id", user.id)
    .ilike("description", "[MOCK]%");

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("lobbies").insert(seededRows);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ inserted: seededRows.length });
}
