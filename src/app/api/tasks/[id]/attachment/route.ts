import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const task = await prisma.task.findUnique({ where: { id: params.id } });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (task.userId !== session.id && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!task.attachmentPath || !task.attachmentName) {
    return NextResponse.json({ error: "No attachment" }, { status: 404 });
  }

  const abs = path.isAbsolute(task.attachmentPath)
    ? task.attachmentPath
    : path.join(process.cwd(), task.attachmentPath);

  // Prevent path traversal outside uploads/
  const uploads = path.join(process.cwd(), "uploads");
  const resolved = path.resolve(abs);
  if (!resolved.startsWith(uploads + path.sep) && resolved !== uploads) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const data = await readFile(resolved);
    return new NextResponse(data, {
      headers: {
        "Content-Type": task.attachmentMime || "application/octet-stream",
        "Content-Disposition": `inline; filename="${task.attachmentName.replace(/"/g, "")}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
}
