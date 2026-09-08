"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * On success redirect from Stripe Checkout, verify the session and mark the invoice PAID
 * (covers local dev when webhooks are not configured).
 */
export function StripeConfirm() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("session_id");
  const paid = params.get("paid");
  const canceled = params.get("canceled");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (canceled === "1") {
      setMessage("Checkout canceled — invoice remains unpaid.");
      return;
    }
    if (!sessionId || paid !== "1") return;

    let cancelled = false;
    (async () => {
      setMessage("Confirming payment…");
      const res = await fetch(`/api/stripe/confirm?session_id=${encodeURIComponent(sessionId)}`);
      const data = await res.json().catch(() => ({}));
      if (cancelled) return;
      if (res.ok && data.ok) {
        setMessage("Payment confirmed — invoice marked paid.");
        router.replace("/dashboard/invoices?paid=1");
        router.refresh();
      } else {
        setMessage(data.error || "Could not confirm payment; webhook may still update shortly.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, paid, canceled, router]);

  if (!message) return null;

  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm ring-1 ${
        canceled === "1"
          ? "bg-amber-50 text-amber-900 ring-amber-200"
          : "bg-emerald-50 text-emerald-900 ring-emerald-200"
      }`}
    >
      {message}
    </div>
  );
}
