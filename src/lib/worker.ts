import { prisma } from "./prisma";
import { completeTask } from "./completer";
import { readAttachmentText } from "./attachments";
import { notifyInvoiceCreated, notifyTaskCompleted } from "./email";
import { appBaseUrl } from "./stripe";

export async function processNextQueuedTask() {
  const task = await prisma.task.findFirst({
    where: { status: "QUEUED" },
    orderBy: { createdAt: "asc" },
    include: { user: true },
  });
  if (!task) return { processed: false as const };

  await prisma.task.update({
    where: { id: task.id },
    data: { status: "RUNNING", startedAt: new Date(), error: null },
  });

  try {
    const attachmentText = await readAttachmentText({
      attachmentPath: task.attachmentPath,
      attachmentName: task.attachmentName,
      attachmentMime: task.attachmentMime,
    });

    const result = await completeTask({
      title: task.title,
      description: task.description,
      instructions: task.instructions,
      context: task.context,
      attachmentText,
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

    const appUrl = appBaseUrl();

    await notifyTaskCompleted({
      to: task.user.email,
      name: task.user.name,
      taskTitle: task.title,
      taskId: task.id,
      appUrl,
    }).catch((err) => console.warn("notifyTaskCompleted failed:", err));

    let invoice = await prisma.invoice.findUnique({ where: { taskId: task.id } });
    if (!invoice) {
      invoice = await prisma.invoice.create({
        data: {
          amountUsd: task.priceUsd,
          status: "UNPAID",
          taskId: task.id,
          userId: task.userId,
        },
      });

      await notifyInvoiceCreated({
        to: task.user.email,
        name: task.user.name,
        taskTitle: task.title,
        amountUsd: invoice.amountUsd,
        invoiceId: invoice.id,
        appUrl,
      }).catch((err) => console.warn("notifyInvoiceCreated failed:", err));
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
