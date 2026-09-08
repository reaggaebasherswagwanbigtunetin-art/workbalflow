import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { ProcessQueueButton } from "@/components/ProcessQueueButton";
import { formatDate, formatUsd } from "@/lib/format";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const tasks = await prisma.task.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-950">Your tasks</h1>
          <p className="mt-1 text-sm text-ink-500">
            Welcome back, {session.name}. Submit work for the agent to complete.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ProcessQueueButton />
          <Link
            href="/dashboard/tasks/new"
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-brand-700"
          >
            New task
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-100">
        {tasks.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-500">
            No tasks yet.{" "}
            <Link href="/dashboard/tasks/new" className="font-medium text-brand-700 hover:underline">
              Create your first task
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-ink-100 text-sm">
            <thead className="bg-ink-50/80 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-brand-50/40">
                  <td className="px-4 py-3 font-medium text-ink-900">{t.title}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-ink-600">{formatUsd(t.priceUsd)}</td>
                  <td className="px-4 py-3 text-ink-500">{formatDate(t.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/tasks/${t.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      View
                    </Link>
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
