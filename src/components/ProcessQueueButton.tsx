"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProcessQueueButton() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/worker", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || "Worker failed");
      return;
    }
    setMsg(
      data.results?.length
        ? `Processed ${data.results.length} task(s)`
        : "No queued tasks"
    );
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800 disabled:opacity-60"
      >
        {loading ? "Running…" : "Process queue"}
      </button>
      {msg && <span className="text-sm text-ink-500">{msg}</span>}
    </div>
  );
}
