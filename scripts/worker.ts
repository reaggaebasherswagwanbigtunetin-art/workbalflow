/**
 * Background worker: polls for QUEUED tasks and processes them.
 * Run: bun run worker   (or: npx tsx scripts/worker.ts)
 */
import { processNextQueuedTask } from "../src/lib/worker";

const INTERVAL_MS = Number(process.env.WORKER_INTERVAL_MS || 3000);

async function tick() {
  try {
    const result = await processNextQueuedTask();
    if (result.processed) {
      console.log(`[worker] ${result.status} task ${result.taskId}`);
    }
  } catch (err) {
    console.error("[worker] error", err);
  }
}

console.log(`[worker] starting; polling every ${INTERVAL_MS}ms`);
tick();
setInterval(tick, INTERVAL_MS);
