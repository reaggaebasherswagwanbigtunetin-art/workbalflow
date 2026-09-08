import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ALLOWED_EXT,
  guessMime,
  isAllowedUpload,
  MAX_UPLOAD_BYTES,
  uploadsRoot,
} from "@/lib/attachments";
import { z } from "zod";

const jsonSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  instructions: z.string().min(1).max(20000),
  context: z.string().max(20000).optional(),
  priceUsd: z.number().positive().max(100000),
});

function bannedText(...parts: (string | null | undefined)[]) {
  return /captcha\s*bypass|survey\s*farm|steal\s*account|account\s*theft|credential\s*stuffing/i.test(
    parts.filter(Boolean).join("\n")
  );
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tasks = await prisma.task.findMany({
    where: session.role === "ADMIN" ? undefined : { userId: session.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const contentType = req.headers.get("content-type") || "";
    let title: string;
    let description: string;
    let instructions: string;
    let context: string | undefined;
    let priceUsd: number;
    let file: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      title = String(fd.get("title") || "");
      description = String(fd.get("description") || "");
      instructions = String(fd.get("instructions") || "");
      const ctxRaw = fd.get("context");
      context = ctxRaw ? String(ctxRaw) : undefined;
      priceUsd = Number(fd.get("priceUsd") || 0);
      const f = fd.get("attachment");
      if (f && typeof f !== "string" && f.size > 0) {
        file = f as File;
      }
      jsonSchema.parse({ title, description, instructions, context, priceUsd });
    } else {
      const body = jsonSchema.parse(await req.json());
      title = body.title;
      description = body.description;
      instructions = body.instructions;
      context = body.context;
      priceUsd = body.priceUsd;
    }

    if (bannedText(title, description, instructions, context)) {
      return NextResponse.json(
        {
          error:
            "This task appears to request disallowed activity (survey farming, CAPTCHA bypass, account theft, etc.).",
        },
        { status: 400 }
      );
    }

    let attachmentPath: string | null = null;
    let attachmentName: string | null = null;
    let attachmentMime: string | null = null;

    if (file) {
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { error: "Attachment too large (max 5MB)" },
          { status: 400 }
        );
      }
      const originalName = file.name || "upload";
      const mime = guessMime(originalName, file.type);
      if (!isAllowedUpload(originalName, mime)) {
        return NextResponse.json(
          {
            error:
              "Unsupported file type. Allowed: PDF, txt, md, csv, jpeg, png, gif, webp.",
          },
          { status: 400 }
        );
      }
      const ext = path.extname(originalName).toLowerCase() || ".bin";
      if (!ALLOWED_EXT.has(ext)) {
        return NextResponse.json({ error: "Unsupported file extension" }, { status: 400 });
      }

      const safeBase = path
        .basename(originalName, ext)
        .replace(/[^a-zA-Z0-9._-]+/g, "_")
        .slice(0, 80);
      const storedName = `${Date.now()}-${randomBytes(6).toString("hex")}-${safeBase}${ext}`;
      const dir = uploadsRoot();
      await mkdir(dir, { recursive: true });
      const abs = path.join(dir, storedName);
      const buf = Buffer.from(await file.arrayBuffer());
      await writeFile(abs, buf);

      attachmentPath = path.join("uploads", storedName);
      attachmentName = originalName;
      attachmentMime = mime;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        instructions,
        context: context || null,
        priceUsd,
        status: "QUEUED",
        userId: session.id,
        attachmentPath,
        attachmentName,
        attachmentMime,
      },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid task data" }, { status: 400 });
    }
    console.error("Create task error:", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
