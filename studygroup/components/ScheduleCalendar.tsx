// AI-GENERATED: ChatGPT (GPT-5) — weekly account schedule calendar with add and delete controls
// AI-ASSISTED: ChatGPT (GPT-5) — disables schedule mutations when the database table is missing
// AI-ASSISTED: ChatGPT (GPT-5) — traditional college timetable grid with time rows and weekday columns
// AI-ASSISTED: ChatGPT (GPT-5) — repeat presets and custom weekday selection for adding classes
// AI-ASSISTED: ChatGPT (GPT-5) — simplifies class repeats into daily and custom tabs
// AI-ASSISTED: ChatGPT (GPT-5) — makes schedule class deletion visible from blocks and side list
// AI-ASSISTED: ChatGPT (GPT-5) — groups repeated classes into one side-list entry
"use client";

import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/database.types";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ScheduleClass = Tables<"schedule_classes">;

type ScheduleClassGroup = {
  key: string;
  courseName: string;
  location: string | null;
  startTime: string;
  endTime: string;
  color: string;
  days: number[];
  ids: string[];
};

type Props = {
  initialClasses: ScheduleClass[];
  setupError?: string | null;
  userId: string;
};

const DAYS = [
  { value: 1, label: "MON" },
  { value: 2, label: "TUE" },
  { value: 3, label: "WED" },
  { value: 4, label: "THUR" },
  { value: 5, label: "FRI" },
] as const;

const CLASS_COLORS = ["#8b7bff", "#22c55e", "#f97316", "#06b6d4", "#ec4899"];
const START_HOUR = 8;
const END_HOUR = 20;
const SLOT_MINUTES = 30;
const ROW_HEIGHT_PX = 34;
const WEEKDAY_VALUES = DAYS.map((day) => day.value);
const TIME_MARKERS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, index) => START_HOUR + index
);

function formatTime(value: string) {
  const [hourRaw, minuteRaw] = value.split(":");
  const hour = Number(hourRaw);
  const minute = minuteRaw ?? "00";
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
}

function durationLabel(start: string, end: string) {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

function minutesFromTime(value: string) {
  const [hourRaw, minuteRaw] = value.split(":");
  return Number(hourRaw) * 60 + Number(minuteRaw ?? "0");
}

function gridRowForTime(value: string) {
  const minutes = minutesFromTime(value);
  const min = START_HOUR * 60;
  const max = END_HOUR * 60;
  const clamped = Math.min(Math.max(minutes, min), max);
  return Math.floor((clamped - min) / SLOT_MINUTES) + 2;
}

function timeLabel(hour: number) {
  const suffix = hour >= 12 ? "p.m." : "a.m.";
  const displayHour = hour % 12 || 12;
  return `${displayHour} ${suffix}`;
}

function dayLabel(value: number) {
  return DAYS.find((day) => day.value === value)?.label ?? "DAY";
}

export default function ScheduleCalendar({
  initialClasses,
  setupError,
  userId,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [courseName, setCourseName] = useState("");
  const [location, setLocation] = useState("");
  const [repeatMode, setRepeatMode] = useState<"daily" | "custom">("daily");
  const [selectedDays, setSelectedDays] = useState<number[]>([...WEEKDAY_VALUES]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:15");
  const [color, setColor] = useState(CLASS_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const weekdayClasses = useMemo(() => {
    return initialClasses
      .filter((item) => item.day_of_week >= 1 && item.day_of_week <= 5)
      .sort((a, b) =>
        a.day_of_week === b.day_of_week
          ? a.start_time.localeCompare(b.start_time)
          : a.day_of_week - b.day_of_week
      );
  }, [initialClasses]);

  const classGroups = useMemo(() => {
    const groups = new Map<string, ScheduleClassGroup>();

    for (const item of weekdayClasses) {
      const key = [
        item.course_name,
        item.location ?? "",
        item.start_time,
        item.end_time,
        item.color,
      ].join("|");
      const existing = groups.get(key);

      if (existing) {
        existing.days.push(item.day_of_week);
        existing.ids.push(item.id);
      } else {
        groups.set(key, {
          key,
          courseName: item.course_name,
          location: item.location,
          startTime: item.start_time,
          endTime: item.end_time,
          color: item.color,
          days: [item.day_of_week],
          ids: [item.id],
        });
      }
    }

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        days: [...group.days].sort((a, b) => a - b),
      }))
      .sort((a, b) =>
        a.days[0] === b.days[0]
          ? a.startTime.localeCompare(b.startTime)
          : a.days[0] - b.days[0]
      );
  }, [weekdayClasses]);

  function toggleDay(day: number) {
    setSelectedDays((current) => {
      if (!current.includes(day)) return [...current, day].sort((a, b) => a - b);

      const next = current.filter((value) => value !== day);
      return next.length > 0 ? next : current;
    });
  }

  function updateRepeatMode(mode: "daily" | "custom") {
    setRepeatMode(mode);
    if (mode === "daily") {
      setSelectedDays([...WEEKDAY_VALUES]);
    } else if (selectedDays.length === WEEKDAY_VALUES.length) {
      setSelectedDays([1]);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (setupError) return;
    setSaving(true);
    setMessage(null);

    const normalizedCourse = courseName.trim();
    if (!normalizedCourse) {
      setMessage("Add a class name first.");
      setSaving(false);
      return;
    }

    if (selectedDays.length === 0) {
      setMessage("Choose at least one day.");
      setSaving(false);
      return;
    }

    if (startTime >= endTime) {
      setMessage("End time must be after start time.");
      setSaving(false);
      return;
    }

    const rows = selectedDays.map((day) => ({
      user_id: userId,
      course_name: normalizedCourse,
      location: location.trim() || null,
      day_of_week: day,
      start_time: startTime,
      end_time: endTime,
      color,
    }));

    const { error } = await supabase.from("schedule_classes").insert(rows);

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setCourseName("");
    setLocation("");
    setRepeatMode("daily");
    setSelectedDays([...WEEKDAY_VALUES]);
    setSaving(false);
    router.refresh();
  }

  async function deleteClasses(classIds: string[], deletingKey: string) {
    if (setupError) return;
    setDeletingId(deletingKey);
    setMessage(null);
    const { error } = await supabase
      .from("schedule_classes")
      .delete()
      .in("id", classIds)
      .eq("user_id", userId);

    if (error) {
      setMessage(error.message);
      setDeletingId(null);
      return;
    }

    setDeletingId(null);
    router.refresh();
  }

  async function deleteClass(classId: string) {
    await deleteClasses([classId], classId);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#111827] p-4 shadow-sm shadow-black/20 sm:p-5">
        {setupError && (
          <div className="mb-4 rounded-xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            {setupError}
          </div>
        )}
        <div className="overflow-x-auto">
          <div
            className="relative grid min-w-[900px] overflow-hidden rounded-lg border-2 border-[#111827] bg-white text-[#111827]"
            style={{
              gridTemplateColumns: `92px repeat(${DAYS.length}, minmax(160px, 1fr))`,
              gridTemplateRows: `42px repeat(${(END_HOUR - START_HOUR) * 2}, ${ROW_HEIGHT_PX}px)`,
            }}
          >
            <div className="border-b-2 border-r-2 border-[#111827] bg-[#f8fafc]" />
            {DAYS.map((day) => (
              <div
                key={day.value}
                className="flex items-center justify-center border-b-2 border-r-2 border-[#111827] bg-[#f8fafc] text-sm font-bold last:border-r-0"
              >
                {day.label}
              </div>
            ))}

            {TIME_MARKERS.map((hour) => (
              <div
                key={hour}
                className="flex items-start justify-center border-r-2 border-t-2 border-[#111827] bg-[#f8fafc] pt-2 text-sm font-semibold"
                style={{
                  gridColumn: 1,
                  gridRow: `${(hour - START_HOUR) * 2 + 2} / span 2`,
                }}
              >
                {timeLabel(hour)}
              </div>
            ))}

            {DAYS.map((day, dayIndex) =>
              Array.from({ length: (END_HOUR - START_HOUR) * 2 }, (_, slot) => (
                <div
                  key={`${day.value}-${slot}`}
                  className={`border-r-2 border-[#111827] bg-white last:border-r-0 ${
                    slot % 2 === 0 ? "border-t-2" : "border-t"
                  }`}
                  style={{
                    gridColumn: dayIndex + 2,
                    gridRow: slot + 2,
                  }}
                />
              ))
            )}

            {weekdayClasses.map((item) => {
              const dayIndex = DAYS.findIndex((day) => day.value === item.day_of_week);
              const startRow = gridRowForTime(item.start_time);
              const endRow = Math.max(startRow + 1, gridRowForTime(item.end_time));

              if (dayIndex < 0) return null;

              return (
                <article
                  key={item.id}
                  className="group relative z-10 m-0.5 flex flex-col items-center justify-center overflow-hidden border-2 border-[#111827] px-2 py-1 text-center shadow-sm"
                  style={{
                    gridColumn: dayIndex + 2,
                    gridRow: `${startRow} / ${endRow}`,
                    backgroundColor: item.color,
                  }}
                  title={`${item.course_name} ${durationLabel(item.start_time, item.end_time)}`}
                >
                  <div className="max-w-full truncate text-sm font-bold text-white drop-shadow">
                    {item.course_name}
                  </div>
                  <div className="mt-0.5 text-[11px] font-semibold text-white/90 drop-shadow">
                    {durationLabel(item.start_time, item.end_time)}
                  </div>
                  {item.location && (
                    <div className="max-w-full truncate text-[11px] font-medium text-white/85 drop-shadow">
                      {item.location}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => void deleteClass(item.id)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/35 text-white shadow-sm transition hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-white/80 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Delete ${item.course_name}`}
                    disabled={deletingId === item.id}
                  >
                    <svg
                      aria-hidden="true"
                      className="h-3 w-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m18 6-12 12" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        {weekdayClasses.length === 0 && (
          <p className="mt-4 rounded-xl border border-dashed border-white/10 bg-[#0b1220] px-4 py-6 text-center text-sm text-gray-400">
            Add a class to start building your weekly timetable.
          </p>
        )}
      </section>

      <aside className="rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-sm shadow-black/20">
        <h3 className="text-lg font-semibold text-white">Add class</h3>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-200">Class</label>
            <input
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g. CS 3114"
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b7bff]/40"
              disabled={Boolean(setupError)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-200">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. McBryde 100"
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b7bff]/40"
              disabled={Boolean(setupError)}
            />
          </div>
          <fieldset className="rounded-xl border border-white/10 bg-[#0b1220] p-3">
            <legend className="px-1 text-sm font-medium text-gray-200">Repeats</legend>
            <div className="grid grid-cols-2 rounded-lg bg-white/5 p-1">
              {(["daily", "custom"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => updateRepeatMode(mode)}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                    repeatMode === mode
                      ? "bg-[#8b7bff] text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-100"
                  }`}
                  aria-pressed={repeatMode === mode}
                  disabled={Boolean(setupError)}
                >
                  {mode === "daily" ? "Daily" : "Custom"}
                </button>
              ))}
            </div>

            {repeatMode === "daily" ? (
              <p className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-300">
                Every weekday, Monday through Friday.
              </p>
            ) : (
              <div className="mt-4">
                <div className="mb-2 text-sm font-medium text-gray-300">On</div>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => {
                    const selected = selectedDays.includes(day.value);

                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition ${
                          selected
                            ? "border-[#8b7bff] bg-[#8b7bff] text-white"
                            : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-100"
                        }`}
                        aria-pressed={selected}
                        disabled={Boolean(setupError)}
                      >
                        {day.label.slice(0, 2)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </fieldset>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-200">Starts</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8b7bff]/40"
                disabled={Boolean(setupError)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-200">Ends</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8b7bff]/40"
                disabled={Boolean(setupError)}
                required
              />
            </div>
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-gray-200">Color</legend>
            <div className="mt-2 flex gap-2">
              {CLASS_COLORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setColor(option)}
                  className={`h-8 w-8 rounded-full border transition ${
                    color === option ? "border-white" : "border-white/10"
                  }`}
                  disabled={Boolean(setupError)}
                  style={{ backgroundColor: option }}
                  aria-label={`Use class color ${option}`}
                />
              ))}
            </div>
          </fieldset>
          <button
            type="submit"
            disabled={saving || Boolean(setupError)}
            className="w-full rounded-lg bg-[#8b7bff] py-2 text-sm font-semibold text-white hover:bg-[#7968ff] disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add to schedule"}
          </button>
          {message && <p className="text-sm text-red-300">{message}</p>}
        </form>

        {weekdayClasses.length > 0 && (
          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-white">Your classes</h4>
              <span className="text-xs text-gray-500">
                {classGroups.length} {classGroups.length === 1 ? "entry" : "entries"}
              </span>
            </div>
            <div className="space-y-2">
              {classGroups.map((group) => (
                <div
                  key={group.key}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2"
                >
                  <span
                    className="h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: group.color }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-gray-100">
                      {group.courseName}
                    </div>
                    <div className="truncate text-xs text-gray-500">
                      {group.days.map(dayLabel).join(", ")} ·{" "}
                      {durationLabel(group.startTime, group.endTime)}
                      {group.location ? ` · ${group.location}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteClasses(group.ids, group.key)}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-red-300/20 bg-red-500/10 text-red-200 transition hover:border-red-300/40 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Delete ${group.courseName} on ${group.days
                      .map(dayLabel)
                      .join(", ")}`}
                    disabled={deletingId === group.key || Boolean(setupError)}
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="m19 6-1 14H6L5 6" />
                      <path d="M10 11v5" />
                      <path d="M14 11v5" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
