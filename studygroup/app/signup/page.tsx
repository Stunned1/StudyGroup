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
    <main className="min-h-screen flex items-center justify-center bg-[#861F41] px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[#861F41] mb-1">StudyGroup</h1>
        <p className="text-gray-500 text-sm mb-6">Create your VT account</p>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#861F41]"
          />
          <input
            type="email"
            placeholder="hokie@vt.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#861F41]"
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#861F41]"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#861F41] text-white rounded-lg py-2 text-sm font-semibold hover:bg-[#6d1934] disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[#861F41] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
