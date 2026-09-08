"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RetryButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function retry() {
    setLoading(true);
    await fetch("/api/admin/retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={retry}
      disabled={loading}
      className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
    >
      {loading ? "Retrying…" : "Retry"}
    </button>
  );
}
