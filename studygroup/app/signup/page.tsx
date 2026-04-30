// AI-ASSISTED: ChatGPT (GPT-5) — dark-mode signup screen styling
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!email.endsWith("@vt.edu")) {
      setError("Must use a @vt.edu email address.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/lobbies");
      router.refresh();
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080b12] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111827] p-8 shadow-lg shadow-black/30">
        <h1 className="mb-1 text-2xl font-bold text-white">StudyGroup</h1>
        <p className="mb-6 text-sm text-gray-400">Create your VT account</p>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b7bff]/40"
          />
          <input
            type="email"
            placeholder="hokie@vt.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b7bff]/40"
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b7bff]/40"
          />
          {error && <p className="text-xs text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[#8b7bff] py-2 text-sm font-semibold text-white hover:bg-[#7968ff] disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#c4bcff] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
