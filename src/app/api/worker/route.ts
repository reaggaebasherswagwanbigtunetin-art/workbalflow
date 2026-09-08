import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { processAllQueued } from "@/lib/worker";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const results = await processAllQueued(20);
  return NextResponse.json({ ok: true, results });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const results = await processAllQueued(5);
  return NextResponse.json({ ok: true, results });
}
