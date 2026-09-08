import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  instructions: z.string().min(1).max(20000),
  context: z.string().max(20000).optional(),
  priceUsd: z.number().positive().max(100000),
});

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
    const body = schema.parse(await req.json());
    const banned =
      /captcha\s*bypass|survey\s*farm|steal\s*account|account\s*theft|credential\s*stuffing/i.test(
        `${body.title}\n${body.description}\n${body.instructions}\n${body.context || ""}`
      );
    if (banned) {
      return NextResponse.json(
        {
          error:
            "This task appears to request disallowed activity (survey farming, CAPTCHA bypass, account theft, etc.).",
        },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        instructions: body.instructions,
        context: body.context || null,
        priceUsd: body.priceUsd,
        status: "QUEUED",
        userId: session.id,
      },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid task data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
