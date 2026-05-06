import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentLevel, learningGoals } = await req.json();
  if (!currentLevel) return NextResponse.json({ error: "currentLevel required" }, { status: 400 });

  const db = getDb();
  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await db.studentProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, currentLevel, learningGoals },
    update: { currentLevel, learningGoals },
  });

  return NextResponse.json({ ok: true });
}
