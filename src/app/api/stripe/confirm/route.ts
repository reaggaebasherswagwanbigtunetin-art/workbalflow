import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, stripeConfigured } from "@/lib/stripe";

/**
 * Verify a Checkout Session after success redirect (useful when webhooks
 * are not configured in local development).
 * GET /api/stripe/confirm?session_id=cs_...
 */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
    if (checkout.payment_status !== "paid" && checkout.status !== "complete") {
      return NextResponse.json({
        ok: false,
        payment_status: checkout.payment_status,
        status: checkout.status,
      });
    }

    const invoiceId =
      checkout.metadata?.invoiceId || checkout.client_reference_id || null;

    let invoice = invoiceId
      ? await prisma.invoice.findUnique({ where: { id: invoiceId } })
      : await prisma.invoice.findFirst({ where: { stripeSessionId: sessionId } });

    if (!invoice || invoice.userId !== session.id) {
      // Admin-safe: still allow if session matches stored id for this user
      if (!invoice) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }
      if (invoice.userId !== session.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (invoice.status !== "PAID") {
      invoice = await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          stripeSessionId: sessionId,
        },
      });
    }

    return NextResponse.json({ ok: true, invoiceId: invoice.id, status: invoice.status });
  } catch (err) {
    console.error("Stripe confirm error:", err);
    const message = err instanceof Error ? err.message : "Confirm failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
