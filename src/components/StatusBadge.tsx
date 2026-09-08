import { statusStyles } from "@/lib/format";

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || "bg-ink-50 text-ink-700 ring-ink-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      {status}
    </span>
  );
}
