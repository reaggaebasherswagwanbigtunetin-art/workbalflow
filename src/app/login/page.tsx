"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    router.push(data.role === "ADMIN" ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl bg-white p-8 shadow-card ring-1 ring-ink-100">
        <h1 className="text-2xl font-bold text-ink-950">Log in</h1>
        <p className="mt-1 text-sm text-ink-500">
          Demo: demo@workbal.dev / demo1234
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              defaultValue="demo@workbal.dev"
              className="w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              defaultValue="demo1234"
              className="w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-ink-500">
          No account?{" "}
          <Link href="/register" className="font-medium text-brand-700 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
