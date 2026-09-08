import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

export const runtime = "nodejs";

async function markInvoicePaid(invoiceId: string, sessionId?: string) {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return false;
  if (invoice.status === "PAID") return true;
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: "PAID",
      paidAt: new Date(),
      ...(sessionId ? { stripeSessionId: sessionId } : {}),
    },
  });
  return true;
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const body = await req.text();
  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      const sig = req.headers.get("stripe-signature");
      if (!sig) {
        return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
      }
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      // Local/dev without webhook secret: parse JSON (not for production)
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId =
      session.metadata?.invoiceId ||
      session.client_reference_id ||
      undefined;
    if (invoiceId) {
      await markInvoicePaid(invoiceId, session.id);
    } else if (session.id) {
      const bySession = await prisma.invoice.findFirst({
        where: { stripeSessionId: session.id },
      });
      if (bySession) await markInvoicePaid(bySession.id, session.id);
    }
  }

  return NextResponse.json({ received: true });
}
