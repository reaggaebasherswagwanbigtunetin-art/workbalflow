import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      // Lightweight Checkout Session stub via Stripe API (no SDK required)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const params = new URLSearchParams();
      params.append("mode", "payment");
      params.append("success_url", `${appUrl}/dashboard/invoices?paid=1`);
      params.append("cancel_url", `${appUrl}/dashboard/invoices?canceled=1`);
      params.append("line_items[0][price_data][currency]", "usd");
      params.append(
        "line_items[0][price_data][product_data][name]",
        `WorkBal: ${invoice.task.title}`
      );
      params.append(
        "line_items[0][price_data][unit_amount]",
        String(Math.round(invoice.amountUsd * 100))
      );
      params.append("line_items[0][quantity]", "1");
      params.append("metadata[invoiceId]", invoice.id);

      const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!stripeRes.ok) {
        const text = await stripeRes.text();
        return NextResponse.json(
          { error: `Stripe error: ${text}` },
          { status: 502 }
        );
      }
      const sessionData = (await stripeRes.json()) as { id: string; url: string };
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { stripeSessionId: sessionData.id },
      });
      // For MVP demo: also mark PAID when session created if you prefer mock;
      // here we return Checkout URL and leave status UNPAID until webhook (optional).
      // To keep UX working without webhooks, mark paid after session create in stub mode:
      if (process.env.STRIPE_AUTO_MARK_PAID === "true") {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: "PAID", paidAt: new Date() },
        });
      }
      return NextResponse.json({ ok: true, url: sessionData.url });
    }

    // Mock pay
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "PAID", paidAt: new Date() },
    });
    return NextResponse.json({ ok: true, mock: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
