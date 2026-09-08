import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { ProcessQueueButton } from "@/components/ProcessQueueButton";
import { RetryButton } from "@/components/RetryButton";
import { formatDate, formatUsd } from "@/lib/format";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const tasks = await prisma.task.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const counts = {
    QUEUED: tasks.filter((t) => t.status === "QUEUED").length,
    RUNNING: tasks.filter((t) => t.status === "RUNNING").length,
    COMPLETED: tasks.filter((t) => t.status === "COMPLETED").length,
    FAILED: tasks.filter((t) => t.status === "FAILED").length,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-950">Admin — task queue</h1>
          <p className="mt-1 text-sm text-ink-500">
            All client tasks. Retry failed jobs or process the queue in-app.
          </p>
        </div>
        <ProcessQueueButton />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-ink-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{k}</p>
            <p className="mt-1 text-2xl font-bold text-ink-950">{v}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-100">
        <table className="min-w-full divide-y divide-ink-100 text-sm">
          <thead className="bg-ink-50/80 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {tasks.map((t) => (
              <tr key={t.id} className="hover:bg-brand-50/40">
                <td className="px-4 py-3 font-medium text-ink-900">
                  <Link href={`/dashboard/tasks/${t.id}`} className="hover:text-brand-700">
                    {t.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-600">{t.user.email}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-4 py-3 text-ink-600">{formatUsd(t.priceUsd)}</td>
                <td className="px-4 py-3 text-ink-500">{formatDate(t.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  {t.status === "FAILED" && <RetryButton taskId={t.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
