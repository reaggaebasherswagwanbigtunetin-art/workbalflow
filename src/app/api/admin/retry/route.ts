import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { retryFailedTask } from "@/lib/worker";
import { z } from "zod";

const schema = z.object({
  taskId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { taskId } = schema.parse(await req.json());
    const result = await retryFailedTask(taskId);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Retry failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
