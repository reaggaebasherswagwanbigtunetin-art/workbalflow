import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { TaskForm } from "@/components/TaskForm";

export default async function NewTaskPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-brand-700 hover:underline">
          ← Back to tasks
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-ink-950">Create task</h1>
        <p className="mt-1 text-sm text-ink-500">
          Provide clear instructions. The agent only follows what you submit.
        </p>
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100 sm:p-8">
        <TaskForm />
      </div>
    </div>
  );
}
