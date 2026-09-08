import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appBaseUrl, getStripe, stripeConfigured } from "@/lib/stripe";
import { z } from "zod";

const schema = z.object({
  invoiceId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { invoiceId } = schema.parse(await req.json());
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { task: true },
    });
    if (!invoice || invoice.userId !== session.id) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    if (invoice.status === "PAID") {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    if (stripeConfigured()) {
      const stripe = getStripe();
      const base = appBaseUrl();
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${base}/dashboard/invoices?paid=1&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/dashboard/invoices?canceled=1`,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: Math.round(invoice.amountUsd * 100),
              product_data: {
                name: `WorkBal: ${invoice.task.title}`,
                description: `Invoice for completed task`,
              },
            },
          },
        ],
        metadata: {
          invoiceId: invoice.id,
          taskId: invoice.taskId,
          userId: invoice.userId,
        },
        client_reference_id: invoice.id,
      });

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { stripeSessionId: checkoutSession.id },
      });

      if (!checkoutSession.url) {
        return NextResponse.json({ error: "Stripe session missing URL" }, { status: 502 });
      }
      return NextResponse.json({ ok: true, url: checkoutSession.url });
    }

    // Mock pay when Stripe keys are absent
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "PAID", paidAt: new Date() },
    });
    return NextResponse.json({ ok: true, mock: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("Pay error:", err);
    const message = err instanceof Error ? err.message : "Payment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
