// AI-GENERATED: Cursor — circular avatar with image or initials for StudyGroup
"use client";

import Image from "next/image";
import { useMemo } from "react";

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return (name.slice(0, 2) || "?").toUpperCase();
}

type Props = {
  avatarUrl: string | null;
  name: string;
  sizePx: number;
  onPress?: () => void;
  className?: string;
};

export default function UserAvatar({
  avatarUrl,
  name,
  sizePx,
  onPress,
  className = "",
}: Props) {
  const initials = useMemo(() => initialsFromName(name), [name]);

  const body = avatarUrl ? (
    <Image
      src={avatarUrl}
      alt=""
      width={sizePx}
      height={sizePx}
      className="h-full w-full object-cover"
    />
  ) : (
    <span
      className="select-none font-semibold text-white"
      style={{ fontSize: Math.max(12, Math.round(sizePx * 0.35)) }}
    >
      {initials}
    </span>
  );

  const boxClass = `flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#6d1934] ring-2 ring-white/30 ${className}`;

  const style = {
    width: sizePx,
    height: sizePx,
    minWidth: sizePx,
    minHeight: sizePx,
  };

  if (onPress) {
    return (
      <button
        type="button"
        onClick={onPress}
        className={`${boxClass} cursor-pointer hover:ring-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white`}
        style={style}
        aria-label="Change profile photo"
      >
        {body}
      </button>
    );
  }

  return (
    <div className={boxClass} style={style}>
      {body}
    </div>
  );
}
