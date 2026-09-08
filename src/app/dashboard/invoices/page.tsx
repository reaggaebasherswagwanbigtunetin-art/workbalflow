import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { PayButton } from "@/components/PayButton";
import { StripeConfirm } from "@/components/StripeConfirm";
import { formatDate, formatUsd } from "@/lib/format";

export default async function InvoicesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const invoices = await prisma.invoice.findMany({
    where: { userId: session.id },
    include: { task: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink-950">Invoices</h1>
        <p className="mt-1 text-sm text-ink-500">
          Invoices are created automatically when a task completes.{" "}
          {process.env.STRIPE_SECRET_KEY
            ? "Stripe Checkout is configured."
            : "Mock pay is enabled (no Stripe key set)."}
        </p>
      </div>

      <Suspense fallback={null}>
        <StripeConfirm />
      </Suspense>

      <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-100">
        {invoices.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-500">No invoices yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-ink-100 text-sm">
            <thead className="bg-ink-50/80 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-brand-50/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/tasks/${inv.taskId}`}
                      className="font-medium text-ink-900 hover:text-brand-700"
                    >
                      {inv.task.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{formatUsd(inv.amountUsd)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-4 py-3 text-ink-500">{formatDate(inv.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    {inv.status === "UNPAID" ? (
                      <PayButton invoiceId={inv.id} />
                    ) : (
                      <span className="text-xs text-emerald-700 font-medium">
                        Paid{inv.paidAt ? ` ${formatDate(inv.paidAt)}` : ""}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
