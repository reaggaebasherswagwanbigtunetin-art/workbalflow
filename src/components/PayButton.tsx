"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PayButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/invoices/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Payment failed");
      return;
    }
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    router.refresh();
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={pay}
        disabled={loading}
        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Processing…" : "Pay"}
      </button>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
}
