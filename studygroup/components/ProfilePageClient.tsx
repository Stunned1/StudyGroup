// AI-GENERATED: Cursor — profile view with avatar upload (save/cancel) and major/year fields
// AI-ASSISTED: ChatGPT (GPT-5) — dark-mode profile settings surface styling
"use client";

import UserAvatar from "@/components/UserAvatar";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/database.types";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

type Props = {
  profile: Tables<"profiles">;
};

export default function ProfilePageClient({ profile }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [major, setMajor] = useState(profile.major ?? "");
  const [year, setYear] = useState(profile.year ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoMsg, setPhotoMsg] = useState<string | null>(null);

  const displayAvatarUrl = previewUrl ?? profile.avatar_url;

  const openPicker = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    setPhotoMsg(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoMsg("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setPhotoMsg("Image must be 2 MB or smaller.");
      return;
    }
    setPendingFile(file);
    setPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const cancelPhoto = useCallback(() => {
    setPendingFile(null);
    setPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setPhotoMsg(null);
  }, []);

  const savePhoto = useCallback(async () => {
    if (!pendingFile) return;
    setPhotoSaving(true);
    setPhotoMsg(null);
    const ext = pendingFile.name.split(".").pop()?.toLowerCase();
    const safeExt =
      ext && ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
    const path = `${profile.id}/avatar.${safeExt}`;

    const { error: upErr } = await supabase.storage.from("avatars").upload(path, pendingFile, {
      upsert: true,
      contentType: pendingFile.type || undefined,
    });

    if (upErr) {
      setPhotoMsg(upErr.message);
      setPhotoSaving(false);
      return;
    }

    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = pub.publicUrl;

    const { error: dbErr } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", profile.id);

    if (dbErr) {
      setPhotoMsg(dbErr.message);
      setPhotoSaving(false);
      return;
    }

    setPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setPendingFile(null);
    setPhotoSaving(false);
    router.refresh();
  }, [pendingFile, profile.id, router, supabase]);

  async function saveProfileFields() {
    setProfileSaving(true);
    setProfileMsg(null);
    const { error } = await supabase
      .from("profiles")
      .update({
        major: major.trim() || null,
        year: year.trim() || null,
      })
      .eq("id", profile.id);

    if (error) setProfileMsg(error.message);
    else setProfileMsg("Saved.");
    setProfileSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={onFileChange}
      />

      <section className="rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-sm shadow-black/20">
        <p className="mb-4 text-sm text-gray-400">
          Tap your photo to choose a new image, then Save or Cancel.
        </p>
        <div className="flex flex-col items-center gap-4">
          <UserAvatar
            avatarUrl={displayAvatarUrl}
            name={profile.name}
            sizePx={120}
            onPress={openPicker}
          />
          {pendingFile && (
            <div className="flex gap-3">
              <button
                type="button"
                disabled={photoSaving}
                onClick={() => void savePhoto()}
                className="rounded-lg bg-[#8b7bff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7968ff] disabled:opacity-50"
              >
                {photoSaving ? "Saving…" : "Save photo"}
              </button>
              <button
                type="button"
                disabled={photoSaving}
                onClick={cancelPhoto}
                className="rounded-lg border border-white/10 bg-[#0b1220] px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
          {photoMsg && (
            <p className="text-center text-sm text-red-300">{photoMsg}</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-sm shadow-black/20">
        <dl className="space-y-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Name
            </dt>
            <dd className="mt-1 text-lg font-semibold text-gray-100">{profile.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Major
            </dt>
            <dd className="mt-1">
              <input
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b7bff]/40"
                placeholder="e.g. Computer Science"
              />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Year
            </dt>
            <dd className="mt-1">
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b7bff]/40"
                placeholder="e.g. Junior"
              />
            </dd>
          </div>
        </dl>
        <button
          type="button"
          disabled={profileSaving}
          onClick={() => void saveProfileFields()}
          className="mt-6 rounded-lg bg-[#8b7bff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7968ff] disabled:opacity-50"
        >
          {profileSaving ? "Saving…" : "Save profile"}
        </button>
        {profileMsg && <p className="mt-2 text-sm text-gray-400">{profileMsg}</p>}
      </section>
    </div>
  );
}
