import { mkdir, appendFile } from "fs/promises";
import path from "path";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Send email via Resend when RESEND_API_KEY (+ EMAIL_FROM) are set.
 * Otherwise log to console and append to logs/emails.log for local demos.
 */
export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; mode: "resend" | "log" }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "WorkBal <onboarding@resend.dev>";

  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error("Resend error:", res.status, body);
        await logEmail(payload, `resend_error_${res.status}`);
        return { ok: false, mode: "resend" };
      }
      return { ok: true, mode: "resend" };
    } catch (err) {
      console.error("Resend send failed:", err);
      await logEmail(payload, "resend_exception");
      return { ok: false, mode: "resend" };
    }
  }

  await logEmail(payload, "demo");
  return { ok: true, mode: "log" };
}

async function logEmail(payload: EmailPayload, tag: string) {
  const line = [
    new Date().toISOString(),
    tag,
    `to=${payload.to}`,
    `subject=${JSON.stringify(payload.subject)}`,
    `text=${JSON.stringify(payload.text || payload.html.replace(/<[^>]+>/g, " ").slice(0, 500))}`,
  ].join(" | ");
  console.log("[email]", line);
  try {
    const dir = path.join(process.cwd(), "logs");
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, "emails.log"), line + "\n", "utf8");
  } catch (err) {
    console.warn("Could not write logs/emails.log:", err);
  }
}

export async function notifyTaskCompleted(opts: {
  to: string;
  name: string;
  taskTitle: string;
  taskId: string;
  appUrl: string;
}) {
  const url = `${opts.appUrl}/dashboard/tasks/${opts.taskId}`;
  return sendEmail({
    to: opts.to,
    subject: `WorkBal: "${opts.taskTitle}" is ready`,
    text: `Hi ${opts.name},\n\nYour task "${opts.taskTitle}" has been completed. View the result: ${url}\n\n— WorkBal`,
    html: `<p>Hi ${escapeHtml(opts.name)},</p>
<p>Your task <strong>${escapeHtml(opts.taskTitle)}</strong> has been completed.</p>
<p><a href="${url}">View the result</a></p>
<p>— WorkBal</p>`,
  });
}

export async function notifyInvoiceCreated(opts: {
  to: string;
  name: string;
  taskTitle: string;
  amountUsd: number;
  invoiceId: string;
  appUrl: string;
}) {
  const url = `${opts.appUrl}/dashboard/invoices`;
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(opts.amountUsd);
  return sendEmail({
    to: opts.to,
    subject: `WorkBal invoice ready: ${amount} for "${opts.taskTitle}"`,
    text: `Hi ${opts.name},\n\nAn invoice for ${amount} is ready for your completed task "${opts.taskTitle}". Pay here: ${url}\n\n— WorkBal`,
    html: `<p>Hi ${escapeHtml(opts.name)},</p>
<p>An invoice for <strong>${amount}</strong> is ready for your completed task <strong>${escapeHtml(opts.taskTitle)}</strong>.</p>
<p><a href="${url}">View &amp; pay invoices</a></p>
<p>— WorkBal</p>`,
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
