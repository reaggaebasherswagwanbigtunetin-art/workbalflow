export function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(date);
}

export const statusStyles: Record<string, string> = {
  QUEUED: "bg-amber-50 text-amber-800 ring-amber-200",
  RUNNING: "bg-sky-50 text-sky-800 ring-sky-200",
  COMPLETED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  FAILED: "bg-rose-50 text-rose-800 ring-rose-200",
  UNPAID: "bg-amber-50 text-amber-800 ring-amber-200",
  PAID: "bg-emerald-50 text-emerald-800 ring-emerald-200",
};
