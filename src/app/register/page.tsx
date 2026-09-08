"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl bg-white p-8 shadow-card ring-1 ring-ink-100">
        <h1 className="text-2xl font-bold text-ink-950">Create account</h1>
        <p className="mt-1 text-sm text-ink-500">Client accounts can submit tasks and pay invoices.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Name</label>
            <input
              name="name"
              required
              className="w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
