import { prisma } from "./prisma";
import { completeTask } from "./completer";

export async function processNextQueuedTask() {
  const task = await prisma.task.findFirst({
    where: { status: "QUEUED" },
    orderBy: { createdAt: "asc" },
  });
  if (!task) return { processed: false as const };

  await prisma.task.update({
    where: { id: task.id },
    data: { status: "RUNNING", startedAt: new Date(), error: null },
  });

  try {
    const result = await completeTask({
      title: task.title,
      description: task.description,
      instructions: task.instructions,
      context: task.context,
    });

    const completed = await prisma.task.update({
      where: { id: task.id },
      data: {
        status: "COMPLETED",
        result,
        completedAt: new Date(),
        error: null,
      },
    });

    const existing = await prisma.invoice.findUnique({ where: { taskId: task.id } });
    if (!existing) {
      await prisma.invoice.create({
        data: {
          amountUsd: task.priceUsd,
          status: "UNPAID",
          taskId: task.id,
          userId: task.userId,
        },
      });
    }

    return { processed: true as const, taskId: completed.id, status: "COMPLETED" as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await prisma.task.update({
      where: { id: task.id },
      data: { status: "FAILED", error: message, completedAt: new Date() },
    });
    return { processed: true as const, taskId: task.id, status: "FAILED" as const, error: message };
  }
}

export async function processAllQueued(limit = 10) {
  const results = [];
  for (let i = 0; i < limit; i++) {
    const r = await processNextQueuedTask();
    if (!r.processed) break;
    results.push(r);
  }
  return results;
}

export async function retryFailedTask(taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");
  if (task.status !== "FAILED") throw new Error("Only FAILED tasks can be retried");
  await prisma.task.update({
    where: { id: taskId },
    data: { status: "QUEUED", error: null, result: null, startedAt: null, completedAt: null },
  });
  return processNextQueuedTask();
}
