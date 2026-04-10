// AI-GENERATED: Cursor — Next.js image config for Supabase Storage public URLs
import type { NextConfig } from "next";

let supabaseImageHost: string | undefined;
try {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (u) supabaseImageHost = new URL(u).hostname;
} catch {
  /* invalid env at build time */
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseImageHost
      ? [
          {
            protocol: "https",
            hostname: supabaseImageHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
