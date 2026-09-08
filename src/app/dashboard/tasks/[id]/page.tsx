import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatUsd } from "@/lib/format";

export default async function TaskDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: { invoice: true },
  });
  if (!task) notFound();
  if (task.userId !== session.id && session.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-brand-700 hover:underline">
          ← Back to tasks
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-ink-950">{task.title}</h1>
          <StatusBadge status={task.status} />
        </div>
        <p className="mt-1 text-sm text-ink-500">
          {formatUsd(task.priceUsd)} · created {formatDate(task.createdAt)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-ink-100 sm:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Description</h2>
          <p className="mt-2 text-sm text-ink-800 whitespace-pre-wrap">{task.description}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-ink-100 sm:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Instructions</h2>
          <p className="mt-2 text-sm text-ink-800 whitespace-pre-wrap font-mono">{task.instructions}</p>
        </div>
        {task.context && (
          <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-ink-100 sm:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Context</h2>
            <p className="mt-2 text-sm text-ink-800 whitespace-pre-wrap">{task.context}</p>
          </div>
        )}
        {task.attachmentName && (
          <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-ink-100 sm:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Attachment</h2>
            <p className="mt-2 text-sm text-ink-800">
              <a
                href={`/api/tasks/${task.id}/attachment`}
                className="font-medium text-brand-700 hover:underline"
              >
                {task.attachmentName}
              </a>
              {task.attachmentMime ? (
                <span className="ml-2 text-xs text-ink-500">({task.attachmentMime})</span>
              ) : null}
            </p>
          </div>
        )}
      </div>

      {task.status === "FAILED" && task.error && (
        <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-200">
          <h2 className="text-sm font-semibold text-rose-900">Error</h2>
          <p className="mt-2 text-sm text-rose-800 font-mono">{task.error}</p>
        </div>
      )}

      {task.result && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Result</h2>
          <div className="prose-report">{task.result}</div>
        </div>
      )}

      {task.invoice && (
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-ink-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink-900">
              Invoice {formatUsd(task.invoice.amountUsd)}
            </p>
            <p className="text-xs text-ink-500 mt-0.5">
              Status: {task.invoice.status}
              {task.invoice.paidAt ? ` · paid ${formatDate(task.invoice.paidAt)}` : ""}
            </p>
          </div>
          <Link
            href="/dashboard/invoices"
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            View invoices →
          </Link>
        </div>
      )}
    </div>
  );
}
